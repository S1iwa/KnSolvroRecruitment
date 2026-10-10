import { Injectable } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  create(createIngredientDto: CreateIngredientDto) {
    return this.prisma.ingredient.create({
      data: createIngredientDto,
    })
  }

  findAll() {
    return this.prisma.ingredient.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.ingredient.findUnique({
      where: { id: id },
    })
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
    return this.prisma.ingredient.update({
      where: { id: id },
      data: updateIngredientDto
    })
  }

  remove(id: number) {
    return this.prisma.ingredient.delete({
      where: { id: id },
    })
  }
}
