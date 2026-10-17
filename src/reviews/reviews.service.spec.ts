import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { jest } from '@jest/globals';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { makeReview, makeCocktail } from '../test/factories';
import { Role } from '../generated/prisma/enums';
import { UserPayload } from '../auth/strategies/jwt.strategy';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const prismaMock = {
    cocktail: {
      findUnique: jest.fn<() => Promise<any>>(),
    },
    review: {
      findUnique: jest.fn<() => Promise<any>>(),
      findMany: jest.fn<() => Promise<any[]>>(),
      count: jest.fn<() => Promise<number>>(),
      create: jest.fn<() => Promise<any>>(),
      update: jest.fn<() => Promise<any>>(),
      delete: jest.fn<() => Promise<any>>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('create', () => {
    it('should create a review when cocktail exists and user has not reviewed it', async () => {
      const cocktail = makeCocktail({ id: 1 });
      const review = makeReview({ cocktailId: 1, userId: 2, rating: 5 });

      prismaMock.cocktail.findUnique.mockResolvedValue(cocktail);
      prismaMock.review.findUnique.mockResolvedValue(null);
      prismaMock.review.create.mockResolvedValue(review);

      const result = await service.create(1, 2, {
        rating: 5,
        comment: 'Super!',
      });

      expect(result).toEqual(review);
      expect(prismaMock.cocktail.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaMock.review.findUnique).toHaveBeenCalledWith({
        where: { userId_cocktailId: { userId: 2, cocktailId: 1 } },
      });
      expect(prismaMock.review.create).toHaveBeenCalledWith({
        data: { cocktailId: 1, userId: 2, rating: 5, comment: 'Super!' },
        include: { user: { select: { id: true, name: true } } },
      });
    });

    it('should throw NotFoundException if cocktail does not exist', async () => {
      prismaMock.cocktail.findUnique.mockResolvedValue(null);

      await expect(service.create(999, 1, { rating: 5 })).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.review.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if user already reviewed this cocktail', async () => {
      const cocktail = makeCocktail({ id: 1 });
      const existing = makeReview({ cocktailId: 1, userId: 1 });

      prismaMock.cocktail.findUnique.mockResolvedValue(cocktail);
      prismaMock.review.findUnique.mockResolvedValue(existing);

      await expect(service.create(1, 1, { rating: 4 })).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.review.create).not.toHaveBeenCalled();
    });
  });

  describe('findByCocktail', () => {
    it('should return paginated reviews for existing cocktail', async () => {
      const cocktail = makeCocktail({ id: 1 });
      const reviews = [makeReview({ id: 1 }), makeReview({ id: 2 })];

      prismaMock.cocktail.findUnique.mockResolvedValue(cocktail);
      prismaMock.review.findMany.mockResolvedValue(reviews);
      prismaMock.review.count.mockResolvedValue(2);

      const result = await service.findByCocktail(1, { page: 1, limit: 10 });

      expect(result).toEqual({
        data: reviews,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(prismaMock.review.findMany).toHaveBeenCalledWith({
        where: { cocktailId: 1 },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      });
    });

    it('should throw NotFoundException if cocktail does not exist', async () => {
      prismaMock.cocktail.findUnique.mockResolvedValue(null);

      await expect(
        service.findByCocktail(999, { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const authorUser: UserPayload = {
      id: 1,
      email: 'user@example.com',
      role: Role.USER,
    };
    const adminUser: UserPayload = {
      id: 99,
      email: 'admin@example.com',
      role: Role.ADMIN,
    };
    const otherUser: UserPayload = {
      id: 2,
      email: 'other@example.com',
      role: Role.USER,
    };

    it('should allow author to update own review', async () => {
      const review = makeReview({ id: 1, userId: 1, rating: 3 });
      const updated = { ...review, rating: 5, comment: 'Changed my mind!' };

      prismaMock.review.findUnique.mockResolvedValue(review);
      prismaMock.review.update.mockResolvedValue(updated);

      const result = await service.update(1, authorUser, {
        rating: 5,
        comment: 'Changed my mind!',
      });

      expect(result).toEqual(updated);
      expect(prismaMock.review.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { rating: 5, comment: 'Changed my mind!' },
        include: { user: { select: { id: true, name: true } } },
      });
    });

    it('should allow admin to update any review', async () => {
      const review = makeReview({ id: 1, userId: 1, rating: 3 });
      const updated = { ...review, rating: 5 };

      prismaMock.review.findUnique.mockResolvedValue(review);
      prismaMock.review.update.mockResolvedValue(updated);

      const result = await service.update(1, adminUser, { rating: 5 });
      expect(result).toEqual(updated);
    });

    it('should throw ForbiddenException if user is not author and not admin', async () => {
      const review = makeReview({ id: 1, userId: 1 });
      prismaMock.review.findUnique.mockResolvedValue(review);

      await expect(service.update(1, otherUser, { rating: 1 })).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaMock.review.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if review does not exist', async () => {
      prismaMock.review.findUnique.mockResolvedValue(null);

      await expect(
        service.update(999, authorUser, { rating: 4 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const authorUser: UserPayload = {
      id: 1,
      email: 'user@example.com',
      role: Role.USER,
    };
    const adminUser: UserPayload = {
      id: 99,
      email: 'admin@example.com',
      role: Role.ADMIN,
    };
    const otherUser: UserPayload = {
      id: 2,
      email: 'other@example.com',
      role: Role.USER,
    };

    it('should allow author to delete own review', async () => {
      const review = makeReview({ id: 1, userId: 1 });
      prismaMock.review.findUnique.mockResolvedValue(review);
      prismaMock.review.delete.mockResolvedValue(review);

      const result = await service.remove(1, authorUser);

      expect(result).toEqual(review);
      expect(prismaMock.review.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should allow admin to delete any review', async () => {
      const review = makeReview({ id: 1, userId: 1 });
      prismaMock.review.findUnique.mockResolvedValue(review);
      prismaMock.review.delete.mockResolvedValue(review);

      const result = await service.remove(1, adminUser);
      expect(result).toEqual(review);
      expect(prismaMock.review.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw ForbiddenException if user is not author and not admin', async () => {
      const review = makeReview({ id: 1, userId: 1 });
      prismaMock.review.findUnique.mockResolvedValue(review);

      await expect(service.remove(1, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaMock.review.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if review does not exist', async () => {
      prismaMock.review.findUnique.mockResolvedValue(null);

      await expect(service.remove(999, authorUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
