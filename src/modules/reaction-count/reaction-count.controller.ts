import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReactionCountService } from './reaction-count.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SocialAuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Reaction Counts')
@ApiBearerAuth()
@UseGuards(SocialAuthGuard)
@Controller('ReactionCounts')
export class ReactionCountController {
  constructor(private readonly reactionCountService: ReactionCountService) {}

  @Get('GetByPost/:postId')
  async getByPost(@Param('postId') postId: string) {
    return this.reactionCountService.getByPost(postId);
  }

  @Get('GetByComment/:commentId')
  async getByComment(@Param('commentId') commentId: string) {
    return this.reactionCountService.getByComment(commentId);
  }
}
