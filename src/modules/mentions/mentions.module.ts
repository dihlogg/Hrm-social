import { Module } from '@nestjs/common';
import { MentionsService } from './mentions.service';
import { MentionsController } from './mentions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mention } from './entities/mention.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mention])],
  controllers: [MentionsController],
  providers: [MentionsService],
  exports: [TypeOrmModule, MentionsService]
})
export class MentionsModule {}
