/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const p: any = prisma;

async function main() {
  console.log('Seeding database...');
  // Wipe existing data (safe for local/dev only)
  console.log('Clearing existing records...');
  // Delete order matters due to foreign keys; use deleteMany which follows cascade rules set in schema
  await prisma.taskStatus.deleteMany();
  await prisma.taskProject.deleteMany();
  await prisma.task.deleteMany();
  await prisma.statusOption.deleteMany();
  await prisma.projectOption.deleteMany();

  await prisma.groceryCategoryAssignment.deleteMany();
  await prisma.grocery.deleteMany();
  await prisma.groceryCategory.deleteMany();

  // Recipes (if present) - new models
  try {
    await p.recipeCategoryAssignment.deleteMany();
    await p.recipeItem.deleteMany();
    await p.recipe.deleteMany();
    await p.recipeCategory.deleteMany();
  } catch (err) {
    // Models may not exist before migration; ignore errors
  }

  // Sessions and preferences and users
  await prisma.session.deleteMany();
  await prisma.userPreferences?.deleteMany?.().catch(() => {});
  // Remove all users (we will recreate a seed user)
  await prisma.user.deleteMany();

  console.log('✅ Database cleared');

  // Create a default user for testing/login
  const seedUsername = 'baxxter';
  const seedPassword = '123456';
  const hashed = await bcrypt.hash(seedPassword, 10);
  const user = await prisma.user.create({
    data: {
      username: seedUsername,
      password: hashed,
      name: 'LW',
    } as any,
  });
  console.log(`✅ Created test user: ${seedUsername}`);

  // Create default status options
  const statusOptions = [
    { value: 'To Do', color: '#484f58', order: 1 },
    { value: 'Working', color: '#3fb950', order: 2 },
    { value: 'Waiting', color: '#484f58', order: 3 },
  ];

  for (const status of statusOptions) {
    await prisma.statusOption.upsert({
      where: { value: status.value },
      update: {},
      create: status,
    });
  }

  console.log(`Created ${statusOptions.length} status options`);

  // Create default project options
  const projectOptions = [
    { value: 'Baxxter', color: '#e3b341', order: 1 },
    { value: 'Blaze', color: '#2f81f7', order: 2 },

  ];

  for (const project of projectOptions) {
    await prisma.projectOption.upsert({
      where: { value: project.value },
      update: {},
      create: project,
    });
  }

  console.log(`Created ${projectOptions.length} project options`);

  // Create default grocery categories
  const groceryCategories = [
    { value: 'Obst / Gemüse', color: '#3fb950', order: 1 },
    { value: 'TK', color: '#06b6d4', order: 2 },
    { value: 'Fleisch', color: '#f85149', order: 3 },
    { value: 'Käse', color: '#e3b341', order: 4 },
    { value: 'Konserven', color: '#484f58', order: 5 },
    { value: 'Drogerie', color: '#14b8a6', order: 6 },
  ];

  for (const cat of groceryCategories) {
    const exists = await prisma.groceryCategory.findFirst({ where: { value: cat.value } as any });
    if (!exists) {
      await prisma.groceryCategory.create({ data: cat as any });
    }
  }

  console.log(`Created ${groceryCategories.length} grocery categories`);

  // Fetch created options and categories for associations
  const statuses = await prisma.statusOption.findMany();
  const projects = await prisma.projectOption.findMany();
  const categories = await prisma.groceryCategory.findMany();

  const statusByValue = new Map(statuses.map(s => [s.value, s.id]));
  const projectByValue = new Map(projects.map(p => [p.value, p.id]));
  const categoryByValue = new Map(categories.map(c => [c.value, c.id]));

  // Sample tasks
  const sampleTasks = [
    {
      title: 'Buy light bulbs',
      description: 'Replace kitchen and hallway bulbs',
      statuses: ['To Do'],
      projects: ['Blaze'],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    },
    {
      title: 'Prepare presentation',
      description: 'Slides for Monday meeting',
      statuses: ['Working'],
      projects: ['Baxxter'],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
    {
      title: 'Call plumber',
      description: 'Fix bathroom leak',
      statuses: ['Waiting'],
      projects: ['Blaze'],
    },
  ];

  for (const t of sampleTasks) {
    const exists = await prisma.task.findFirst({ where: { title: t.title, userId: user.id } });
    if (exists) continue;
    const created = await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        deadline: t.deadline || null,
        userId: user.id,
      },
    });

    // Link statuses
    for (const s of t.statuses || []) {
      const sid = statusByValue.get(s);
      if (sid) {
        await prisma.taskStatus.create({ data: { taskId: created.id, statusOptionId: sid } });
      }
    }

    // Link projects
    for (const p of t.projects || []) {
      const pid = projectByValue.get(p);
      if (pid) {
        await prisma.taskProject.create({ data: { taskId: created.id, projectOptionId: pid } });
      }
    }
  }

  console.log(`Created sample tasks`);

  // Sample groceries
  const sampleGroceries = [
    { title: 'Bananas', menge: '6', categories: ['Obst / Gemüse'] },
    { title: 'Milk', menge: '2L', categories: ['Käse'] },
    { title: 'Schnitzel', menge: '1', categories: ['Fleisch'] },
  ];

  for (const g of sampleGroceries) {
    const exists = await prisma.grocery.findFirst({ where: { title: g.title, userId: user.id } });
    if (exists) continue;
    const created = await prisma.grocery.create({ data: { title: g.title, menge: g.menge, userId: user.id } });
    for (const c of g.categories || []) {
      const cid = categoryByValue.get(c);
      if (cid) {
        await prisma.groceryCategoryAssignment.create({ data: { groceryId: created.id, groceryCategoryId: cid } });
      }
    }
  }

  console.log('Created sample groceries');

  // --- Recipes sample data (stored in separate recipe tables) ---
  // Create some recipe categories
  const recipeCats = [
    { value: 'Dinner', color: '#2f81f7', order: 1 },
    { value: 'Dessert', color: '#ff4da6', order: 2 },
    { value: 'Breakfast', color: '#e3b341', order: 3 },
  ];
  for (const rc of recipeCats) {
    const exists = await p.recipeCategory.findFirst({ where: { value: rc.value } as any });
    if (!exists) {
      await p.recipeCategory.create({ data: rc as any });
    }
  }
  const dbRecipeCats = await p.recipeCategory.findMany();
  const recipeCatByValue = new Map(dbRecipeCats.map((c: any) => [c.value, c.id]));

  // Create sample recipes
  const sampleRecipes = [
    {
      title: 'Spaghetti Aglio e Olio',
      description: 'Classic Italian pasta with garlic, olive oil, chili flakes and parsley.',
      portions: 2,
      categories: ['Dinner'],
      items: ['Spaghetti 200g', 'Garlic 3 cloves', 'Olive oil 3 tbsp', 'Chili flakes 1 tsp', 'Parsley handful']
    },
    {
      title: 'Pancakes',
      description: 'Fluffy pancakes served with syrup.',
      portions: 4,
      categories: ['Breakfast', 'Dessert'],
      items: ['Flour 200g', 'Milk 300ml', 'Eggs 2', 'Sugar 2 tbsp', 'Baking powder 1 tsp']
    }
  ];

  for (const r of sampleRecipes) {
    const exists = await p.recipe.findFirst({ where: { title: r.title, userId: user.id } as any });
    if (exists) continue;
    const created = await p.recipe.create({ data: { title: r.title, description: r.description, portions: r.portions, userId: user.id } as any });
    // items
    for (let i = 0; i < (r.items || []).length; i++) {
      const name = r.items[i];
      await p.recipeItem.create({ data: { recipeId: created.id, name, order: i } as any });
    }
    // categories
    for (const cv of (r.categories || [])) {
      const cid = recipeCatByValue.get(cv);
      if (cid) {
        await p.recipeCategoryAssignment.create({ data: { recipeId: created.id, recipeCategoryId: cid } as any });
      }
    }
  }

  console.log('Created sample recipes');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
