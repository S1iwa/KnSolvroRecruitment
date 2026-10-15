import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';
import {
  CocktailSortBy,
  FilterCocktailsDto,
  SortOrder,
} from './dto/filter-cocktails.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

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

  async findAll(query: FilterCocktailsDto = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      authorId,
      ingredientId,
      ingredientName,
      isAlcoholic,
      sortBy = CocktailSortBy.NAME,
      sortOrder = SortOrder.ASC,
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.CocktailWhereInput = {};

    if (search)
      where.name = { contains: search, mode: 'insensitive' };
    if (categoryId !== undefined)
      where.categoryId = categoryId;
    if (authorId !== undefined)
      where.authorId = authorId;
    if (isAlcoholic !== undefined)
      if (isAlcoholic)
        where.ingredients = {
          some: {
            ingredient: {
              isAlcoholic: true,
            },
          },
        };
      else
        where.ingredients = {
          none: {
            ingredient: {
              isAlcoholic: true,
            },
          },
        };

    if (ingredientId !== undefined || ingredientName) {
      const ingredientCondition: Prisma.CocktailIngredientWhereInput = {};
      if (ingredientId !== undefined)
        ingredientCondition.ingredientId = ingredientId;
      if (ingredientName)
        ingredientCondition.ingredient = {
          name: { contains: ingredientName, mode: 'insensitive' },
        };

      if (where.ingredients) {
        where.AND = [
          { ingredients: where.ingredients },
          { ingredients: { some: ingredientCondition } },
        ];
        delete where.ingredients;
      } else {
        where.ingredients = {
          some: ingredientCondition,
        };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.cocktail.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          ingredients: { include: { ingredient: true } },
          category: true,
        },
      }),
      this.prisma.cocktail.count({ where }),
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
    const cocktail = await this.prisma.cocktail.findUnique({
      where: { id: id },
      include: {
        ingredients: { include: { ingredient: true } },
        category: true,
      },
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
        await tx.cocktailIngredient.deleteMany({
          where: { cocktailId: id },
        });
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
      },
    });
  }
}
