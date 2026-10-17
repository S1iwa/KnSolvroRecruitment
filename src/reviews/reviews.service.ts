import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserPayload } from '../auth/strategies/jwt.strategy';
import { Role } from '../generated/prisma/enums';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(cocktailId: number, userId: number, dto: CreateReviewDto) {
    const cocktail = await this.prisma.cocktail.findUnique({
      where: { id: cocktailId },
    });
    if (!cocktail) {
      throw new NotFoundException(`Cocktail with ID ${cocktailId} not found`);
    }

    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_cocktailId: {
          userId,
          cocktailId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this cocktail');
    }

    return this.prisma.review.create({
      data: {
        cocktailId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findByCocktail(cocktailId: number, pagination: PaginationQueryDto) {
    const cocktail = await this.prisma.cocktail.findUnique({
      where: { id: cocktailId },
    });
    if (!cocktail) {
      throw new NotFoundException(`Cocktail with ID ${cocktailId} not found`);
    }

    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { cocktailId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.review.count({ where: { cocktailId } }),
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

  async update(id: number, user: UserPayload, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (user.role !== Role.ADMIN && review.userId !== user.id) {
      throw new ForbiddenException('You are not allowed to edit this review');
    }

    return this.prisma.review.update({
      where: { id },
      data: dto,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async remove(id: number, user: UserPayload) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (user.role !== Role.ADMIN && review.userId !== user.id) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }
}
