import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CocktailsService } from './cocktails.service';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';
import { FilterCocktailsDto } from './dto/filter-cocktails.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('cocktails')
@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new cocktail (authenticated users)' })
  @ApiResponse({ status: 201, description: 'Cocktail created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or related record not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – JWT token required',
  })
  create(
    @CurrentUser() user: UserPayload,
    @Body() createCocktailDto: CreateCocktailDto,
  ) {
    return this.cocktailsService.create(createCocktailDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all cocktails with filtering, sorting and pagination',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of cocktails' })
  findAll(@Query() query: FilterCocktailsDto) {
    return this.cocktailsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single cocktail by ID' })
  @ApiResponse({ status: 200, description: 'Cocktail found' })
  @ApiResponse({ status: 404, description: 'Cocktail not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cocktailsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a cocktail by ID (author or ADMIN)' })
  @ApiResponse({ status: 200, description: 'Cocktail updated successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – must be author or ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Cocktail not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
    @Body() updateCocktailDto: UpdateCocktailDto,
  ) {
    return this.cocktailsService.update(id, updateCocktailDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a cocktail by ID (author or ADMIN)' })
  @ApiResponse({ status: 200, description: 'Cocktail deleted successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – must be author or ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Cocktail not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cocktailsService.remove(id, user);
  }
}
