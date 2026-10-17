import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { jest } from '@jest/globals';
import { makeReview } from '../test/factories';
import { Role } from '../generated/prisma/enums';
import { UserPayload } from '../auth/strategies/jwt.strategy';

describe('ReviewsController', () => {
  let controller: ReviewsController;

  const reviewsServiceMock = {
    create: jest.fn<() => Promise<any>>(),
    findByCocktail: jest.fn<() => Promise<any>>(),
    update: jest.fn<() => Promise<any>>(),
    remove: jest.fn<() => Promise<any>>(),
  };

  const user: UserPayload = {
    id: 1,
    email: 'user@example.com',
    role: Role.USER,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: reviewsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should run create method in service with user.id', async () => {
    const review = makeReview({ cocktailId: 1, userId: 1 });
    reviewsServiceMock.create.mockResolvedValue(review);

    const dto = { rating: 5, comment: 'Great!' };
    const result = await controller.create(1, user, dto);

    expect(result).toEqual(review);
    expect(reviewsServiceMock.create).toHaveBeenCalledWith(1, user.id, dto);
  });

  it('should run findByCocktail method in service', async () => {
    const expected = {
      data: [makeReview()],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    reviewsServiceMock.findByCocktail.mockResolvedValue(expected);

    const result = await controller.findByCocktail(1, { page: 1, limit: 10 });
    expect(result).toEqual(expected);
    expect(reviewsServiceMock.findByCocktail).toHaveBeenCalledWith(1, {
      page: 1,
      limit: 10,
    });
  });

  it('should run update method in service with user', async () => {
    const review = makeReview({ id: 1, rating: 4 });
    reviewsServiceMock.update.mockResolvedValue(review);

    const dto = { rating: 4 };
    const result = await controller.update(1, user, dto);
    expect(result).toEqual(review);
    expect(reviewsServiceMock.update).toHaveBeenCalledWith(1, user, dto);
  });

  it('should run remove method in service with user', async () => {
    const review = makeReview({ id: 1 });
    reviewsServiceMock.remove.mockResolvedValue(review);

    const result = await controller.remove(1, user);
    expect(result).toEqual(review);
    expect(reviewsServiceMock.remove).toHaveBeenCalledWith(1, user);
  });
});
