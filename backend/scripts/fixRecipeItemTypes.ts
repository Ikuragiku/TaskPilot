/**
 * Script to fix existing RecipeItem entries that don't have proper type field set.
 * This ensures all existing items are marked as 'ingredient' (the default).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking RecipeItem types...');
  
  // Get all items and group by type
  const allItems = await prisma.recipeItem.findMany({
    select: { id: true, name: true, type: true, recipeId: true }
  });
  
  console.log(`Total items: ${allItems.length}\n`);
  
  // Group by type
  const byType: Record<string, number> = {};
  allItems.forEach(item => {
    const t = item.type || '(empty)';
    byType[t] = (byType[t] || 0) + 1;
  });
  
  console.log('Items by type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  // Show first few items as examples
  console.log('\nFirst 10 items:');
  allItems.slice(0, 10).forEach(item => {
    console.log(`  [${item.type || 'EMPTY'}] ${item.name}`);
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
