import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.repo.create(createPostDto);
    return await this.repo.save(post)
  }

  async findAll(): Promise<Post[]> {
    return await this.repo.find();
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.repo.findOne({ where: {id}})
    if(!post) {
      throw new NotFoundException('This Post not found')
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<boolean> {
    const updatePost = await this.repo.update(id, updatePostDto)
    if(updatePost.affected === 0) {
      throw new NotFoundException('This Post not found')
    }
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const deletePost = await this.repo.delete(id)
    if(deletePost.affected === 0) {
      throw new NotFoundException('This Post not found')
    }
    return true;
  }
}
