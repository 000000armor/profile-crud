import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const pool = new Pool({ connectionString });

async function main() {
  await prisma.user.createMany({
    data: [
      {
        id: crypto.randomUUID(),
        login: 'alice123',
        email: 'alice@mail.com',
        description: 'Alice description',
        password: await bcrypt.hash('password123', 10),
        age: 21,
        deletedAt: null,
      },
      {
        id: crypto.randomUUID(),
        login: 'bob123',
        email: 'bob@mail.com',
        description: 'Bob description',
        password: await bcrypt.hash('password123', 10),
        age: 22,
        deletedAt: null,
      },
      {
        id: crypto.randomUUID(),
        login: 'bib123',
        email: 'bib@mail.com',
        description: 'Bib description',
        password: await bcrypt.hash('password123', 10),
        age: 22,
        deletedAt: '2026-08-23T21:00:00.000Z',
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error('Failed to perform seed', error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
