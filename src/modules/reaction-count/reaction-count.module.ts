import { Module } from '@nestjs/common';
import { ReactionCountService } from './reaction-count.service';
import { ReactionCountController } from './reaction-count.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionCount } from './entities/reaction-count.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([ReactionCount]), HttpModule],
  controllers: [ReactionCountController],
  providers: [ReactionCountService],
  exports: [TypeOrmModule, ReactionCountService]
})
export class ReactionCountModule {}
