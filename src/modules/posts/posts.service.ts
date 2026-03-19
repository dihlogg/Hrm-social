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

  async getPostList(dto: PaginationDto, currentEmployeeId: string) {
    const { page = 1, pageSize = 10 } = dto;

    const query = this.repo
      .createQueryBuilder('post')
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
}
