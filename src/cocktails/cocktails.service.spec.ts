import { Test, TestingModule } from '@nestjs/testing';
import { CocktailsService } from './cocktails.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  makeCocktail,
  makeCreateCocktailDto,
  makeUpdateCocktailDto,
} from '../test/factories';
import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

describe('CocktailsService', () => {
  let service: CocktailsService;

  const prismaMock = {
    cocktail: {
      create: jest.fn<() => Promise<any>>(),
      findMany: jest.fn<() => Promise<any[]>>(),
      findUnique: jest.fn<() => Promise<any>>(),
      update: jest.fn<() => Promise<any>>(),
      delete: jest.fn<() => Promise<any>>(),
      count: jest.fn<() => Promise<number>>(),
    },
    cocktailIngredient: {
      deleteMany: jest.fn<() => Promise<any>>(),
      createMany: jest.fn<() => Promise<any>>(),
    },
    $transaction: jest.fn((callback: any) => callback(prismaMock)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CocktailsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CocktailsService>(CocktailsService);
  });

  describe('create', () => {
    it('should create a cocktail with ingredients', async () => {
      const dto = makeCreateCocktailDto();
      const created = makeCocktail();

      prismaMock.cocktail.create.mockResolvedValue(created);

      await expect(service.create(dto)).resolves.toEqual(created);
      expect(prismaMock.cocktail.create).toHaveBeenCalledWith({
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
        include: { ingredients: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated cocktails', async () => {
      const cocktails = [
        makeCocktail({ id: 1, name: 'Mojito' }),
        makeCocktail({ id: 2, name: 'Negroni' }),
      ];
      prismaMock.cocktail.findMany.mockResolvedValue(cocktails);
      prismaMock.cocktail.count.mockResolvedValue(2);

      const paginationQuery: PaginationQueryDto = { page: 1, limit: 10 };
      const result = await service.findAll(paginationQuery);

      expect(result).toEqual({
        data: cocktails,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(prismaMock.cocktail.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
        include: {
          ingredients: { include: { ingredient: true } },
          category: true,
        },
      });
      expect(prismaMock.cocktail.count).toHaveBeenCalled();
    });

    it('should use default pagination values when query is empty', async () => {
      prismaMock.cocktail.findMany.mockResolvedValue([]);
      prismaMock.cocktail.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
      expect(prismaMock.cocktail.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
        include: {
          ingredients: { include: { ingredient: true } },
          category: true,
        },
      });
      expect(prismaMock.cocktail.count).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a cocktail by id', async () => {
      const cocktail = makeCocktail({ id: 1 });
      prismaMock.cocktail.findUnique.mockResolvedValue(cocktail);

      await expect(service.findOne(1)).resolves.toEqual(cocktail);
      expect(prismaMock.cocktail.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          ingredients: { include: { ingredient: true } },
          category: true,
        },
      });
    });

    it('should throw NotFoundException when cocktail does not exist', async () => {
      prismaMock.cocktail.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(prismaMock.cocktail.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: {
          ingredients: { include: { ingredient: true } },
          category: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update cocktail and replace ingredients when ingredients are provided', async () => {
      const existing = makeCocktail({ id: 1 });
      const updateDto = makeUpdateCocktailDto({
        ingredients: [{ ingredientId: 3, amountValue: 60, amountUnit: 'ml' }],
      });
      const updated = makeCocktail({ id: 1, name: updateDto.name });

      prismaMock.cocktail.findUnique.mockResolvedValue(existing);
      prismaMock.cocktailIngredient.deleteMany.mockResolvedValue({ count: 2 });
      prismaMock.cocktailIngredient.createMany.mockResolvedValue({ count: 1 });
      prismaMock.cocktail.update.mockResolvedValue(updated);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updated);
      expect(prismaMock.cocktailIngredient.deleteMany).toHaveBeenCalledWith({
        where: { cocktailId: 1 },
      });
      expect(prismaMock.cocktailIngredient.createMany).toHaveBeenCalledWith({
        data: [
          {
            cocktailId: 1,
            ingredientId: 3,
            amountValue: 60,
            amountUnit: 'ml',
            amountText: undefined,
            order: undefined,
          },
        ],
      });
      expect(prismaMock.cocktail.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: updateDto.name,
          instructions: updateDto.instructions,
        },
        include: {
          ingredients: { include: { ingredient: true } },
          category: true,
        },
      });
    });

    it('should update cocktail without touching ingredients when ingredients are not provided', async () => {
      const existing = makeCocktail({ id: 1 });
      const updateDto = { name: 'Simple Name Update' };
      const updated = makeCocktail({ id: 1, name: 'Simple Name Update' });

      prismaMock.cocktail.findUnique.mockResolvedValue(existing);
      prismaMock.cocktail.update.mockResolvedValue(updated);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updated);
      expect(prismaMock.cocktailIngredient.deleteMany).not.toHaveBeenCalled();
      expect(prismaMock.cocktailIngredient.createMany).not.toHaveBeenCalled();
      expect(prismaMock.cocktail.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Simple Name Update' },
        include: {
          ingredients: { include: { ingredient: true } },
          category: true,
        },
      });
    });

    it('should throw NotFoundException when cocktail does not exist', async () => {
      prismaMock.cocktail.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Mojito' })).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a cocktail by id', async () => {
      const existing = makeCocktail({ id: 1 });
      prismaMock.cocktail.findUnique.mockResolvedValue(existing);
      prismaMock.cocktail.delete.mockResolvedValue(existing);

      const result = await service.remove(1);

      expect(result).toEqual(existing);
      expect(prismaMock.cocktail.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          ingredients: { include: { ingredient: true } },
          category: true,
        },
      });
    });

    it('should throw NotFoundException when cocktail does not exist', async () => {
      prismaMock.cocktail.findUnique.mockResolvedValue(null);

      await expect(service.remove(-1)).rejects.toThrow(NotFoundException);
      expect(prismaMock.cocktail.delete).not.toHaveBeenCalled();
    });
  });
});
