import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export const POST = createHandler(async (req, { user }) => {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'File is required' } },
      { status: 400 }
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'File size exceeds 5MB limit' } },
      { status: 400 }
    );
  }

  const ext = file.name.split('.').pop() || 'bin';
  const uuid = randomUUID();
  const filename = `${uuid}.${ext}`;
  const dir = join(process.cwd(), 'private', 'uploads', user.tenantId, user.uid);
  const filepath = join(dir, filename);

  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const media = await prisma.media.create({
    data: {
      userId: user.uid,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: `${user.tenantId}/${user.uid}/${filename}`,
    },
  });

  return NextResponse.json({
    media: {
      id: media.id,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
      url: `/api/media/${media.id}`,
      createdAt: media.createdAt.getTime(),
    },
  });
});