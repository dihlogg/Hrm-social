import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Req,
  Query,
} from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SocialAuthGuard } from 'src/common/guards/auth.guard';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(SocialAuthGuard)
@Controller('Comments')
export class PostCommentsController {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  @Post('CreateNewComment')
  async create(
    @Body() createCommentDto: CreatePostCommentDto,
    @Req() request: any,
  ) {
    const employeeInfo = request.user;
    return this.postCommentsService.create(createCommentDto, employeeInfo);
  }

  @Get('GetAllComments')
  async findAll() {
    return this.postCommentsService.findAll();
  }

  @Get('GetCommentsByPost/:postId')
  async findByPost(
    @Param('postId') postId: string,
    @Query() query: PaginationDto,
  ) {
    return this.postCommentsService.findByPost(postId, query);
  }

  @Get('GetCommentById/:id')
  async findOne(@Param('id') id: string) {
    return this.postCommentsService.findOne(id);
  }

  @Patch('UpdateComment/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdatePostCommentDto,
    @Req() request: any,
  ) {
    return this.postCommentsService.update(
      id,
      updateCommentDto,
      request.user.employeeId,
    );
  }

  @Delete('DeleteComment/:id')
  async delete(@Param('id') id: string, @Req() request: any) {
    return this.postCommentsService.delete(id, request.user.employeeId);
  }
}
