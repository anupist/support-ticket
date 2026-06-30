import { PrismaClient } from './generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({ host: 'localhost', user: 'root', database: 'support_portal' });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Client query: projectId=null + createdBy=client-uid
  const clientQuery = {
    where: {
      tenantId: 'default',
      projectId: null,
      createdBy: 'c723a1e6-ac9b-44fa-a09e-505d8ad1efc9',
    },
  };

  console.log('Client query:', JSON.stringify(clientQuery));
  
  try {
    const r1 = await prisma.ticket.findMany({ ...clientQuery, take: 10 });
    console.log('findMany result:', r1.length, 'tickets');
    
    const c1 = await prisma.ticket.count(clientQuery);
    console.log('count result:', c1);
  } catch (e: any) {
    console.error('ERROR:', e.message);
    console.error(e.stack?.substring(0, 500));
  }

  // Test with Promise.all
  try {
    const [tickets, count] = await Promise.all([
      prisma.ticket.findMany({ ...clientQuery, orderBy: { lastActivityAt: 'desc' }, skip: 0, take: 10 }),
      prisma.ticket.count(clientQuery),
    ]);
    console.log('\nPromise.all - tickets:', tickets.length, 'count:', count);
  } catch (e: any) {
    console.error('\nPromise.all ERROR:', e.message);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
