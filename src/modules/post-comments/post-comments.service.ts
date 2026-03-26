import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostComment } from './entities/post-comment.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { paginateAndFormat } from 'src/utils/pagination/pagination.util';
import { ProducerService } from 'src/kafka/producers/producer.service';
import { KAFKA_TOPICS } from 'src/kafka/config/kafka-topics.constant';
import { Mention } from '../mentions/entities/mention.entity';

@Injectable()
export class PostCommentsService {
  constructor(
    @InjectRepository(PostComment)
    private readonly repo: Repository<PostComment>,
    private readonly producerService: ProducerService,
  ) {}

  async create(
    createCommentDto: CreatePostCommentDto,
    employeeInfo: any,
  ): Promise<PostComment> {
    const queryRunner = this.repo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const comment = queryRunner.manager.create(PostComment, {
        content: createCommentDto.content,
        postId: createCommentDto.postId,
        parentId: createCommentDto.parentId,
        employeeId: employeeInfo.employeeId,
        employeeFullName: employeeInfo.fullName,
        employeeAvatarUrl: employeeInfo.avatarUrl,
      });
      await queryRunner.manager.save(comment);

      let uniqueMentions: string[] = [];

      if (
        createCommentDto.mentionedEmployeeIds &&
        createCommentDto.mentionedEmployeeIds.length > 0
      ) {
        uniqueMentions = [
          ...new Set(createCommentDto.mentionedEmployeeIds),
        ].filter((id) => id !== employeeInfo.employeeId);

        const mentions = uniqueMentions.map((mentionedId) => {
          return queryRunner.manager.create(Mention, {
            mentionedEmployeeId: mentionedId,
            authorId: employeeInfo.employeeId,
            postCommentId: comment.id,
          });
        });
        await queryRunner.manager.save(mentions);
      }

      await queryRunner.commitTransaction();

      if (uniqueMentions.length > 0) {
        const eventPayload = {
          action: 'USER_MENTIONED',
          data: {
            sourceType: 'COMMENT',
            sourceId: comment.id,
            authorId: employeeInfo.employeeId,
            authorFullName: employeeInfo.fullName,
            authorAvatarUrl: employeeInfo.avatarUrl,
            mentionedIds: uniqueMentions,
            content: comment.content,
            createDate: new Date().toISOString(),
          },
        };

        await this.producerService.produce(KAFKA_TOPICS.USER_MENTIONED, {
          key: `COMMENT:${comment.id}`,
          value: JSON.stringify(eventPayload),
        });
      }

      return comment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<PostComment[]> {
    return await this.repo.find();
  }

  async findOne(id: string): Promise<PostComment> {
    const comment = await this.repo.findOne({
      where: { id },
      relations: ['children', 'reactionCounts'],
    });
    if (!comment) {
      throw new NotFoundException('This Comment not found');
    }
    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdatePostCommentDto,
    employeeId: string,
  ): Promise<boolean> {
    const comment = await this.findOne(id);

    if (comment.employeeId !== employeeId) {
      throw new ForbiddenException('You can only update your own comments');
    }
    const updateComment = await this.repo.update(id, updateCommentDto);
    if (updateComment.affected === 0) {
      throw new NotFoundException('This comment fot post not found');
    }
    return true;
  }

  async delete(id: string, employeeId: string): Promise<boolean> {
    const comment = await this.findOne(id);

    if (comment.employeeId !== employeeId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    const deleteComment = await this.repo.delete(id);
    if (deleteComment.affected === 0) {
      throw new NotFoundException('This comment for post not found');
    }
    return true;
  }

  async findByPost(
    postId: string,
    dto: PaginationDto,
    currentEmployeeId: string,
  ) {
    const { page = 1, pageSize = 10 } = dto;

    const query = this.repo
      .createQueryBuilder('comment')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentId IS NULL')
      .leftJoinAndSelect('comment.reactionCounts', 'reactionCounts')
      .leftJoinAndSelect(
        'comment.reactions',
        'currentReaction',
        'currentReaction.employeeId = :currentEmployeeId',
        { currentEmployeeId },
      )
      .loadRelationCountAndMap('comment.repliesCount', 'comment.children')
      .orderBy('comment.createDate', 'ASC');

    const result = await paginateAndFormat(query, {
      page: Number(page),
      pageSize: Number(pageSize),
      useQueryBuilder: true,
      queryBuilder: query,
    });

    result.data = result.data.map((comment: any) => {
      const myReaction =
        comment.reactions && comment.reactions.length > 0
          ? comment.reactions[0].reactionType
          : null;

      delete comment.reactions;

      return {
        ...comment,
        myReaction,
      };
    });

    return result;
  }

  async findReplies(
    commentId: string,
    dto: PaginationDto,
    currentEmployeeId: string,
  ) {
    const { page = 1, pageSize = 10 } = dto;

    const query = this.repo
      .createQueryBuilder('comment')
      .where('comment.parentId = :commentId', { commentId })
      .leftJoinAndSelect('comment.reactionCounts', 'reactionCounts')
      .leftJoinAndSelect(
        'comment.reactions',
        'currentReaction',
        'currentReaction.employeeId = :currentEmployeeId',
        { currentEmployeeId },
      )
      .orderBy('comment.createDate', 'ASC');

    const result = await paginateAndFormat(query, {
      page: Number(page),
      pageSize: Number(pageSize),
      useQueryBuilder: true,
      queryBuilder: query,
    });

    result.data = result.data.map((comment: any) => {
      const myReaction =
        comment.reactions && comment.reactions.length > 0
          ? comment.reactions[0].reactionType
          : null;
      delete comment.reactions;
      return { ...comment, myReaction };
    });

    return result;
  }
}
