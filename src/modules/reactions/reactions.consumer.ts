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
import { sleep } from 'src/utils/sleep';
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
  private readonly batchSize: number;
  private readonly batchHoldMs: number;
  private readonly batchRetryDelayMs: number;
  private smallBatchFirstSeenAt: number | null = null;
  private lastLoggedBatchSize: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly batchProcessor: ReactionsBatchProcessorService,
  ) {
    const broker =
      this.configService.get<string>('KAFKA_BROKER') || 'localhost:9092';
    this.batchSize = Number(
      this.configService.get<string>('BATCH_SIZE') || 100,
    );
    this.batchHoldMs = Number(
      this.configService.get<string>('BATCH_HOLD_MS') || 5000,
    );
    this.batchRetryDelayMs = Number(
      this.configService.get<string>('BATCH_RETRY_DELAY_MS') || 250,
    );

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

        if (messages.length < this.batchSize) {
          const now = Date.now();
          if (this.smallBatchFirstSeenAt === null) {
            this.smallBatchFirstSeenAt = now;
          }

          const elapsed = now - this.smallBatchFirstSeenAt;
          if (elapsed < this.batchHoldMs) {
            if (this.lastLoggedBatchSize !== messages.length) {
              this.logger.log(
                `Current batch has ${messages.length} messages`,
              );
              this.lastLoggedBatchSize = messages.length;
            }
            await heartbeat();
            await sleep(this.batchRetryDelayMs);
            return;
          }
        }

        this.smallBatchFirstSeenAt = null;
        this.lastLoggedBatchSize = 0;
        this.logger.log(`Processing batch of ${messages.length} reactions`);

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
          await this.batchProcessor.processBatch(latestActions);
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
