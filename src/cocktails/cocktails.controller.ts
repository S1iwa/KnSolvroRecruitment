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
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('cocktails')
@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: UserPayload,
    @Body() createCocktailDto: CreateCocktailDto,
  ) {
    return this.cocktailsService.create(createCocktailDto, user.id);
  }

  @Get()
  findAll(@Query() query: FilterCocktailsDto) {
    return this.cocktailsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cocktailsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
    @Body() updateCocktailDto: UpdateCocktailDto,
  ) {
    return this.cocktailsService.update(id, updateCocktailDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cocktailsService.remove(id, user);
  }
}
