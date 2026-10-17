import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('cocktails/:cocktailId/reviews')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add a review and rating to a cocktail (authenticated users)',
  })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – JWT token required',
  })
  @ApiResponse({ status: 404, description: 'Cocktail not found' })
  @ApiResponse({
    status: 409,
    description: 'You have already reviewed this cocktail',
  })
  create(
    @Param('cocktailId', ParseIntPipe) cocktailId: number,
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(cocktailId, user.id, dto);
  }

  @Get('cocktails/:cocktailId/reviews')
  @ApiOperation({ summary: 'Get all reviews for a cocktail (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of reviews' })
  @ApiResponse({ status: 404, description: 'Cocktail not found' })
  findByCocktail(
    @Param('cocktailId', ParseIntPipe) cocktailId: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.reviewsService.findByCocktail(cocktailId, paginationQuery);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reviews/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review by ID (author or ADMIN)' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – must be review author or ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('reviews/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review by ID (author or ADMIN)' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – must be review author or ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.reviewsService.remove(id, user);
  }
}
