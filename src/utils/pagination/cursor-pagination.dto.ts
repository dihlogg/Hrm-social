import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CursorPaginationDto {
  @ApiPropertyOptional({
    default: 10,
    description: 'Records per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Cursor for pagination, base64-encoded Json string',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}
