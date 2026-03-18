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

@Injectable()
export class PostCommentsService {
  constructor(
    @InjectRepository(PostComment)
    private readonly repo: Repository<PostComment>,
  ) {}

  async create(
    createCommentDto: CreatePostCommentDto,
    employeeInfo: any,
  ): Promise<PostComment> {
    const comment = this.repo.create({
      ...createCommentDto,
      employeeId: employeeInfo.employeeId,
      employeeFullName: employeeInfo.fullName,
    });
    return await this.repo.save(comment);
  }

  async findByPost(postId: string, dto: PaginationDto) {
    const { page = 1, pageSize = 10 } = dto;

    const query = this.repo
      .createQueryBuilder('comment')
      .where('comment.postId = :postId', { postId })
      .leftJoinAndSelect('comment.reactionCounts', 'reactionCounts')
      .leftJoinAndSelect('comment.children', 'children')
      .orderBy('comment.createDate', 'ASC');

    return paginateAndFormat(query, {
      page: Number(page),
      pageSize: Number(pageSize),
      useQueryBuilder: true,
      queryBuilder: query,
    });
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
}
