import { PrismaClient } from './generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({ host: 'localhost', user: 'root', database: 'support_portal' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({ take: 5 });
  for (const u of users) {
    console.log(`${u.email} | role: ${u.role} | id: ${u.id}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
