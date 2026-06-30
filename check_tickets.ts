import { PrismaClient } from './generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: 'localhost',
  user: 'root',
  database: 'support_portal'
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const tickets = await prisma.ticket.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
  console.log('Recent tickets:');
  for (const t of tickets) {
    console.log(`  #${t.ticketNumber} | projectId: ${JSON.stringify(t.projectId)} | projectName: ${JSON.stringify(t.projectName)}`);
  }
  const nullCount = await prisma.ticket.count({ where: { projectId: null } });
  console.log('Tickets with projectId = null:', nullCount);
  const allCount = await prisma.ticket.count();
  console.log('Total tickets:', allCount);
  
  const agentQuery = await prisma.ticket.findMany({
    where: {
      projectId: null,
      OR: [{ createdBy: { not: 'nonexistent' } }, { assignedTo: { not: 'nonexistent' } }]
    },
    take: 3
  });
  console.log('Agent-like query (projectId=null + OR) found:', agentQuery.length, 'tickets');

  const clientQuery = await prisma.ticket.findMany({
    where: {
      projectId: null,
      createdBy: { not: 'nonexistent' }
    },
    take: 3
  });
  console.log('Client-like query (projectId=null + createdBy) found:', clientQuery.length, 'tickets');
}

main().catch(console.error).finally(() => prisma.$disconnect());
