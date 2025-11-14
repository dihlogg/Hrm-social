import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {
    @ApiProperty()
    employeeId: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    imageUrl?: string;

    @ApiProperty() 
    status: string;
}
