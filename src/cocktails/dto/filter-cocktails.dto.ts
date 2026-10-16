import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum CocktailSortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FilterCocktailsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search cocktails by name (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Filter by author (user) ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  authorId?: number;

  @ApiPropertyOptional({ description: 'Filter by ingredient ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ingredientId?: number;

  @ApiPropertyOptional({
    description: 'Filter by ingredient name (partial match)',
  })
  @IsOptional()
  @IsString()
  ingredientName?: string;

  @ApiPropertyOptional({
    description: 'Filter alcoholic (true) or non-alcoholic (false) cocktails',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1')
      return true;
    if (value === 'false' || value === false || value === 0 || value === '0')
      return false;
    return value;
  })
  @IsBoolean()
  isAlcoholic?: boolean;

  @ApiPropertyOptional({
    enum: CocktailSortBy,
    description: 'Field to sort by',
    default: CocktailSortBy.NAME,
  })
  @IsOptional()
  @IsEnum(CocktailSortBy)
  sortBy?: CocktailSortBy = CocktailSortBy.NAME;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Sort direction',
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
