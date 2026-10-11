import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [PrismaModule, IngredientsModule, CategoriesModule]
})
export class AppModule {}
