import { ApiProperty } from "@nestjs/swagger";

export class CreateReactionDto {
    @ApiProperty()
    reactionType: string;

    @ApiProperty()
    postId?: string;

    @ApiProperty()
    postCommentId?: string;
}
