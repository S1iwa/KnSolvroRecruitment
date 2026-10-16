import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const prismaMock = {
    category: {
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
        CategoriesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto = { name: 'Beer' };
      const created = {
        id: 1,
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.category.create.mockResolvedValue(created);
      await expect(service.create(dto)).resolves.toEqual(created);
      expect(prismaMock.category.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return all categories with pagination meta', async () => {
      const categories = [
        { id: 1, name: 'Beer' },
        { id: 2, name: 'Wine' },
      ];

      prismaMock.category.findMany.mockResolvedValue(categories);
      prismaMock.category.count.mockResolvedValue(2);

      const result = await service.findAll(new PaginationQueryDto());

      expect(result).toEqual({
        data: categories,
        meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
      });
      expect(prismaMock.category.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
      expect(prismaMock.category.count).toHaveBeenCalled();
    });

    it('should handle second page correctly', async () => {
      prismaMock.category.findMany.mockResolvedValue([]);
      prismaMock.category.count.mockResolvedValue(15);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.meta).toEqual({
        total: 15,
        page: 2,
        limit: 10,
        totalPages: 2,
      });
      expect(prismaMock.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const category = { id: 1, name: 'Beer' };

      prismaMock.category.findUnique.mockResolvedValue(category);
      await expect(service.findOne(1)).resolves.toEqual(category);
      expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);
      await expect(service.findOne(-1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const existing = { id: 1, name: 'Beer' };
      const dto = { name: 'Wine' };
      const updated = {
        id: 1,
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.category.findUnique.mockResolvedValue(existing);
      prismaMock.category.update.mockResolvedValue(updated);

      await expect(service.update(1, dto)).resolves.toEqual(updated);
      expect(prismaMock.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
    });

    it('should throw NotFoundException when category not found on update', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);
      await expect(service.update(999, { name: 'Ghost' })).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.category.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      const existing = { id: 1, name: 'Beer' };
      prismaMock.category.findUnique.mockResolvedValue(existing);
      prismaMock.category.delete.mockResolvedValue(existing);

      await expect(service.remove(1)).resolves.toEqual(existing);
      expect(prismaMock.category.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when category not found on remove', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(prismaMock.category.delete).not.toHaveBeenCalled();
    });
  });
});
