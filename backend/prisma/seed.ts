import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // ── Users ──────────────────────────────────────────────────────────────────
  const hash = (pw: string) => bcrypt.hash(pw, 12);
  await prisma.user.upsert({ where: { email: 'admin@cafe.com' },   update: {}, create: { name: 'Admin',          email: 'admin@cafe.com',   password: await hash('password123'), role: 'ADMIN'   } });
  await prisma.user.upsert({ where: { email: 'cashier@cafe.com' }, update: {}, create: { name: 'Jane Cashier',   email: 'cashier@cafe.com', password: await hash('password123'), role: 'CASHIER' } });
  await prisma.user.upsert({ where: { email: 'kitchen@cafe.com' }, update: {}, create: { name: 'Chef Mike',      email: 'kitchen@cafe.com', password: await hash('password123'), role: 'KITCHEN' } });

  // ── Categories ─────────────────────────────────────────────────────────────
  const [coffee, breakfast, burgers, sandwiches, sides, salads, desserts, drinks] = await Promise.all([
    prisma.category.create({ data: { name: 'Coffee & Espresso', color: '#92400e' } }),
    prisma.category.create({ data: { name: 'Breakfast',         color: '#f97316' } }),
    prisma.category.create({ data: { name: 'Burgers',           color: '#dc2626' } }),
    prisma.category.create({ data: { name: 'Sandwiches & Wraps',color: '#16a34a' } }),
    prisma.category.create({ data: { name: 'Sides & Snacks',    color: '#ca8a04' } }),
    prisma.category.create({ data: { name: 'Salads & Bowls',    color: '#059669' } }),
    prisma.category.create({ data: { name: 'Desserts & Bakes',  color: '#db2777' } }),
    prisma.category.create({ data: { name: 'Cold Drinks',       color: '#2563eb' } }),
  ]);

  // ── Products ───────────────────────────────────────────────────────────────
  const products = [
    // Coffee & Espresso
    { name: 'Espresso',              price: 3.50,  tax: 0, categoryId: coffee.id,     description: 'Double shot of rich, dark espresso' },
    { name: 'Americano',             price: 4.00,  tax: 0, categoryId: coffee.id,     description: 'Espresso diluted with hot water' },
    { name: 'Cappuccino',            price: 5.00,  tax: 0, categoryId: coffee.id,     description: 'Espresso topped with steamed milk foam' },
    { name: 'Latte',                 price: 5.50,  tax: 0, categoryId: coffee.id,     description: 'Smooth espresso with steamed milk' },
    { name: 'Flat White',            price: 5.00,  tax: 0, categoryId: coffee.id,     description: 'Ristretto with silky microfoam milk' },
    { name: 'Caramel Macchiato',     price: 6.00,  tax: 0, categoryId: coffee.id,     description: 'Vanilla latte with caramel drizzle' },
    { name: 'Mocha',                 price: 5.75,  tax: 0, categoryId: coffee.id,     description: 'Espresso with chocolate and steamed milk' },
    { name: 'Cold Brew',             price: 5.50,  tax: 0, categoryId: coffee.id,     description: '12-hour slow-steeped cold brew coffee' },

    // Breakfast
    { name: 'Classic Eggs Benedict', price: 14.00, tax: 8, categoryId: breakfast.id, description: 'Poached eggs, Canadian bacon on English muffin with hollandaise' },
    { name: 'Buttermilk Pancakes',   price: 11.00, tax: 8, categoryId: breakfast.id, description: 'Stack of 3 fluffy pancakes with maple syrup & butter' },
    { name: 'Avocado Toast',         price: 13.00, tax: 8, categoryId: breakfast.id, description: 'Sourdough, smashed avo, poached egg, everything bagel spice' },
    { name: 'Full American Breakfast',price: 16.00,tax: 8, categoryId: breakfast.id, description: 'Eggs, bacon, sausage, hash browns, toast & baked beans' },
    { name: 'Breakfast Burrito',     price: 12.00, tax: 8, categoryId: breakfast.id, description: 'Scrambled eggs, cheddar, salsa, avocado in a warm flour tortilla' },
    { name: 'Granola Bowl',          price: 9.00,  tax: 8, categoryId: breakfast.id, description: 'House granola, Greek yogurt, fresh berries & honey' },
    { name: 'French Toast',          price: 11.00, tax: 8, categoryId: breakfast.id, description: 'Thick-cut brioche, cinnamon, powdered sugar, berry compote' },

    // Burgers
    { name: 'Classic Smash Burger',  price: 15.00, tax: 8, categoryId: burgers.id,   description: 'Double smash patty, American cheese, pickles, special sauce' },
    { name: 'BBQ Bacon Burger',      price: 17.00, tax: 8, categoryId: burgers.id,   description: 'Beef patty, crispy bacon, cheddar, BBQ sauce, onion rings' },
    { name: 'Mushroom Swiss Burger', price: 16.00, tax: 8, categoryId: burgers.id,   description: 'Sautéed mushrooms, Swiss cheese, garlic aioli' },
    { name: 'Crispy Chicken Burger', price: 15.50, tax: 8, categoryId: burgers.id,   description: 'Buttermilk fried chicken, coleslaw, pickles, honey mustard' },
    { name: 'Veggie Black Bean Burger', price: 14.00, tax: 8, categoryId: burgers.id,'description': 'Black bean patty, pepper jack, avocado, chipotle mayo' },
    { name: 'Truffle Mushroom Burger', price: 18.00, tax: 8, categoryId: burgers.id, description: 'Wagyu beef, truffle aioli, caramelised onion, gruyère' },

    // Sandwiches & Wraps
    { name: 'Club Sandwich',         price: 13.00, tax: 8, categoryId: sandwiches.id, description: 'Triple-decker turkey, bacon, lettuce, tomato on toasted white' },
    { name: 'Philly Cheesesteak',    price: 15.00, tax: 8, categoryId: sandwiches.id, description: 'Shaved ribeye, sautéed peppers & onions, provolone on hoagie' },
    { name: 'BLT',                   price: 11.00, tax: 8, categoryId: sandwiches.id, description: 'Crispy bacon, iceberg lettuce, tomato, mayo on sourdough' },
    { name: 'Grilled Cheese',        price: 10.00, tax: 8, categoryId: sandwiches.id, description: 'Three-cheese blend on thick-cut buttered sourdough' },
    { name: 'Chicken Caesar Wrap',   price: 13.00, tax: 8, categoryId: sandwiches.id, description: 'Grilled chicken, romaine, parmesan, croutons, Caesar dressing' },
    { name: 'Turkey Pesto Panini',   price: 13.50, tax: 8, categoryId: sandwiches.id, description: 'Smoked turkey, sun-dried tomato pesto, mozzarella, pressed' },

    // Sides & Snacks
    { name: 'Loaded Fries',          price: 9.00,  tax: 8, categoryId: sides.id,     description: 'Crispy fries, cheddar sauce, bacon bits, jalapeños, sour cream' },
    { name: 'Classic Fries',         price: 5.00,  tax: 8, categoryId: sides.id,     description: 'Golden crispy fries with sea salt' },
    { name: 'Onion Rings',           price: 6.00,  tax: 8, categoryId: sides.id,     description: 'Beer-battered onion rings with ranch dip' },
    { name: 'Mac & Cheese Bites',    price: 8.00,  tax: 8, categoryId: sides.id,     description: 'Crispy fried mac & cheese balls with chipotle dip' },
    { name: 'Chicken Wings (6 pcs)', price: 13.00, tax: 8, categoryId: sides.id,     description: 'Choice of buffalo, BBQ or garlic parmesan, celery & ranch' },
    { name: 'Mozzarella Sticks',     price: 8.50,  tax: 8, categoryId: sides.id,     description: 'Golden fried mozzarella with marinara dipping sauce' },
    { name: 'Coleslaw',              price: 3.50,  tax: 0, categoryId: sides.id,     description: 'Creamy house-made coleslaw' },

    // Salads & Bowls
    { name: 'Caesar Salad',          price: 12.00, tax: 8, categoryId: salads.id,    description: 'Romaine, parmesan, house croutons, Caesar dressing' },
    { name: 'Cobb Salad',            price: 15.00, tax: 8, categoryId: salads.id,    description: 'Grilled chicken, bacon, avocado, egg, blue cheese, ranch' },
    { name: 'Greek Salad',           price: 12.00, tax: 8, categoryId: salads.id,    description: 'Cucumber, tomato, olives, feta, red onion, oregano vinaigrette' },
    { name: 'Grain Bowl',            price: 14.00, tax: 8, categoryId: salads.id,    description: 'Quinoa, roasted veggies, avocado, tahini dressing' },
    { name: 'BBQ Chicken Salad',     price: 15.00, tax: 8, categoryId: salads.id,    description: 'Grilled BBQ chicken, corn, black beans, tortilla strips' },

    // Desserts
    { name: 'New York Cheesecake',   price: 7.50,  tax: 0, categoryId: desserts.id,  description: 'Classic NY-style with graham cracker crust & berry coulis' },
    { name: 'Chocolate Brownie',     price: 6.50,  tax: 0, categoryId: desserts.id,  description: 'Warm fudge brownie with vanilla ice cream & hot fudge' },
    { name: 'Apple Pie',             price: 7.00,  tax: 0, categoryId: desserts.id,  description: 'Classic double-crust apple pie with cinnamon ice cream' },
    { name: 'Cookie Skillet',        price: 9.00,  tax: 0, categoryId: desserts.id,  description: 'Giant warm chocolate chip cookie with two scoops of ice cream' },
    { name: 'Banana Foster Waffles', price: 10.00, tax: 0, categoryId: desserts.id,  description: 'Belgian waffles, caramelised banana, rum sauce, whipped cream' },
    { name: 'Muffin of the Day',     price: 4.00,  tax: 0, categoryId: desserts.id,  description: 'Freshly baked large muffin — ask server for today\'s flavor' },

    // Cold Drinks
    { name: 'Fresh Lemonade',        price: 4.50,  tax: 0, categoryId: drinks.id,    description: 'Hand-squeezed lemonade, still or sparkling' },
    { name: 'Iced Tea',              price: 3.50,  tax: 0, categoryId: drinks.id,    description: 'Southern-style sweet tea or unsweetened' },
    { name: 'Milkshake',             price: 7.50,  tax: 0, categoryId: drinks.id,    description: 'Thick shake — vanilla, chocolate or strawberry' },
    { name: 'Strawberry Lemonade',   price: 5.50,  tax: 0, categoryId: drinks.id,    description: 'Fresh lemonade blended with strawberry purée' },
    { name: 'Sparkling Water',       price: 2.50,  tax: 0, categoryId: drinks.id,    description: 'San Pellegrino sparkling mineral water' },
    { name: 'Orange Juice',          price: 4.50,  tax: 0, categoryId: drinks.id,    description: 'Freshly squeezed orange juice' },
    { name: 'Iced Latte',            price: 5.50,  tax: 0, categoryId: drinks.id,    description: 'Espresso over ice with cold milk of your choice' },
    { name: 'Frappuccino',           price: 7.00,  tax: 0, categoryId: drinks.id,    description: 'Blended iced coffee, caramel or mocha, whipped cream' },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // ── Floors & Tables ─────────────────────────────────────────────────────────
  const floor1 = await prisma.floor.upsert({ where: { id: 'floor-1' }, update: {}, create: { id: 'floor-1', name: 'Ground Floor' } });
  const floor2 = await prisma.floor.upsert({ where: { id: 'floor-2' }, update: {}, create: { id: 'floor-2', name: 'First Floor'  } });
  for (let i = 1; i <= 8; i++) {
    const ex = await prisma.table.findFirst({ where: { tableNumber: i, floorId: floor1.id } });
    if (!ex) await prisma.table.create({ data: { tableNumber: i, seats: i <= 4 ? 2 : 4, floorId: floor1.id } });
  }
  for (let i = 1; i <= 6; i++) {
    const ex = await prisma.table.findFirst({ where: { tableNumber: i + 10, floorId: floor2.id } });
    if (!ex) await prisma.table.create({ data: { tableNumber: i + 10, seats: 4, floorId: floor2.id } });
  }

  // ── Coupons ─────────────────────────────────────────────────────────────────
  await prisma.coupon.upsert({ where: { code: 'WELCOME10' }, update: {}, create: { code: 'WELCOME10', discountType: 'PERCENTAGE', discountValue: 10,  active: true } });
  await prisma.coupon.upsert({ where: { code: 'SAVE5'     }, update: {}, create: { code: 'SAVE5',     discountType: 'FIXED',      discountValue: 5,   active: true } });
  await prisma.coupon.upsert({ where: { code: 'LUNCH20'   }, update: {}, create: { code: 'LUNCH20',   discountType: 'PERCENTAGE', discountValue: 20,  active: true } });

  console.log(`✅ Seeded: 8 categories, ${products.length} American cafe products, 14 tables, 3 coupons`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect().then(() => pool.end()));
