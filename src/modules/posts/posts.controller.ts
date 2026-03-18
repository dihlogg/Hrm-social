import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SocialAuthGuard } from 'src/common/guards/auth.guard';

@Controller('Posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiBearerAuth()
  @UseGuards(SocialAuthGuard)
  @Post('CreateNewPost')
  async create(@Body() createPostDto: CreatePostDto, @Req() request: any) {
    const employeeInfo = request.user;
    return this.postsService.createPostSync(createPostDto, employeeInfo);
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
