import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterCategoriesDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search categories by name (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
