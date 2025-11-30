import prisma from '../src/prismaClient';

async function main() {
  const cats = await prisma.groceryCategory.findMany({ orderBy: { order: 'asc' } });
  console.log('Grocery Categories:');
  cats.forEach(c => console.log(`  - ${c.id}: ${c.value}`));
}

main().catch(console.error).finally(() => process.exit(0));
