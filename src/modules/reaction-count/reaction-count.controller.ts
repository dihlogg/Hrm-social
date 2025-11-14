import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReactionCountService } from './reaction-count.service';
import { CreateReactionCountDto } from './dto/create-reaction-count.dto';
import { UpdateReactionCountDto } from './dto/update-reaction-count.dto';

@Controller('reaction-count')
export class ReactionCountController {
  constructor(private readonly reactionCountService: ReactionCountService) {}

}
