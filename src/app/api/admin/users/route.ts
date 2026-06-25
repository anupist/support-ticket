import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateSessionToken } from '@/lib/auth';
import { sendCredentialsEmail } from '@/lib/services/mail.service';
import { DEFAULT_TENANT_ID } from '@/lib/constants';
import { handleApiError, ConflictError } from '@/lib/errors';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  role: z.enum(['client', 'agent', 'super_admin']),
  customRoleId: z.string().nullable().optional(),
});

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pw = '';
  for (let i = 0; i < 12; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

export const POST = createHandler(
  async (req, { user }) => {
    try {
      const body = await req.json();
      const parsed = createUserSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: parsed.error.errors },
          { status: 400 }
        );
      }

      const { email, displayName, role, customRoleId } = parsed.data;

      if (customRoleId) {
        const roleExists = await prisma.customRole.findUnique({ where: { id: customRoleId } });
        if (!roleExists) {
          return NextResponse.json({ error: { code: 'not_found', message: 'Custom role not found' } }, { status: 400 });
        }
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new ConflictError('Email already in use');

      const tempPassword = generateTempPassword();

      const newUser = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email,
          passwordHash: hashPassword(tempPassword),
          displayName,
          role: customRoleId ? 'agent' : role,
          customRoleId: customRoleId || null,
          mustChangePassword: true,
          tenantId: DEFAULT_TENANT_ID,
          organizationId: DEFAULT_TENANT_ID,
          preferences: { notifications: { email: false, push: false } },
          metadata: { lastLoginAt: null, ticketCount: 0 },
        },
      });

      const loginLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`;
      await sendCredentialsEmail(email, displayName, tempPassword, loginLink).catch(() => {});

      return NextResponse.json({
        user: {
          id: newUser.id,
          email: newUser.email,
          displayName: newUser.displayName,
          role: newUser.role,
        },
      }, { status: 201 });
    } catch (err) {
      return handleApiError(err);
    }
  },
  { roles: ['super_admin'] }
);