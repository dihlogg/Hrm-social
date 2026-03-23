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
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { paginateAndFormat } from 'src/utils/pagination/pagination.util';
import { paginateWithCursor } from 'src/utils/pagination/cursor-pagination.util';
import { CursorPaginationDto } from 'src/utils/pagination/cursor-pagination.dto';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    employeeInfo: any,
  ): Promise<Post> {
    const post = this.repo.create({
      ...createPostDto,
      employeeId: employeeInfo.employeeId,
      employeeFullName: employeeInfo.fullName,
      employeeAvatarUrl: employeeInfo.avatarUrl,
    });

    await this.repo.save(post);
    return post;
  }

  // async getPostList(dto: PaginationDto, currentEmployeeId: string) {
  //   const { page = 1, pageSize = 10 } = dto;

  //   const query = this.repo
  //     .createQueryBuilder('post')
  //     .leftJoinAndSelect('post.reactionCounts', 'reactionCounts')
  //     .leftJoinAndSelect(
  //       'post.reactions',
  //       'currentReaction',
  //       'currentReaction.employeeId = :currentEmployeeId',
  //       { currentEmployeeId },
  //     )
  //     .loadRelationCountAndMap('post.commentCount', 'post.postComments')
  //     .orderBy('post.createDate', 'DESC');

  //   return paginateAndFormat(query, {
  //     page: Number(page),
  //     pageSize: Number(pageSize),
  //     useQueryBuilder: true,
  //     queryBuilder: query,
  //   });
  // }

  async getPostList(dto: CursorPaginationDto, currentEmployeeId: string) {
    const query = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.reactionCounts', 'reactionCounts')
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
    const deletePost = await this.repo.delete(id);
    if (deletePost.affected === 0) {
      throw new NotFoundException('Failed to delete post');
    }
    return true;
  }

  async getTopReactedPosts(dto: CursorPaginationDto, currentEmployeeId: string) {
    const query = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.reactionCounts', 'reactionCounts')
      .leftJoinAndSelect(
        'post.reactions',
        'currentReaction',
        'currentReaction.employeeId = :currentEmployeeId',
        { currentEmployeeId },
      )
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

  async getTopCommentedPosts(dto: CursorPaginationDto, currentEmployeeId: string) {
    const query = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.reactionCounts', 'reactionCounts')
      .leftJoinAndSelect(
        'post.reactions',
        'currentReaction',
        'currentReaction.employeeId = :currentEmployeeId',
        { currentEmployeeId },
      )
      .loadRelationCountAndMap('post.totalComments', 'post.postComments')
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
