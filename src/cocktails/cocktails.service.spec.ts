import { Test, TestingModule } from '@nestjs/testing';
import { CocktailsService } from './cocktails.service';
import { PrismaService } from '../prisma/prisma.service';
import { jest } from '@jest/globals';

describe('CocktailsService', () => {
  let service: CocktailsService;

  const prismaMock = {
    cocktail: {
      create: jest.fn<() => Promise<any>>(),
      findMany: jest.fn<() => Promise<any[]>>(),
      findUnique: jest.fn<() => Promise<any>>(),
      update: jest.fn<() => Promise<any>>(),
      delete: jest.fn<() => Promise<any>>(),
      count: jest.fn<() => Promise<number>>(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CocktailsService,
        { provide: PrismaService, useValue: prismaMock }
      ],
    }).compile();

    service = module.get<CocktailsService>(CocktailsService);
  });

  it('should create a cocktail', async () => {
    const createCocktailDto = {

    }
  });
});
