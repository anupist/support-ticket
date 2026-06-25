import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { createHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

export const GET = createHandler(async (req, { user, params }) => {
  const media = await prisma.media.findUnique({
    where: { id: params.id },
  });

  if (!media) throw new NotFoundError('Media');
  if (media.userId !== user.uid && user.role !== 'super_admin') {
    throw new ForbiddenError('You do not have access to this file');
  }

  const filepath = join(process.cwd(), 'private', 'uploads', media.path);
  const buffer = await readFile(filepath);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': media.mimeType,
      'Content-Disposition': `inline; filename="${media.originalName}"`,
      'Cache-Control': 'private, max-age=86400',
    },
  });
});