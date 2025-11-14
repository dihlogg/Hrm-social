import { PartialType } from '@nestjs/mapped-types';
import { CreateReactionCountDto } from './create-reaction-count.dto';

export class UpdateReactionCountDto extends PartialType(CreateReactionCountDto) {}
