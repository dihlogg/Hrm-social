import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SocialAuthGuard } from 'src/common/guards/auth.guard';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
@ApiTags('Reactions')
@ApiBearerAuth()
@UseGuards(SocialAuthGuard)
@Controller('Reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('CreateNewReaction')
  async create(
    @Body() createReactionDto: CreateReactionDto,
    @Req() request: any,
  ) {
    const employeeInfo = request.user;
    return this.reactionsService.create(createReactionDto, employeeInfo);
  }

  @Get('GetAllReactions')
  async findAll() {
    return this.reactionsService.findAll();
  }

  @Get('GetReactionById/:id')
  async findOne(@Param('id') id: string) {
    return this.reactionsService.findOne(id);
  }

  @Put('UpdateReactions/:id')
  async update(
    @Param('id') id: string,
    @Body() updateReactionDto: UpdateReactionDto,
  ) {
    return this.reactionsService.update(id, updateReactionDto);
  }

  @Delete('DeleteReaction/:id')
  async delete(@Param('id') id: string) {
    return this.reactionsService.delete(id);
  }

  @Get('GetReactionsByPost/:postId')
  async getReactionsByPost(
    @Param('postId') postId: string,
    @Query() query: PaginationDto,
  ) {
    return this.reactionsService.getReactionsByPost(postId, query);
  }

  @Get('GetReactionsByComment/:commentId')
  async getReactionsByComment(
    @Param('commentId') commentId: string,
    @Query() query: PaginationDto,
  ) {
    return this.reactionsService.getReactionsByComment(commentId, query);
  }
}
