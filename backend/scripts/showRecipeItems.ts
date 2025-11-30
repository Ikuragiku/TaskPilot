import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.recipeItem.findMany({
    include: { recipe: { select: { title: true } } },
    orderBy: [{ recipeId: 'asc' }, { order: 'asc' }]
  });
  
  console.log('\nAll Recipe Items in Database:\n');
  console.log('Recipe'.padEnd(35), '| Type'.padEnd(12), '| Item Name');
  console.log('-'.repeat(80));
  
  items.forEach(it => {
    const recipe = it.recipe.title.padEnd(33);
    const type = it.type.padEnd(10);
    console.log(`${recipe} | ${type} | ${it.name}`);
  });
  
  console.log('\n' + '-'.repeat(80));
  console.log(`Total: ${items.length} items`);
  
  const byType = items.reduce((acc, it) => {
    acc[it.type] = (acc[it.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\nBreakdown:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
