import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { CategoriesModule } from './categories/categories.module';
import { CocktailsModule } from './cocktails/cocktails.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    IngredientsModule,
    CategoriesModule,
    CocktailsModule,
    AuthModule,
  ],
})
export class AppModule {}
