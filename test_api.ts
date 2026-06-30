import { PrismaClient } from './generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { randomBytes } from 'crypto';
import * as http from 'http';

const adapter = new PrismaMariaDb({ host: 'localhost', user: 'root', database: 'support_portal' });
const prisma = new PrismaClient({ adapter });

function makeRequest(path: string, cookie: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const opts: http.RequestOptions = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers: { Cookie: cookie },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const token = randomBytes(32).toString('hex');
  const userId = 'c723a1e6-ac9b-44fa-a09e-505d8ad1efc9';

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
    },
  });

  const cookie = `session=${token}`;

  console.log('\n--- Test 1: No project filter ---');
  const r1 = await makeRequest('/api/tickets?page=1&limit=10', cookie);
  console.log(`Status: ${r1.status}, tickets: ${r1.body?.tickets?.length}, totalCount: ${r1.body?.totalCount}`);

  console.log('\n--- Test 2: General filter (projectId=__none__) ---');
  const r2 = await makeRequest('/api/tickets?projectId=__none__&page=1&limit=10', cookie);
  console.log(`Status: ${r2.status}, error: ${JSON.stringify(r2.body?.error)}, body: ${JSON.stringify(r2.body)}`);

  console.log('\n--- Test 3: With explicit empty projectId ---');
  const r3 = await makeRequest('/api/tickets?projectId=&page=1&limit=10', cookie);
  console.log(`Status: ${r3.status}, tickets: ${r3.body?.tickets?.length}, totalCount: ${r3.body?.totalCount}`);

  console.log('\n--- Test 4: Without projectId ---');
  const r4 = await makeRequest('/api/tickets?page=1&limit=10', cookie);
  console.log(`Status: ${r4.status}, tickets: ${r4.body?.tickets?.length}, totalCount: ${r4.body?.totalCount}`);

  await prisma.session.delete({ where: { token } });
  console.log('\nDone');
}
main().catch(console.error).finally(() => prisma.$disconnect());
