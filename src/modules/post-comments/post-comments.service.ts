import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostComment } from './entities/post-comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostCommentsService {
  constructor(
    @InjectRepository(PostComment)
    private readonly repo: Repository<PostComment>,
  ) {}

  async create(createCommentDto: CreatePostCommentDto): Promise<PostComment> {
    const comment = this.repo.create(createCommentDto);
    return await this.repo.save(comment);
  }

  async findAll(): Promise<PostComment[]> {
    return await this.repo.find();
  }

  async findOne(id: string): Promise<PostComment> {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('This Comment for Post not found');
    }
    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdatePostCommentDto,
  ): Promise<boolean> {
    const updateComment = await this.repo.update(id, updateCommentDto);
    if (updateComment.affected === 0) {
      throw new NotFoundException('This comment fot post not found');
    }
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const deleteComment = await this.repo.delete(id);
    if (deleteComment.affected === 0) {
      throw new NotFoundException('This comment for post not found');
    }
    return true;
  }
}
