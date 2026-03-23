import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SocialAuthGuard } from 'src/common/guards/auth.guard';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { CursorPaginationDto } from 'src/utils/pagination/cursor-pagination.dto';
@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(SocialAuthGuard)
@Controller('Posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('CreateNewPost')
  async create(@Body() createPostDto: CreatePostDto, @Req() request: any) {
    const employeeInfo = request.user;
    return this.postsService.createPost(createPostDto, employeeInfo);
  }

  @Get('GetPostList')
  async getPostList(@Query() query: CursorPaginationDto, @Req() request: any) {
    const currentEmployeeId = request.user.employeeId;
    return this.postsService.getPostList(query, currentEmployeeId);
  }

  @Get('GetPostsByEmployee/:employeeId')
  async getPostsByEmployee(
    @Param('employeeId') employeeId: string,
    @Query() query: PaginationDto,
    @Req() request: any,
  ) {
    const currentEmployeeId = request.user.employeeId;
    return this.postsService.getPostsByEmployee(
      employeeId,
      query,
      currentEmployeeId,
    );
  }
  @Get('GetAllPosts')
  async findAll() {
    return this.postsService.findAll();
  }

  @Get('GetPostById/:id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch('UpdatePost/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() request: any,
  ) {
    const employeeId = request.user.employeeId;
    return this.postsService.update(id, updatePostDto, employeeId);
  }

  @Delete('DeletePost/:id')
  async delete(@Param('id') id: string, @Req() request: any) {
    const employeeId = request.user.employeeId;
    return this.postsService.delete(id, employeeId);
  }

  @Get('GetTopReactedPosts')
  async getTopReactedPosts(
    @Query() query: CursorPaginationDto,
    @Req() request: any,
  ) {
    const currentEmployeeId = request.user.employeeId;
    return this.postsService.getTopReactedPosts(query, currentEmployeeId);
  }

  @Get('GetTopCommentedPosts')
  async getTopCommentedPosts(
    @Query() query: CursorPaginationDto,
    @Req() request: any,
  ) {
    const currentEmployeeId = request.user.employeeId;
    return this.postsService.getTopCommentedPosts(query, currentEmployeeId);
  }
}
