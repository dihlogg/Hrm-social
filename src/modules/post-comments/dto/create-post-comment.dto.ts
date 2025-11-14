import { ApiProperty } from "@nestjs/swagger";

export class CreatePostCommentDto {
    @ApiProperty()
    employeeId: string;

    @ApiProperty()
    content: string; 

    @ApiProperty()
    postId: string;

    @ApiProperty()
    parentId?: string
}
