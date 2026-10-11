import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const prismaMock = {
    category: {
      create: jest.fn<() => Promise<any>>(),
      findMany: jest.fn<() => Promise<any[]>>(),
      findUnique: jest.fn<() => Promise<any>>(),
      update: jest.fn<() => Promise<any>>(),
      delete: jest.fn<() => Promise<any>>(),
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  // Create test
  it('should create a category', async () => {
    const createCategoryDto = { name: 'Beer' };
    const createdCategory = { id: 1, ...createCategoryDto, createdAt: new Date(), updatedAt: new Date() };

    prismaMock.category.create.mockResolvedValue(createdCategory);
    await expect(service.create(createCategoryDto)).resolves.toEqual(createdCategory);
    expect(prismaMock.category.create).toHaveBeenCalledWith({ data: createCategoryDto });
  });

  // FindAll test
  it('should return all categories', async () => {
    const categories = [
      { id: 1, name: 'Beer' },
      { id: 2, name: 'Wine' },
    ];

    prismaMock.category.findMany.mockResolvedValue(categories);
    await expect(service.findAll()).resolves.toEqual(categories);
    expect(prismaMock.category.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' }});
  });

  // FindOne test
  it('should return a category by id', async () => {
    const category = { id: 1, name: 'Beer' };

    prismaMock.category.findUnique.mockResolvedValue(category);
    await expect(service.findOne(1)).resolves.toEqual(category);
    expect(prismaMock.category.findUnique).toHaveBeenCalledWith({ where: { id: 1 }});
  });

  // Update test
  it('should update a category', async () => {
    const updateCategoryDto = { name: 'Wine' };
    const updatedCategory = { ...updateCategoryDto, createdAt: new Date(), updatedAt: new Date() };
    const existingCategory = { id: 1, name: 'Beer' };

    prismaMock.category.findUnique.mockResolvedValue(existingCategory);
    prismaMock.category.update.mockResolvedValue(updatedCategory);

    await expect(service.update(1, updateCategoryDto)).resolves.toEqual(updatedCategory);
    expect(prismaMock.category.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updateCategoryDto });
  });

  // Delete test
  it('should delete a category', async () => {
    const existingCategory = { id: 1, name: 'Beer' };
    prismaMock.category.findUnique.mockResolvedValue(existingCategory);
    prismaMock.category.delete.mockResolvedValue({});
    await expect(service.remove(1)).resolves.toEqual({});
    expect(prismaMock.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  // Test 404
  it('should throw NotFoundException when category does not exist', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);
    await expect(service.findOne(-1)).rejects.toThrow(NotFoundException);
  });
});
