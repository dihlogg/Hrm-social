import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { KAFKA_TOPICS } from 'src/kafka/config/kafka-topics.constant';
import { ProducerService } from 'src/kafka/producers/producer.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>,
    private readonly producerService: ProducerService,
  ) {}

  // async create(createPostDto: CreatePostDto, accessToken: string): Promise<Post> {
  //   const post = this.repo.create(createPostDto);

  //   // pushlish event to hrm-base service get user action
  //  await this.producerService.produce(KAFKA_TOPICS.USER_ACTION_REQUESTED, {
  //     value: JSON.stringify({
  //       token: accessToken,
  //       action: 'CREATE_POST',
  //       payload: createPostDto
  //     }),
  //   });

  //   return post;
  // }

  async create(
    createPostDto: CreatePostDto,
    accessToken: string,
  ): Promise<Post> {
    const post = this.repo.create(createPostDto);

    post.id = uuidv4();

    await this.producerService.produce(KAFKA_TOPICS.USER_ACTION_REQUESTED, {
      key: post.id,
      value: JSON.stringify({
        token: accessToken,
        action: 'CREATE_POST',
        payload: {
          ...createPostDto,
          id: post.id,
        },
      }),
    });

    return post;
  }

  async savePost(postData: any, employee: any) {
    const post = this.repo.create({
      ...postData,
      employeeId: employee.employeeId,
      employeeFullName: employee.fullName,
    });
    return this.repo.save(post);
  }

  async findAll(): Promise<Post[]> {
    return await this.repo.find();
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('This Post not found');
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<boolean> {
    const updatePost = await this.repo.update(id, updatePostDto);
    if (updatePost.affected === 0) {
      throw new NotFoundException('This Post not found');
    }
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const deletePost = await this.repo.delete(id);
    if (deletePost.affected === 0) {
      throw new NotFoundException('This Post not found');
    }
    return true;
  }
}
