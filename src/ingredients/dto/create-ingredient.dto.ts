import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIngredientDto {
  @ApiProperty({
    example: 'Vodka',
    description: 'Ingredient name (min 3 characters)',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'A strong distilled alcoholic beverage',
    description: 'Description (min 3 characters)',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  description: string;

  @ApiProperty({
    example: true,
    description: 'Whether the ingredient contains alcohol',
  })
  @IsBoolean()
  isAlcoholic: boolean;

  @ApiPropertyOptional({
    example: 'https://example.com/vodka.jpg',
    description: 'URL to ingredient image',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;
}
