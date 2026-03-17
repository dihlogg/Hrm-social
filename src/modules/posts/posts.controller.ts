import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { access } from 'fs';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('Posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiBearerAuth()
  @Post('CreateNewPost')
  async create(@Body() createPostDto: CreatePostDto, @Req() request: any) {
    const authHeader = Array.isArray(request.headers.authorization)
      ? request.headers.authorization[0]
      : request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is required');
    }

    const accessToken = authHeader.slice(7).trim();

    return this.postsService.create(createPostDto, accessToken);
  }

  @Get('GetAllPosts')
  async findAll() {
    return this.postsService.findAll();
  }

  @Get('GetPostById/:id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Put('UpdatePost/:id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete('DeletePost/:id')
  async delete(@Param('id') id: string) {
    return this.postsService.delete(id);
  }
}
