import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { getDatabaseConnectionString } from './connectionString.js';
const adapter = new PrismaPg({
  connectionString: getDatabaseConnectionString(),
  connectionTimeoutMillis: 30_000,
});
export const prisma = new PrismaClient({ adapter });
