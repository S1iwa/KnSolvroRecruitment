import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { IngredientsModule } from './ingredients/ingredients.module';

@Module({
  imports: [PrismaModule, IngredientsModule]
})
export class AppModule {}
