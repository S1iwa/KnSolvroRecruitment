import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { jest } from '@jest/globals';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const categoriesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: categoriesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  // Create test
  it('should run create method in service', async () => {
    const dto = { name: 'Beer' };
    categoriesServiceMock.create.mockReturnValue({ id: 1, ...dto });

    const result = controller.create(dto);
    expect(result).toEqual({ id: 1, ...dto });
    expect(categoriesServiceMock.create).toHaveBeenCalledWith(dto);
  });

  // FindAll test
  it('should run findAll method in service', async () => {
    const categories = [
      { id: 1, name: 'Beer' },
      { id: 2, name: 'Wine' },
    ];
    categoriesServiceMock.findAll.mockReturnValue(categories);
    const result = controller.findAll(new PaginationQueryDto());
    expect(result).toEqual(categories);
    expect(categoriesServiceMock.findAll).toHaveBeenCalled();
  });

  // FindOne test
  it('should run findOne method in service', async () => {
    const category = { id: 1, name: 'Beer' };
    categoriesServiceMock.findOne.mockReturnValue(category);

    const result = controller.findOne(1);
    expect(result).toEqual(category);
    expect(categoriesServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  // Update test
  it('should run update method in service', async () => {
    const dto = { name: 'Short drink' };
    categoriesServiceMock.update.mockReturnValue({ id: 1, ...dto });
    const result = controller.update(1, dto);
    expect(categoriesServiceMock.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  // Delete test
  it('should run remove method in service', async () => {
    categoriesServiceMock.remove.mockReturnValue({});
    const result = controller.remove(1);
    expect(categoriesServiceMock.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({});
  });
})
