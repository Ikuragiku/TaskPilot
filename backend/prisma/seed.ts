/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default status options
  const statusOptions = [
    { value: 'To Do', color: '#9E9E9E', order: 1 },
    { value: 'In Progress', color: '#2196F3', order: 2 },
    { value: 'Review', color: '#FF9800', order: 3 },
    { value: 'Done', color: '#4CAF50', order: 4 },
    { value: 'Blocked', color: '#F44336', order: 5 },
  ];

  for (const status of statusOptions) {
    await prisma.statusOption.upsert({
      where: { value: status.value },
      update: {},
      create: status,
    });
  }

  console.log(`✅ Created ${statusOptions.length} status options`);

  // Create default project options
  const projectOptions = [
    { value: 'Work', color: '#3F51B5', order: 1 },
    { value: 'Personal', color: '#9C27B0', order: 2 },
    { value: 'Shopping', color: '#00BCD4', order: 3 },
    { value: 'Health', color: '#4CAF50', order: 4 },
    { value: 'Learning', color: '#FF9800', order: 5 },
  ];

  for (const project of projectOptions) {
    await prisma.projectOption.upsert({
      where: { value: project.value },
      update: {},
      create: project,
    });
  }

  console.log(`✅ Created ${projectOptions.length} project options`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
