import { Module } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { PostCommentsController } from './post-comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComment } from './entities/post-comment.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([PostComment]), HttpModule],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
  exports: [TypeOrmModule, PostCommentsService],
})
export class PostCommentsModule {}
