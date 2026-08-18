import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const pool = new Pool({ connectionString });

async function main() {
  await prisma.user.createMany({
    data: [
      {
        id: crypto.randomUUID(),
        login: 'alice',
        email: 'alice@mail.com',
        description: 'Alice description',
        password: 'hash',
        age: 21,
      },
      {
        id: crypto.randomUUID(),
        login: 'bob',
        email: 'bob@mail.com',
        description: 'Bob description',
        password: 'hash',
        age: 22,
      },
      {
        id: crypto.randomUUID(),
        login: 'bib',
        email: 'bib@mail.com',
        description: 'Bib description',
        password: 'hash',
        age: 22,
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
