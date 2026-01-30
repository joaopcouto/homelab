import { PrismaClient } from '../generated/prisma/index.js'; // Note o .js aqui, o Node exige em ESM
const prisma = new PrismaClient();
export default prisma;