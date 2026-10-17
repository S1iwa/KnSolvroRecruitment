import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CocktailIngredientDto {
  @ApiProperty({ example: 1, description: 'ID of the ingredient' })
  @IsInt()
  ingredientId: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Numeric amount value (must be positive)',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amountValue?: number;

  @ApiPropertyOptional({
    example: 'ml',
    description: 'Unit of measurement (e.g. ml, oz, tsp)',
  })
  @IsOptional()
  @IsString()
  amountUnit?: string;

  @ApiPropertyOptional({
    example: 'a pinch',
    description: 'Free-text amount description',
  })
  @IsOptional()
  @IsString()
  amountText?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Order/position of ingredient in recipe',
  })
  @IsOptional()
  @IsInt()
  order?: number;
}

export class CreateCocktailDto {
  @ApiProperty({
    example: 'Mojito',
    description: 'Cocktail name (min 3 characters)',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Muddle mint, add rum and top with soda water.',
    description: 'Step-by-step preparation instructions',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  instructions: string;

  @ApiProperty({ example: 1, description: 'ID of the cocktail category' })
  @IsInt()
  categoryId: number;

  @ApiProperty({
    type: [CocktailIngredientDto],
    description: 'List of ingredients with amounts',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CocktailIngredientDto)
  ingredients: CocktailIngredientDto[];
}
