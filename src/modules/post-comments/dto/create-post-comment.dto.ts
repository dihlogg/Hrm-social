import { ApiProperty } from "@nestjs/swagger";

export class CreatePostCommentDto {
    @ApiProperty()
    content: string; 

    @ApiProperty()
    postId: string;

    @ApiProperty()
    parentId?: string
}
