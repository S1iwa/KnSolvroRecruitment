import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FilterCategoriesDto } from './dto/filter-categories.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – JWT token required',
  })
  @ApiResponse({ status: 403, description: 'Forbidden – ADMIN role required' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories with optional search (paginated)',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of categories' })
  findAll(@Query() query: FilterCategoriesDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category by ID' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category by ID (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – JWT token required',
  })
  @ApiResponse({ status: 403, description: 'Forbidden – ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category by ID (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – JWT token required',
  })
  @ApiResponse({ status: 403, description: 'Forbidden – ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
