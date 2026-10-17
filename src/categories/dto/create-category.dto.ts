import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Longdrink',
    description: 'Category name (min 3 characters)',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;
}
