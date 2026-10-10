import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsService } from './ingredients.service';
import { jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngredientsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
  });

  // Create test
  it('should create an ingredient', async () => {
    const createIngredientDto = {
      name: 'Vodka',
      description: 'A strong alcoholic drink',
      isAlcoholic: true,
      imageUrl: 'https://example.com/vodka.jpg',
    };

    const createdIngredient = {
      id: 1,
      ...createIngredientDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    prismaMock.ingredient.create.mockResolvedValue(createdIngredient);
    await expect(service.create(createIngredientDto)).resolves.toEqual(createdIngredient);
    expect(prismaMock.ingredient.create).toHaveBeenCalledWith({ data: createIngredientDto });
  });

  // FindAll test
  it('should return all ingredients', async () => {
    const ingredients = [
      { id: 1, name: 'Vodka', description: 'A strong alcoholic drink', isAlcoholic: true, imageUrl: 'https://example.com/vodka.jpg' },
      { id: 2, name: 'Tequila', description: 'A strong alcoholic drink', isAlcoholic: false, imageUrl: 'https://example.com/tequila.jpg' },
    ];

    prismaMock.ingredient.findMany.mockResolvedValue(ingredients);
    prismaMock.ingredient.count.mockResolvedValue(ingredients.length);

    const paginationQuery = { page: 1, limit: 10 };

    await expect(service.findAll(paginationQuery)).resolves.toEqual({
      data: ingredients,
      meta: {
        total: ingredients.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });


    expect(prismaMock.ingredient.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { name: 'asc' },
    });
    expect(prismaMock.ingredient.count).toHaveBeenCalled();
  });

  // FindOne test
  it('should return an ingredient by id', async () => {
    const ingredient = { id: 1, name: 'Vodka', description: 'A strong alcoholic drink', isAlcoholic: true, imageUrl: 'https://example.com/vodka.jpg' };

    prismaMock.ingredient.findUnique.mockResolvedValue(ingredient);
    await expect(service.findOne(1)).resolves.toEqual(ingredient);
    expect(prismaMock.ingredient.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  })

  // Update test
  it(('should update an ingredient'), async () => {
    const updateIngredientDto = {
      name: 'Rum',
      description: 'A strong alcoholic drink',
      imageUrl: 'https://example.com/rum.jpg',
    };

    const updatedIngredient = {
      id: 1,
      ...updateIngredientDto,
      isAlcoholic: true,
      imageUrl: 'https://example.com/rum.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingIngredient = { id: 1, name: 'Vodka', description: 'A strong alcoholic drink', isAlcoholic: true, imageUrl: 'https://example.com/vodka.jpg' };

    prismaMock.ingredient.findUnique.mockResolvedValue(existingIngredient);
    prismaMock.ingredient.update.mockResolvedValue(updatedIngredient)

    await expect(service.update(1, updateIngredientDto)).resolves.toEqual(updatedIngredient);
    expect(prismaMock.ingredient.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: updateIngredientDto,
    });
  });

  // Delete test
  it('should delete an ingredient', async () => {
    const existingIngredient = { id: 1, name: 'Vodka', description: 'A strong alcoholic drink', isAlcoholic: true, imageUrl: 'https://example.com/vodka.jpg' };
    prismaMock.ingredient.findUnique.mockResolvedValue(existingIngredient);
    prismaMock.ingredient.delete.mockResolvedValue({});
    await expect(service.remove(1)).resolves.toEqual({});
    expect(prismaMock.ingredient.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  // Test 404
  it('should throw NotFoundException when ingredient does not exist', async () => {
    prismaMock.ingredient.findUnique.mockResolvedValue(null);
    await expect(service.findOne(-1)).rejects.toThrow(NotFoundException);
  });
});
