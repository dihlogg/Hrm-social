import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostCommentDto {
  @ApiProperty()
  content: string;

  @ApiProperty()
  postId: string;

  @ApiProperty()
  parentId?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'List of mentioned employee IDs',
  })
  mentionedEmployeeIds?: string[];
}
