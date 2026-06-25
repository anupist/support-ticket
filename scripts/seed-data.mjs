import { createConnection } from 'mariadb';

const conn = await createConnection({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  database: process.env.DATABASE_NAME || 'support_portal',
});

const org = await conn.query(`SELECT id FROM organizations WHERE id = ?`, ['default']);
if (org.length === 0) {
  await conn.query(
    `INSERT INTO organizations (id, name, slug, settings, branding, billing, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    ['default', 'Default Org', 'default', '{}', '{}', '{}', true]
  );
  console.log('Organization seeded');
}

const counter = await conn.query(`SELECT id FROM ticket_number_counters WHERE id = ?`, ['default']);
if (counter.length === 0) {
  await conn.query(
    `INSERT INTO ticket_number_counters (id, current_value) VALUES (?, ?)`,
    ['default', 0]
  );
  console.log('Ticket counter seeded');
}

await conn.end();
console.log('Done');
