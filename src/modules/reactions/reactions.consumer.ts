import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { KAFKA_TOPICS } from 'src/kafka/config/kafka-topics.constant';
import { ReactionEvent } from './interfaces/reaction.event.interface';
import {
  NormalizedAction,
  TargetType,
} from './interfaces/reaction-action.interface';
import { ReactionsBatchProcessorService } from './processor/reactions-batch.processor';

@Injectable()
export class ReactionsBatchConsumerService
  implements OnModuleInit, OnModuleDestroy
{
  private consumer: Consumer;
  private readonly logger = new Logger(ReactionsBatchConsumerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly batchProcessor: ReactionsBatchProcessorService,
  ) {
    const broker =
      this.configService.get<string>('KAFKA_BROKER') || 'localhost:9092';

    const kafka = new Kafka({ brokers: [broker] });
    this.consumer = kafka.consumer({ groupId: 'reactions-batch-group' });
  }

  private getActionKey(
    employeeId: string,
    targetType: TargetType,
    targetId: string,
  ): string {
    return `${employeeId}:${targetType}:${targetId}`;
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: KAFKA_TOPICS.REACTION_EVENTS,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachBatchAutoResolve: false,
      eachBatch: async ({
        batch,
        resolveOffset,
        heartbeat,
        commitOffsetsIfNecessary,
      }) => {
        const messages = batch.messages;
        if (messages.length === 0) return;

        this.logger.log(
          `Processing incoming messages immediately (count: ${messages.length})`,
        );

        const latestActionsMap = new Map<string, NormalizedAction>();
        for (const message of messages) {
          const raw = message.value?.toString();
          if (!raw) continue;

          let event: ReactionEvent;
          try {
            event = JSON.parse(raw) as ReactionEvent;
          } catch {
            continue;
          }

          if (event.action !== 'TOGGLE_REACTION' || !event.data) continue;

          const targetType: TargetType | null = event.data.postCommentId
            ? 'COMMENT'
            : event.data.postId
              ? 'POST'
              : null;
          const targetId = event.data.postCommentId || event.data.postId;

          if (
            !targetType ||
            !targetId ||
            !event.data.employeeId ||
            !event.data.reactionType
          )
            continue;

          const key = this.getActionKey(
            event.data.employeeId,
            targetType,
            targetId,
          );
          latestActionsMap.set(key, {
            employeeId: event.data.employeeId,
            employeeFullName: event.data.employeeFullName,
            reactionType: event.data.reactionType,
            targetType,
            targetId,
          });
        }

        const latestActions = Array.from(latestActionsMap.values());

        if (latestActions.length > 0) {
          try {
            await this.batchProcessor.processBatch(latestActions);
          } catch (error) {
            this.logger.error('Failed to process reaction messages', error);
            throw error;
          }
        }

        for (const message of messages) {
          resolveOffset(message.offset);
        }
        await commitOffsetsIfNecessary();
        await heartbeat();
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
