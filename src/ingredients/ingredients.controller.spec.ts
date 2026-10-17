import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';
import { jest } from '@jest/globals';
import { FilterIngredientsDto } from './dto/filter-ingredients.dto';
import { makeIngredient } from '../test/factories';
import { Reflector } from '@nestjs/core';

describe('IngredientsController', () => {
  let controller: IngredientsController;

  const ingredientsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        { provide: IngredientsService, useValue: ingredientsServiceMock },
        Reflector,
      ],
    }).compile();

    controller = module.get<IngredientsController>(IngredientsController);
  });

  it('should run create method in service', async () => {
    const dto = {
      name: 'Vodka',
      description: 'A strong alcoholic drink',
      isAlcoholic: true,
      imageUrl: 'https://example.com/vodka.jpg',
    };
    ingredientsServiceMock.create.mockReturnValue({ id: 1, ...dto });

    const result = controller.create(dto);
    expect(result).toEqual({ id: 1, ...dto });
    expect(ingredientsServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('should run findAll without filters', async () => {
    const ingredients = [
      makeIngredient({ id: 1 }),
      makeIngredient({ id: 2, name: 'Tequila' }),
    ];
    const response = {
      data: ingredients,
      meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
    };
    ingredientsServiceMock.findAll.mockReturnValue(response);

    const query = new FilterIngredientsDto();
    const result = controller.findAll(query);
    expect(result).toEqual(response);
    expect(ingredientsServiceMock.findAll).toHaveBeenCalledWith(query);
  });

  it('should run findAll with search filter', async () => {
    const ingredients = [makeIngredient({ id: 1 })];
    const response = {
      data: ingredients,
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    ingredientsServiceMock.findAll.mockReturnValue(response);

    const query: FilterIngredientsDto = { search: 'Vodka' };
    const result = controller.findAll(query);
    expect(result).toEqual(response);
    expect(ingredientsServiceMock.findAll).toHaveBeenCalledWith(query);
  });

  it('should run findAll with isAlcoholic filter', async () => {
    const ingredients = [makeIngredient({ id: 1, isAlcoholic: true })];
    const response = {
      data: ingredients,
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    ingredientsServiceMock.findAll.mockReturnValue(response);

    const query: FilterIngredientsDto = { isAlcoholic: true };
    const result = controller.findAll(query);
    expect(result).toEqual(response);
    expect(ingredientsServiceMock.findAll).toHaveBeenCalledWith(query);
  });

  it('should run findOne method in service', async () => {
    const ingredient = makeIngredient({ id: 1 });
    ingredientsServiceMock.findOne.mockReturnValue(ingredient);

    const result = controller.findOne(1);
    expect(result).toEqual(ingredient);
    expect(ingredientsServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  it('should run update method in service', async () => {
    const dto = {
      name: 'Rum',
      description: 'A Caribbean spirit',
      isAlcoholic: true,
    };
    const updated = makeIngredient({ id: 1, ...dto });
    ingredientsServiceMock.update.mockReturnValue(updated);

    const result = controller.update(1, dto);
    expect(result).toEqual(updated);
    expect(ingredientsServiceMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('should run remove method in service', async () => {
    const ingredient = makeIngredient({ id: 1 });
    ingredientsServiceMock.remove.mockReturnValue(ingredient);

    const result = controller.remove(1);
    expect(result).toEqual(ingredient);
    expect(ingredientsServiceMock.remove).toHaveBeenCalledWith(1);
  });
});
