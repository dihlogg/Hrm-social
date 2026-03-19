import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReactionCount } from './entities/reaction-count.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReactionCountService {
  constructor(
    @InjectRepository(ReactionCount)
    private readonly repo: Repository<ReactionCount>,
  ) {}

  async getByPost(postId: string): Promise<ReactionCount[]> {
    return await this.repo.find({ where: { postId } });
  }

  async getByComment(postCommentId: string): Promise<ReactionCount[]> {
    return await this.repo.find({ where: { postCommentId } });
  }
}
