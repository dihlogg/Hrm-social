import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePostDto {
    @ApiProperty()
    content: string;

    @ApiPropertyOptional({ type: [String], description: 'Images URL' })
    imageUrls?: string[];

    @ApiProperty() 
    status: string;
}
