import { Test, TestingModule } from '@nestjs/testing';
import { CocktailsController } from './cocktails.controller';
import { CocktailsService } from './cocktails.service';

describe('CocktailsController', () => {
  let controller: CocktailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CocktailsController],
      providers: [CocktailsService],
    }).compile();

    controller = module.get<CocktailsController>(CocktailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
