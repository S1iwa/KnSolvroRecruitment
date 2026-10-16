import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CocktailIngredientDto {
  @IsInt()
  ingredientId: number;

  @IsOptional()
  @IsNumber()
  amountValue?: number;

  @IsOptional()
  @IsString()
  amountUnit?: string;

  @IsOptional()
  @IsString()
  amountText?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class CreateCocktailDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  instructions: string;

  @IsInt()
  categoryId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CocktailIngredientDto)
  ingredients: CocktailIngredientDto[];
}
