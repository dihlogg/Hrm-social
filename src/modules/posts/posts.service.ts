import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../utils/pagination/pagination.dto';
import { paginateAndFormat } from '../../utils/pagination/pagination.util';
import { paginateWithCursor } from '../../utils/pagination/cursor-pagination.util';
import { CursorPaginationDto } from '../../utils/pagination/cursor-pagination.dto';
import { Mention } from '../mentions/entities/mention.entity';
import { ProducerService } from '../../kafka/producers/producer.service';
import { KAFKA_TOPICS } from '../../kafka/config/kafka-topics.constant';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>,
    private readonly producerService: ProducerService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    employeeInfo: any,
  ): Promise<Post> {
    const queryRunner = this.repo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const post = queryRunner.manager.create(Post, {
        content: createPostDto.content,
        imageUrls: createPostDto.imageUrls,
        status: createPostDto.status,
        employeeId: employeeInfo.employeeId,
        employeeFullName: employeeInfo.fullName,
        employeeAvatarUrl: employeeInfo.avatarUrl,
      });
      await queryRunner.manager.save(post);

      let uniqueMentions: string[] = [];

      if (
        createPostDto.mentionedEmployeeIds &&
        createPostDto.mentionedEmployeeIds.length > 0
      ) {
        uniqueMentions = [
          ...new Set(createPostDto.mentionedEmployeeIds),
        ].filter((id) => id !== employeeInfo.employeeId);

        const mentions = uniqueMentions.map((mentionedId) => {
          return queryRunner.manager.create(Mention, {
            mentionedEmployeeId: mentionedId,
            authorId: employeeInfo.employeeId,
            postId: post.id,
          });
        });
        await queryRunner.manager.save(mentions);
      }

      await queryRunner.commitTransaction();

      if (uniqueMentions.length > 0) {
        const eventPayload = {
          action: 'USER_MENTIONED',
          data: {
            sourceType: 'POST',
            sourceId: post.id,
            authorId: employeeInfo.employeeId,
            authorFullName: employeeInfo.fullName,
            authorAvatarUrl: employeeInfo.avatarUrl,
            mentionedIds: uniqueMentions,
            content: post.content,
            createDate: new Date().toISOString(),
          },
        };

        await this.producerService.produce(KAFKA_TOPICS.USER_MENTIONED, {
          key: `POST:${post.id}`,
          value: JSON.stringify(eventPayload),
        });
      }

      return post;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPostList(dto: CursorPaginationDto, currentEmployeeId: string) {
    const query = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.reactionCounts', 'reactionCounts')
      .leftJoinAndSelect('post.mentions', 'mentions')
      .leftJoinAndSelect(
        'post.reactions',
        'currentReaction',
        'currentReaction.employeeId = :currentEmployeeId',
        { currentEmployeeId },
      )
      .loadRelationCountAndMap('post.commentCount', 'post.postComments');
    return paginateWithCursor(query, {
      limit: dto.limit!,
      cursor: dto.cursor,
      entityAlias: 'post',
      cursorColumn: 'createDate',
      idColumn: 'id',
      order: 'DESC',
    });
  }

  async getPostsByEmployee(
    employeeId: string,
    dto: PaginationDto,
    currentEmployeeId: string,
  ) {
    const { page = 1, pageSize = 10 } = dto;

    const query = this.repo
      .createQueryBuilder('post')
      .where('post.employeeId = :employeeId', { employeeId })
      .leftJoinAndSelect('post.reactionCounts', 'reactionCounts')
      .leftJoinAndSelect(
        'post.reactions',
        'currentReaction',
        'currentReaction.employeeId = :currentEmployeeId',
        { currentEmployeeId },
      )
      .orderBy('post.createDate', 'DESC');

    return paginateAndFormat(query, {
      page: Number(page),
      pageSize: Number(pageSize),
      useQueryBuilder: true,
      queryBuilder: query,
    });
  }

  async findAll(): Promise<Post[]> {
    return await this.repo.find({
      order: { createDate: 'DESC' },
      relations: ['reactionCounts'],
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.repo.findOne({
      where: { id },
      relations: ['postComments', 'reactionCounts'],
    });
    if (!post) {
      throw new NotFoundException('This Post not found');
    }
    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    employeeId: string,
  ): Promise<boolean> {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('This Post not found');
    }

    if (post.employeeId !== employeeId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatePost = await this.repo.update(id, updatePostDto);
    if (updatePost.affected === 0) {
      throw new NotFoundException('Failed to update post');
    }
    return true;
  }

  async delete(id: string, employeeId: string): Promise<boolean> {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('This Post not found');
    }

    if (post.employeeId !== employeeId) {
      throw new ForbiddenException('You can only update your own posts');
    }
    const imagesToDelete = post.imageUrls;
    const deletePost = await this.repo.delete(id);
    if (deletePost.affected === 0) {
      throw new NotFoundException('Failed to delete post');
    }
    if (imagesToDelete && imagesToDelete.length > 0) {
      this.cloudinaryService.deleteImagesByUrls(imagesToDelete).catch((err) => {
        console.error('Failed to clear Cloudinary images in background', err);
      });
    }
    return true;
  }

  async getTopReactedPosts(
    dto: CursorPaginationDto,
    currentEmployeeId: string,
  ) {
    const query = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.reactionCounts', 'reactionCounts')
      .leftJoinAndSelect(
        'post.reactions',
        'currentReaction',
        'currentReaction.employeeId = :currentEmployeeId',
        { currentEmployeeId },
      )
      .loadRelationCountAndMap('post.commentCount', 'post.postComments')
      .leftJoin(
        (subQuery) =>
          subQuery
            .select('rc."postId"', 'postId')
            .addSelect('SUM(rc.count)', 'total_reactions')
            .from('ReactionCounts', 'rc')
            .groupBy('rc."postId"'),
        'reaction_agg',
        'reaction_agg."postId" = post.id',
      )
      .addSelect(
        'COALESCE(reaction_agg.total_reactions, 0)',
        'sort_total_reactions',
      )
      .orderBy('sort_total_reactions', 'DESC');

    return paginateWithCursor(query, {
      limit: dto.limit!,
      cursor: dto.cursor,
      entityAlias: 'post',
      cursorColumn: 'createDate',
      idColumn: 'id',
      order: 'DESC',
    });
  }

  async getTopCommentedPosts(
    dto: CursorPaginationDto,
    currentEmployeeId: string,
  ) {
    const query = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.reactionCounts', 'reactionCounts')
      .leftJoinAndSelect(
        'post.reactions',
        'currentReaction',
        'currentReaction.employeeId = :currentEmployeeId',
        { currentEmployeeId },
      )
      .loadRelationCountAndMap('post.commentCount', 'post.postComments')
      .leftJoin(
        (subQuery) =>
          subQuery
            .select('pc."postId"', 'postId')
            .addSelect('COUNT(pc.id)', 'total_comments')
            .from('PostComments', 'pc')
            .groupBy('pc."postId"'),
        'comment_agg',
        'comment_agg."postId" = post.id',
      )
      .addSelect(
        'COALESCE(comment_agg.total_comments, 0)',
        'sort_total_comments',
      )
      .orderBy('sort_total_comments', 'DESC');

    return paginateWithCursor(query, {
      limit: dto.limit!,
      cursor: dto.cursor,
      entityAlias: 'post',
      cursorColumn: 'createDate',
      idColumn: 'id',
      order: 'DESC',
    });
  }
}
