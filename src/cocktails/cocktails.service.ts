import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class CocktailsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCocktailDto) {
    return this.prisma.cocktail.create({
      data: {
        name: dto.name,
        instructions: dto.instructions,
        categoryId: dto.categoryId,
        authorId: dto.authorId,
        ingredients: {
          create: dto.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            amountValue: ing.amountValue,
            amountUnit: ing.amountUnit,
            amountText: ing.amountText,
            order: ing.order,
          })),
        },
      },
      include: {
        ingredients: true,
      },
    });
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.cocktail.findMany({
        skip: skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { ingredients: { include: { ingredient: true } }, category: true },
      }),
      this.prisma.cocktail.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      include: { ingredients: { include: { ingredient: true } }, category: true },
    };
  }

  async findOne(id: number) {
    const cocktail = await this.prisma.cocktail.findUnique({
      where: { id: id },
      include: { ingredients: { include: { ingredient: true } }, category: true }
    });
    if (!cocktail)
      throw new NotFoundException(`Cocktail with ID ${id} not found`);
    return cocktail;
  }

  async update(id: number, dto: UpdateCocktailDto) {
    await this.findOne(id);
    const { ingredients, ...updateData } = dto;
    return this.prisma.$transaction(async (tx) => {
      if (ingredients !== undefined) {
        await tx.cocktailIngredient.createMany({
          data: ingredients.map((ing) => ({
            cocktailId: id,
            ingredientId: ing.ingredientId,
            amountValue: ing.amountValue,
            amountUnit: ing.amountUnit,
            amountText: ing.amountText,
            order: ing.order,
          })),
        });
      }

      return tx.cocktail.update({
        where: { id },
        data: updateData,
        include: {
          ingredients: { include: { ingredient: true } },
          category: true,
        },
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cocktail.delete({
      where: { id: id },
      include: {
        ingredients: { include: { ingredient: true } },
        category: true,
      }
    });
  }
}
