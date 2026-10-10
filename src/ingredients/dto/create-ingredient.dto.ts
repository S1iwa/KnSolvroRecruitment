import { IsBoolean, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  description: string;

  @IsBoolean()
  isAlcoholic: boolean;

  @IsString()
  @IsUrl()
  imageUrl: string;
}
