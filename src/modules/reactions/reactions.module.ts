import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { KafkaModule } from 'src/kafka/kafka.module';
import { ReactionsBatchConsumerService } from './reactions.consumer';
import { ReactionsBatchProcessorService } from './processor/reactions-batch.processor';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction]), KafkaModule, HttpModule],
  controllers: [ReactionsController],
  providers: [ReactionsService, ReactionsBatchConsumerService, ReactionsBatchProcessorService],
  exports: [TypeOrmModule, ReactionsService]
})
export class ReactionsModule {}
