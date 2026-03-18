import { Injectable, Logger } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import {
  NormalizedAction,
  ReactionUpdate,
  TargetType,
} from '../interfaces/reaction-action.interface';
import { Reaction } from '../entities/reaction.entity';

@Injectable()
export class ReactionsBatchProcessorService {
  private readonly logger = new Logger(ReactionsBatchProcessorService.name);

  constructor(private readonly dataSource: DataSource) {}

  private getActionKey(
    employeeId: string,
    targetType: TargetType,
    targetId: string,
  ): string {
    return `${employeeId}:${targetType}:${targetId}`;
  }

  async processBatch(latestActions: NormalizedAction[]): Promise<void> {
    if (latestActions.length === 0) return;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employeeIds = [...new Set(latestActions.map((a) => a.employeeId))];
      const postIds = [
        ...new Set(
          latestActions
            .filter((a) => a.targetType === 'POST')
            .map((a) => a.targetId),
        ),
      ];
      const commentIds = [
        ...new Set(
          latestActions
            .filter((a) => a.targetType === 'COMMENT')
            .map((a) => a.targetId),
        ),
      ];

      const where: Array<Record<string, unknown>> = [];
      if (postIds.length > 0) {
        where.push({ employeeId: In(employeeIds), postId: In(postIds) });
      }
      if (commentIds.length > 0) {
        where.push({
          employeeId: In(employeeIds),
          postCommentId: In(commentIds),
        });
      }

      const existingReactions = where.length
        ? await queryRunner.manager.find(Reaction, { where })
        : [];

      const existingMap = new Map<string, Reaction>();
      for (const reaction of existingReactions) {
        const targetType: TargetType = reaction.postId ? 'POST' : 'COMMENT';
        const targetId = reaction.postId || reaction.postCommentId;
        if (!targetId) continue;
        const key = this.getActionKey(
          reaction.employeeId,
          targetType,
          targetId,
        );
        existingMap.set(key, reaction);
      }

      const reactionsToInsert: Array<Partial<Reaction>> = [];
      const reactionsToDelete: string[] = [];
      const reactionsToUpdate: ReactionUpdate[] = [];
      const countChanges: Record<string, number> = {};

      const updateCount = (
        targetType: TargetType,
        targetId: string,
        reactionType: string,
        amount: number,
      ) => {
        const key = `${targetType}:${targetId}:${reactionType}`;
        countChanges[key] = (countChanges[key] || 0) + amount;
      };

      for (const action of latestActions) {
        const key = this.getActionKey(
          action.employeeId,
          action.targetType,
          action.targetId,
        );
        const existing = existingMap.get(key);

        if (!existing) {
          reactionsToInsert.push({
            employeeId: action.employeeId,
            employeeFullName: action.employeeFullName,
            reactionType: action.reactionType,
            postId: action.targetType === 'POST' ? action.targetId : undefined,
            postCommentId:
              action.targetType === 'COMMENT' ? action.targetId : undefined,
          });
          updateCount(
            action.targetType,
            action.targetId,
            action.reactionType,
            1,
          );
          continue;
        }

        if (existing.reactionType === action.reactionType) {
          reactionsToDelete.push(existing.id);
          updateCount(
            action.targetType,
            action.targetId,
            existing.reactionType,
            -1,
          );
          continue;
        }

        reactionsToUpdate.push({
          id: existing.id,
          reactionType: action.reactionType,
        });
        updateCount(
          action.targetType,
          action.targetId,
          existing.reactionType,
          -1,
        );
        updateCount(action.targetType, action.targetId, action.reactionType, 1);
      }

      if (reactionsToInsert.length > 0) {
        await queryRunner.manager.insert(Reaction, reactionsToInsert);
      }
      if (reactionsToDelete.length > 0) {
        await queryRunner.manager.delete(Reaction, reactionsToDelete);
      }
      if (reactionsToUpdate.length > 0) {
        for (const updateData of reactionsToUpdate) {
          await queryRunner.manager.update(Reaction, updateData.id, {
            reactionType: updateData.reactionType,
          });
        }
      }

      for (const [key, changeAmount] of Object.entries(countChanges)) {
        if (changeAmount === 0) continue;
        const [targetType, targetId, reactionType] = key.split(':');
        const targetColumn = targetType === 'POST' ? 'postId' : 'postCommentId';
        const constraint =
          targetType === 'POST' ? 'UQ_POST_REACTION' : 'UQ_COMMENT_REACTION';

        await queryRunner.manager.query(
          `
          INSERT INTO "ReactionCounts" ("${targetColumn}", "reactionType", "count")
          VALUES ($1, $2, $3)
          ON CONFLICT ON CONSTRAINT "${constraint}"
          DO UPDATE SET "count" = GREATEST(0, "ReactionCounts"."count" + EXCLUDED."count")
        `,
          [targetId, reactionType, changeAmount],
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to process DB transaction', error as Error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
