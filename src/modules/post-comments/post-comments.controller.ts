import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';

@Controller('Comments')
export class PostCommentsController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  @Post('CreateNewComment')
  async create(@Body() createCommentDto: CreatePostCommentDto) {
    return this.postCommentsService.create(createCommentDto);
  }

  @Get('GetAllComments') 
  async findAll() {
    return this.postCommentsService.findAll();
  }

  @Get('GetCommentById/:id') 
  async findOne(@Param('id') id: string) {
    return this.postCommentsService.findOne(id)
  }

  @Put('UpdateComment/:id') 
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdatePostCommentDto) {
    return this.postCommentsService.update(id, updateCommentDto)
  }

  @Delete('DeleteComment/:id') 
  async delete(@Param('id') id: string) {
    return this.postCommentsService.delete(id)
  }
}
