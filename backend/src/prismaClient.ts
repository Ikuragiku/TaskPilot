import { PrismaClient } from '@prisma/client';

// Single PrismaClient instance for the whole backend
const prisma = new PrismaClient();

export default prisma;
