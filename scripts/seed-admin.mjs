import { scryptSync, randomUUID } from 'crypto';
import { createConnection } from 'mariadb';

const email = 'admin@support.com';
const password = 'admin123';
const displayName = 'Super Admin';

const salt = randomUUID();
const hash = scryptSync(password, salt, 64).toString('hex');
const passwordHash = `${salt}:${hash}`;

const conn = await createConnection({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  database: process.env.DATABASE_NAME || 'support_portal',
});

const existing = await conn.query(`SELECT id FROM users WHERE email = ?`, [email]);

if (existing.length > 0) {
  console.log(`Admin user already exists with id: ${existing[0].id}`);
} else {
  const id = randomUUID();
  await conn.query(
    `INSERT INTO users (id, email, password_hash, display_name, role, tenant_id, organization_id, is_active, preferences, metadata, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      id,
      email,
      passwordHash,
      displayName,
      'super_admin',
      'default',
      'default',
      true,
      JSON.stringify({ notifications: { email: false, push: false } }),
      JSON.stringify({ lastLoginAt: null, ticketCount: 0 }),
    ]
  );
  console.log(`Super admin created with id: ${id}`);
}

await conn.end();
