import { Test, TestingModule } from '@nestjs/testing';
import { CocktailsController } from './cocktails.controller';
import { CocktailsService } from './cocktails.service';
import { jest } from '@jest/globals';
import { FilterCocktailsDto } from './dto/filter-cocktails.dto';
import {
  makeCocktail,
  makeCreateCocktailDto,
  makeUpdateCocktailDto,
} from '../test/factories';
import { Role } from '../generated/prisma/enums';
import { UserPayload } from '../auth/strategies/jwt.strategy';

describe('CocktailsController', () => {
  let controller: CocktailsController;

  const user: UserPayload = {
    id: 1,
    email: 'user@example.com',
    role: Role.USER,
  };

  const cocktailsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CocktailsController],
      providers: [
        {
          provide: CocktailsService,
          useValue: cocktailsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CocktailsController>(CocktailsController);
  });

  it('should run create method in service with user.id', async () => {
    const dto = makeCreateCocktailDto();
    const created = makeCocktail();
    cocktailsServiceMock.create.mockReturnValue(created);

    const result = controller.create(user, dto);
    expect(result).toEqual(created);
    expect(cocktailsServiceMock.create).toHaveBeenCalledWith(dto, user.id);
  });

  it('should run findAll method in service', async () => {
    const response = {
      data: [makeCocktail()],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    cocktailsServiceMock.findAll.mockReturnValue(response);

    const query = new FilterCocktailsDto();
    const result = controller.findAll(query);
    expect(result).toEqual(response);
    expect(cocktailsServiceMock.findAll).toHaveBeenCalledWith(query);
  });

  it('should run findOne method in service', async () => {
    const cocktail = makeCocktail();
    cocktailsServiceMock.findOne.mockReturnValue(cocktail);

    const result = controller.findOne(1);
    expect(result).toEqual(cocktail);
    expect(cocktailsServiceMock.findOne).toHaveBeenCalledWith(1);
  });

  it('should run update method in service with user', async () => {
    const dto = makeUpdateCocktailDto();
    const updated = makeCocktail({ name: dto.name });
    cocktailsServiceMock.update.mockReturnValue(updated);

    const result = controller.update(1, user, dto);
    expect(result).toEqual(updated);
    expect(cocktailsServiceMock.update).toHaveBeenCalledWith(1, dto, user);
  });

  it('should run remove method in service with user', async () => {
    cocktailsServiceMock.remove.mockReturnValue({});

    const result = controller.remove(1, user);
    expect(result).toEqual({});
    expect(cocktailsServiceMock.remove).toHaveBeenCalledWith(1, user);
  });
});
