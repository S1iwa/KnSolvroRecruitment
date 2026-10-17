import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FilterIngredientsDto } from './dto/filter-ingredients.dto';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  create(createIngredientDto: CreateIngredientDto) {
    return this.prisma.ingredient.create({
      data: createIngredientDto,
    });
  }

  async findAll(query: FilterIngredientsDto) {
    const { page = 1, limit = 10, search, isAlcoholic } = query;
    const skip = (page - 1) * limit;

    const where: {
      name?: { contains: string; mode: 'insensitive' };
      isAlcoholic?: boolean;
    } = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (isAlcoholic !== undefined) where.isAlcoholic = isAlcoholic;

    const [data, total] = await Promise.all([
      this.prisma.ingredient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.ingredient.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });
    if (!ingredient)
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    return ingredient;
  }

  async update(id: number, dto: UpdateIngredientDto) {
    await this.findOne(id);
    return this.prisma.ingredient.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.ingredient.delete({
      where: { id },
    });
  }
}
