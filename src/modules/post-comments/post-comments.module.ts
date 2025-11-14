import { Module } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { PostCommentsController } from './post-comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComment } from './entities/post-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostComment])],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
  exports: [TypeOrmModule, PostCommentsService],
})
export class PostCommentsModule {}
