import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';
import {
  CocktailSortBy,
  FilterCocktailsDto,
  SortOrder,
} from './dto/filter-cocktails.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '../generated/prisma/client';
import { UserPayload } from '../auth/strategies/jwt.strategy';

export const cocktailInclude = {
  ingredients: { include: { ingredient: true } },
  category: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

export const cocktailDetailInclude = {
  ...cocktailInclude,
  reviews: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' as const },
    take: 10,
  },
};

@Injectable()
export class CocktailsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCocktailDto, authorId: number) {
    return this.prisma.cocktail.create({
      data: {
        name: dto.name,
        instructions: dto.instructions,
        categoryId: dto.categoryId,
        authorId,
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
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (categoryId !== undefined) where.categoryId = categoryId;
    if (authorId !== undefined) where.authorId = authorId;

    const alcoholicFilter =
      isAlcoholic !== undefined
        ? isAlcoholic
          ? { some: { ingredient: { isAlcoholic: true } } }
          : { none: { ingredient: { isAlcoholic: true } } }
        : undefined;

    let ingredientFilter: Prisma.CocktailIngredientWhereInput | undefined;
    if (ingredientId !== undefined || ingredientName) {
      ingredientFilter = {
        ...(ingredientId !== undefined && { ingredientId }),
        ...(ingredientName && {
          ingredient: {
            name: { contains: ingredientName, mode: 'insensitive' },
          },
        }),
      };
    }

    if (alcoholicFilter && ingredientFilter) {
      where.AND = [
        { ingredients: alcoholicFilter },
        { ingredients: { some: ingredientFilter } },
      ];
    } else if (alcoholicFilter) {
      where.ingredients = alcoholicFilter;
    } else if (ingredientFilter) {
      where.ingredients = { some: ingredientFilter };
    }

    const [data, total] = await Promise.all([
      this.prisma.cocktail.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: cocktailInclude,
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
      where: { id },
      include: cocktailDetailInclude,
    });
    if (!cocktail)
      throw new NotFoundException(`Cocktail with ID ${id} not found`);
    return cocktail;
  }

  async update(id: number, dto: UpdateCocktailDto, user: UserPayload) {
    const cocktail = await this.findOne(id);

    if (user.role !== Role.ADMIN && cocktail.authorId !== user.id)
      throw new ForbiddenException('You are not allowed to edit this cocktail');

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
        include: cocktailInclude,
      });
    });
  }

  async remove(id: number, user: UserPayload) {
    const cocktail = await this.findOne(id);

    if (user.role !== Role.ADMIN && cocktail.authorId !== user.id)
      throw new ForbiddenException(
        'You are not allowed to delete this cocktail',
      );

    return this.prisma.cocktail.delete({
      where: { id },
      include: cocktailInclude,
    });
  }
}
