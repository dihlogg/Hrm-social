import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from 'src/kafka/kafka.module';
import { Post } from './entities/post.entity';
import { PostsConsumer } from './posts.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), KafkaModule],
  controllers: [PostsController, PostsConsumer],
  providers: [PostsService],
  exports: [TypeOrmModule, PostsService],
})
export class PostsModule {}
