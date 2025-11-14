import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';

@Controller('Reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post("CreateNewReaction")
  async create(@Body() createReactionDto: CreateReactionDto) {
    return this.reactionsService.create(createReactionDto)
  }

  @Get('GetAllReactions')
  async findAll() {
    return this.reactionsService.findAll()
  }

  @Get('GetReactionById/:id') 
  async findOne(@Param('id') id: string) {
    return this.reactionsService.findOne(id)
  }

  @Put('UpdateReactions/:id')
  async update(@Param('id') id: string, @Body() updateReactionDto: UpdateReactionDto) {
    return this.reactionsService.update(id, updateReactionDto)
  }

  @Delete('DeleteReaction/:id')
  async delete(@Param('id') id: string) {
    return this.reactionsService.delete(id)
  }
}
