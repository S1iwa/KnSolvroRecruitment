import { CreateCocktailDto } from '../cocktails/dto/create-cocktail.dto';
import { UpdateCocktailDto } from '../cocktails/dto/update-cocktail.dto';

export function makeCocktail(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    name: 'Mojito',
    instructions: 'Muddle mint leaves, add rum and top with soda',
    categoryId: 1,
    authorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: 1,
      name: 'Longdrink',
    },
    ingredients: [],
    ...overrides,
  };
}

export function makeCreateCocktailDto(
  overrides: Partial<CreateCocktailDto> = {},
): CreateCocktailDto {
  return {
    name: 'Mojito',
    instructions:
      'Muddle mint leaves with sugar, add rum and fresh lime juice.',
    categoryId: 1,
    authorId: 1,
    ingredients: [
      { ingredientId: 1, amountValue: 50, amountUnit: 'ml' },
      { ingredientId: 2, amountText: 'pinch' },
    ],
    ...overrides,
  };
}

export function makeUpdateCocktailDto(
  overrides: Partial<UpdateCocktailDto> = {},
): UpdateCocktailDto {
  return {
    name: 'Mojito Royal',
    instructions: 'Muddle mint, add rum and top with prosecco.',
    ...overrides,
  };
}

export function makeIngredient(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    name: 'Vodka',
    description: 'A strong alcoholic drink',
    isAlcoholic: true,
    imageUrl: 'https://example.com/vodka.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
