import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { Repository } from 'typeorm';
import { ProducerService } from 'src/kafka/producers/producer.service';
import { KAFKA_TOPICS } from 'src/kafka/config/kafka-topics.constant';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction) private readonly repo: Repository<Reaction>,
    private readonly producerService: ProducerService,
  ) {}

  async create(createReactionDto: CreateReactionDto, employeeInfo: any): Promise<any> {
    if (!createReactionDto.postId && !createReactionDto.postCommentId) {
      throw new BadRequestException('Either postId or postCommentId must be provided');
    }

    const partitionKey = createReactionDto.postCommentId
      ? `COMMENT:${createReactionDto.postCommentId}`
      : `POST:${createReactionDto.postId}`;

    const eventPayload = {
      action: 'TOGGLE_REACTION',
      data: {
        ...createReactionDto,
        employeeId: employeeInfo.employeeId,
        employeeFullName: employeeInfo.fullName,
        createDate: new Date().toISOString(),
      },
    };

    await this.producerService.produce(KAFKA_TOPICS.REACTION_EVENTS, {
      key: partitionKey,
      value: JSON.stringify(eventPayload),
    });

    return {
      success: true,
      message: 'Reaction is processed',
    };
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
