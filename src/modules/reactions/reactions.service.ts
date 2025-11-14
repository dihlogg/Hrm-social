import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction) private readonly repo: Repository<Reaction>,
  ) {}

  async create(createReactionDto: CreateReactionDto): Promise<Reaction> {
    const reaction = this.repo.create(createReactionDto);
    return await this.repo.save(reaction);
  }

  async findAll(): Promise<Reaction[]> {
    return await this.repo.find();
  }

  async findOne(id: string): Promise<Reaction> {
    const reaction = await this.repo.findOne({ where: { id } });
    if (!reaction) {
      throw new NotFoundException('This reaction not found');
    }
    return reaction;
  }

  async update(
    id: string,
    updateReactionDto: UpdateReactionDto,
  ): Promise<boolean> {
    const updateReaction = await this.repo.update(id, updateReactionDto);
    if (updateReaction.affected === 0) {
      throw new NotFoundException('This reaction not found');
    }
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const deleteReaction = await this.repo.delete(id);
    if (deleteReaction.affected === 0) {
      throw new NotFoundException('This reaction not found');
    }
    return true;
  }
}
