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
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { FilterIngredientsDto } from './dto/filter-ingredients.dto';
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

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new ingredient (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Ingredient created successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – JWT token required',
  })
  @ApiResponse({ status: 403, description: 'Forbidden – ADMIN role required' })
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all ingredients with optional search and isAlcoholic filter',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of ingredients' })
  findAll(@Query() query: FilterIngredientsDto) {
    return this.ingredientsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single ingredient by ID' })
  @ApiResponse({ status: 200, description: 'Ingredient found' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an ingredient by ID (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Ingredient updated successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – JWT token required',
  })
  @ApiResponse({ status: 403, description: 'Forbidden – ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an ingredient by ID (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Ingredient deleted successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – JWT token required',
  })
  @ApiResponse({ status: 403, description: 'Forbidden – ADMIN role required' })
  @ApiResponse({ status: 404, description: 'Ingredient not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.remove(id);
  }
}
