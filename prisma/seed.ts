import 'dotenv/config';
import { PrismaClient, Role } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'bartek.kowalski@solvro.pl' },
    update: {},
    create: {
      email: 'bartek.kowalski@solvro.pl',
      passwordHash: adminHash,
      name: 'Bartek Kowalski',
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'magda.nowak@gmail.com' },
    update: {},
    create: {
      email: 'magda.nowak@gmail.com',
      passwordHash: userHash,
      name: 'Magda Nowak',
      role: Role.USER,
    },
  });

  const bartender = await prisma.user.upsert({
    where: { email: 'krzysiek93@wp.pl' },
    update: {},
    create: {
      email: 'krzysiek93@wp.pl',
      passwordHash: userHash,
      name: 'Krzysztof Wiśniewski',
      role: Role.USER,
    },
  });

  const classic = await prisma.category.upsert({
    where: { name: 'Classic' },
    update: {},
    create: { name: 'Classic' },
  });

  const mocktail = await prisma.category.upsert({
    where: { name: 'Mocktail' },
    update: {},
    create: { name: 'Mocktail' },
  });

  const tropical = await prisma.category.upsert({
    where: { name: 'Tropical' },
    update: {},
    create: { name: 'Tropical' },
  });

  const mint = await prisma.ingredient.upsert({
    where: { name: 'Fresh Mint' },
    update: {},
    create: {
      name: 'Fresh Mint',
      description: 'Świeże listki mięty, najlepiej spearmint. Nie używaj suszonej, to nie to samo.',
      isAlcoholic: false,
      imageUrl: 'https://image.com/mind.jpg',
    },
  });

  const lime = await prisma.ingredient.upsert({
    where: { name: 'Lime Juice' },
    update: {},
    create: {
      name: 'Lime Juice',
      description: 'Sok z limonki, najlepiej świeżo wyciśnięty. Z kartonu też ujdzie, ale nie mów nikomu.',
      isAlcoholic: false,
      imageUrl: 'https://image.com/limejuice.jpg',
    },
  });

  const whiteRum = await prisma.ingredient.upsert({
    where: { name: 'White Rum' },
    update: {},
    create: {
      name: 'White Rum',
      description: 'Biały rum z trzciny cukrowej. Bacardi albo cokolwiek co masz w szafce.',
      isAlcoholic: true,
      imageUrl: 'https://image.com/whiterum.jpg',
    },
  });

  const sodaWater = await prisma.ingredient.upsert({
    where: { name: 'Soda Water' },
    update: {},
    create: {
      name: 'Soda Water',
      description: 'Zwykła woda gazowana. Perrier jeśli chcesz się poczuć fancy, Żywiec Zdrój jeśli nie.',
      isAlcoholic: false,
      imageUrl: 'https://image.com/sodawater.jpg',
    },
  });

  const caneSugar = await prisma.ingredient.upsert({
    where: { name: 'Cane Sugar' },
    update: {},
    create: {
      name: 'Cane Sugar',
      description: 'Cukier trzcinowy. Możesz użyć syropu cukrowego jeśli masz, łatwiej się miesza.',
      isAlcoholic: false,
      imageUrl: 'https://image.com/sugar.jpg',
    },
  });

  const vodka = await prisma.ingredient.upsert({
    where: { name: 'Vodka' },
    update: {},
    create: {
      name: 'Vodka',
      description: 'Wódka. Żytnia, ziemniaczana, zbożowa. Wybór należy do ciebie i twojego portfela.',
      isAlcoholic: true,
      imageUrl: 'https://image.com/vodka.jpg',
    },
  });

  const orangeJuice = await prisma.ingredient.upsert({
    where: { name: 'Orange Juice' },
    update: {},
    create: {
      name: 'Orange Juice',
      description: 'Sok pomarańczowy. Świeżo wyciśnięty jest lepszy, ale kartonowy też działa.',
      isAlcoholic: false,
      imageUrl: 'https://image.com/orange.jpg',
    },
  });

  const coconutCream = await prisma.ingredient.upsert({
    where: { name: 'Coconut Cream' },
    update: {},
    create: {
      name: 'Coconut Cream',
      description: 'Kremowe mleczko kokosowe, gęste. Nie mylić z wodą kokosową.',
      isAlcoholic: false,
      imageUrl: 'https://image.com/coconut.jpg',
    },
  });

  const pineappleJuice = await prisma.ingredient.upsert({
    where: { name: 'Pineapple Juice' },
    update: {},
    create: {
      name: 'Pineapple Juice',
      description: 'Sok ananasowy. Z puszki jest ok, świeży jest lepszy ale kto ma czas.',
      isAlcoholic: false,
      imageUrl: 'https://image.com/pineapple.jpg',
    },
  });

  const mojito = await prisma.cocktail.upsert({
    where: { name: 'Classic Mojito' },
    update: {},
    create: {
      name: 'Classic Mojito',
      instructions:
        'Wrzuć listki mięty i cukier do szklanki i ugnieć tłuczkiem, nie za mocno, bo będzie gorzkie. Dodaj sok z limonki, pokruszone lody, rum i dolej sodą. Zamieszaj delikatnie i udekoruj gałązką mięty.',
      categoryId: classic.id,
      authorId: bartender.id,
      ingredients: {
        create: [
          { ingredientId: whiteRum.id, amountValue: 50, amountUnit: 'ml', order: 1 },
          { ingredientId: lime.id, amountValue: 30, amountUnit: 'ml', order: 2 },
          { ingredientId: mint.id, amountText: 'garść listków', order: 3 },
          { ingredientId: caneSugar.id, amountValue: 2, amountUnit: 'łyżeczki', order: 4 },
          { ingredientId: sodaWater.id, amountValue: 100, amountUnit: 'ml', order: 5 },
        ],
      },
    },
  });

  const virginMojito = await prisma.cocktail.upsert({
    where: { name: 'Virgin Mojito' },
    update: {},
    create: {
      name: 'Virgin Mojito',
      instructions:
        'Tak samo jak zwykłe mojito, tylko bez rumu. Dla kierowców, ciężarnych i tych co mają rano pracę.',
      categoryId: mocktail.id,
      authorId: user.id,
      ingredients: {
        create: [
          { ingredientId: lime.id, amountValue: 35, amountUnit: 'ml', order: 1 },
          { ingredientId: mint.id, amountText: 'kilka listków', order: 2 },
          { ingredientId: caneSugar.id, amountValue: 2, amountUnit: 'łyżeczki', order: 3 },
          { ingredientId: sodaWater.id, amountValue: 150, amountUnit: 'ml', order: 4 },
        ],
      },
    },
  });

  const screwdriver = await prisma.cocktail.upsert({
    where: { name: 'Screwdriver' },
    update: {},
    create: {
      name: 'Screwdriver',
      instructions:
        'Wlej wódkę do szklanki z lodem, dolej sok pomarańczowy i zamieszaj. Gotowe. Serio, to wszystko.',
      categoryId: classic.id,
      authorId: user.id,
      ingredients: {
        create: [
          { ingredientId: vodka.id, amountValue: 50, amountUnit: 'ml', order: 1 },
          { ingredientId: orangeJuice.id, amountValue: 150, amountUnit: 'ml', order: 2 },
        ],
      },
    },
  });

  const pinaColada = await prisma.cocktail.upsert({
    where: { name: 'Piña Colada' },
    update: {},
    create: {
      name: 'Piña Colada',
      instructions:
        'Zblenduj wszystko z lodem na gładką masę. Przelej do wysokiej szklanki.',
      categoryId: tropical.id,
      authorId: bartender.id,
      ingredients: {
        create: [
          { ingredientId: whiteRum.id, amountValue: 50, amountUnit: 'ml', order: 1 },
          { ingredientId: coconutCream.id, amountValue: 30, amountUnit: 'ml', order: 2 },
          { ingredientId: pineappleJuice.id, amountValue: 120, amountUnit: 'ml', order: 3 },
        ],
      },
    },
  });

  await prisma.review.upsert({
    where: { userId_cocktailId: { userId: user.id, cocktailId: mojito.id } },
    update: {},
    create: {
      userId: user.id,
      cocktailId: mojito.id,
      rating: 5,
      comment: 'Polecam!',
    },
  });

  await prisma.review.upsert({
    where: { userId_cocktailId: { userId: bartender.id, cocktailId: virginMojito.id } },
    update: {},
    create: {
      userId: bartender.id,
      cocktailId: virginMojito.id,
      rating: 3,
      comment: 'Dobre, ale bez rumu to trochę smutne. 3/5 bo nie mam z czym porównać.',
    },
  });

  await prisma.review.upsert({
    where: { userId_cocktailId: { userId: admin.id, cocktailId: screwdriver.id } },
    update: {},
    create: {
      userId: admin.id,
      cocktailId: screwdriver.id,
      rating: 4,
      comment: 'Klasyk. Prosty, szybki, działa. Nie ma co kombinować.',
    },
  });

  await prisma.review.upsert({
    where: { userId_cocktailId: { userId: user.id, cocktailId: pinaColada.id } },
    update: {},
    create: {
      userId: user.id,
      cocktailId: pinaColada.id,
      rating: 5,
      comment: 'Czuję się jak na wakacjach w Chorwacji. 10/10.',
    },
  });

  console.log('Seed imported successfully');
}

main()
  .catch((e) => {
    console.error('Error while seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
