import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsService } from './ingredients.service';
import { jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { makeIngredient } from '../test/factories';

describe('IngredientsService', () => {
  let service: IngredientsService;

  const prismaMock = {
    ingredient: {
      create: jest.fn<() => Promise<any>>(),
      findMany: jest.fn<() => Promise<any[]>>(),
      findUnique: jest.fn<() => Promise<any>>(),
      update: jest.fn<() => Promise<any>>(),
      delete: jest.fn<() => Promise<any>>(),
      count: jest.fn<() => Promise<number>>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
  });

  describe('create', () => {
    it('should create an ingredient', async () => {
      const dto = {
        name: 'Vodka',
        description: 'A strong alcoholic drink',
        isAlcoholic: true,
        imageUrl: 'https://example.com/vodka.jpg',
      };
      const created = makeIngredient(dto);

      prismaMock.ingredient.create.mockResolvedValue(created);
      await expect(service.create(dto)).resolves.toEqual(created);
      expect(prismaMock.ingredient.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return paginated ingredients without filters', async () => {
      const ingredients = [
        makeIngredient({ id: 1 }),
        makeIngredient({ id: 2, name: 'Tequila' }),
      ];

      prismaMock.ingredient.findMany.mockResolvedValue(ingredients);
      prismaMock.ingredient.count.mockResolvedValue(ingredients.length);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: ingredients,
        meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
      });
      expect(prismaMock.ingredient.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
      expect(prismaMock.ingredient.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should filter by search term', async () => {
      const ingredients = [makeIngredient({ id: 1 })];

      prismaMock.ingredient.findMany.mockResolvedValue(ingredients);
      prismaMock.ingredient.count.mockResolvedValue(1);

      await service.findAll({ search: 'Vodka' });

      expect(prismaMock.ingredient.findMany).toHaveBeenCalledWith({
        where: { name: { contains: 'Vodka', mode: 'insensitive' } },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
      expect(prismaMock.ingredient.count).toHaveBeenCalledWith({
        where: { name: { contains: 'Vodka', mode: 'insensitive' } },
      });
    });

    it('should filter by isAlcoholic=true', async () => {
      prismaMock.ingredient.findMany.mockResolvedValue([]);
      prismaMock.ingredient.count.mockResolvedValue(0);

      await service.findAll({ isAlcoholic: true });

      expect(prismaMock.ingredient.findMany).toHaveBeenCalledWith({
        where: { isAlcoholic: true },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
    });

    it('should filter by isAlcoholic=false', async () => {
      prismaMock.ingredient.findMany.mockResolvedValue([]);
      prismaMock.ingredient.count.mockResolvedValue(0);

      await service.findAll({ isAlcoholic: false });

      expect(prismaMock.ingredient.findMany).toHaveBeenCalledWith({
        where: { isAlcoholic: false },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
    });

    it('should combine search and isAlcoholic filters', async () => {
      prismaMock.ingredient.findMany.mockResolvedValue([]);
      prismaMock.ingredient.count.mockResolvedValue(0);

      await service.findAll({ search: 'Rum', isAlcoholic: true });

      expect(prismaMock.ingredient.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: 'Rum', mode: 'insensitive' },
          isAlcoholic: true,
        },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an ingredient by id', async () => {
      const ingredient = makeIngredient({ id: 1 });

      prismaMock.ingredient.findUnique.mockResolvedValue(ingredient);
      await expect(service.findOne(1)).resolves.toEqual(ingredient);
      expect(prismaMock.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when ingredient does not exist', async () => {
      prismaMock.ingredient.findUnique.mockResolvedValue(null);
      await expect(service.findOne(-1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an ingredient', async () => {
      const existing = makeIngredient({ id: 1 });
      const dto = { name: 'Rum', description: 'A Caribbean spirit' };
      const updated = makeIngredient({ id: 1, ...dto });

      prismaMock.ingredient.findUnique.mockResolvedValue(existing);
      prismaMock.ingredient.update.mockResolvedValue(updated);

      await expect(service.update(1, dto)).resolves.toEqual(updated);
      expect(prismaMock.ingredient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('should delete an ingredient', async () => {
      const existing = makeIngredient({ id: 1 });
      prismaMock.ingredient.findUnique.mockResolvedValue(existing);
      prismaMock.ingredient.delete.mockResolvedValue(existing);

      await expect(service.remove(1)).resolves.toEqual(existing);
      expect(prismaMock.ingredient.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when ingredient does not exist', async () => {
      prismaMock.ingredient.findUnique.mockResolvedValue(null);
      await expect(service.remove(-1)).rejects.toThrow(NotFoundException);
    });
  });
});
