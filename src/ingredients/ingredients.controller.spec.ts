import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';
import { jest } from '@jest/globals';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

describe('IngredientsController', () => {
  let controller: IngredientsController;

  const ingredientsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        {
          provide: IngredientsService,
          useValue: ingredientsServiceMock
        },
      ],
    }).compile();

    controller = module.get<IngredientsController>(IngredientsController);
  });

  // Create test
  it('should run create method in service', async () => {
    const dto = { name: 'Vodka', description: 'A strong alcoholic drink', isAlcoholic: true, imageUrl: 'https://example.com/vodka.jpg' };
    ingredientsServiceMock.create.mockReturnValue({ id: 1, ...dto });

    const result = controller.create(dto);
    expect(result).toEqual({ id: 1, ...dto });
    expect(ingredientsServiceMock.create).toHaveBeenCalledWith(dto);
  });

  // FindAll test
  it('should run findAll method in service', async () => {
    const ingredients = [
      { id: 1, name: 'Vodka', description: 'A strong alcoholic drink', isAlcoholic: true, imageUrl: 'https://example.com/vodka.jpg' },
      { id: 2, name: 'Tequila', description: 'A strong alcoholic drink', isAlcoholic: false, imageUrl: 'https://example.com/tequila.jpg' },
    ];
    ingredientsServiceMock.findAll.mockReturnValue(ingredients);
    const result = controller.findAll(new PaginationQueryDto());
    expect(result).toEqual(ingredients);
    expect(ingredientsServiceMock.findAll).toHaveBeenCalled();
  });

  // FindOne test
  it('should run findOne method in service', async () => {
    const ingredient = { id: 1, name: 'Vodka', description: 'A strong alcoholic drink', isAlcoholic: true, imageUrl: 'https://example.com/vodka.jpg' };
    ingredientsServiceMock.findOne.mockReturnValue(ingredient);

    const result = controller.findOne(1);
    expect(result).toEqual(ingredient);
    expect(ingredientsServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  // Update test
  it('should run update method in service', async () => {
    const dto = { name: 'Vodka', description: 'A strong alcoholic drink', isAlcoholic: true, imageUrl: 'https://example.com/vodka.jpg' };
    ingredientsServiceMock.update.mockReturnValue({ id: 1, ...dto });

    const result = controller.update(1, dto);
    expect(result).toEqual({ id: 1, ...dto });
    expect(ingredientsServiceMock.update).toHaveBeenCalledWith(1, dto);
  });

  // Delete test
  it('should run remove method in service', async () => {
    ingredientsServiceMock.remove.mockReturnValue({});
    const result = controller.remove(1);
    expect(result).toEqual({});
    expect(ingredientsServiceMock.remove).toHaveBeenCalledWith(1);
  });
});
