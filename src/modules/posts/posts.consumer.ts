import { Controller, Logger } from '@nestjs/common';
import { Ctx, KafkaContext, MessagePattern, Payload } from '@nestjs/microservices';
import { DlqService } from 'src/kafka/dlq/dlq-handler.service';
import { KAFKA_TOPICS } from 'src/kafka/config/kafka-topics.constant';
import { retry } from 'src/utils/retry';
import { PostsService } from './posts.service';

@Controller()
export class PostsConsumer {
  private readonly logger = new Logger(PostsConsumer.name);

  constructor(
    private readonly postsService: PostsService,
    private readonly dlqService: DlqService,
  ) {}

  @MessagePattern(KAFKA_TOPICS.USER_ACTION_VALIDATED)
  async handleUserActionValidated(
    @Payload() data: any,
    @Ctx() context: KafkaContext,
  ) {
    const message = context.getMessage();
    try {
      this.logger.log('Received USER_ACTION_REQUESTED message');
      
      await retry(
        async () => {
          const { user, payload, action, employee } = data;

          if (action === 'CREATE_POST') {
            await this.postsService.savePost(payload, employee);
          }
        },
        {
          retries: 3,
          initialDelay: 1000,
        },
      );
    } catch (error) {
      this.logger.error('Failed to process USER_ACTION_REQUESTED. Sending to DLQ.');
      await this.dlqService.sendToDlq([message as any], context.getTopic(), error);
    }
  }
}