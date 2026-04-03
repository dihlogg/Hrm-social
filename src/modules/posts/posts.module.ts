import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from '../../kafka/kafka.module';
import { Post } from './entities/post.entity';
import { HttpModule } from '@nestjs/axios';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), KafkaModule, HttpModule, CloudinaryModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [TypeOrmModule, PostsService],
})
export class PostsModule {}
