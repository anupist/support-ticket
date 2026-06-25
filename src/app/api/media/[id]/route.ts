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

  // Owner always has access
  if (media.userId === user.uid) {
    return serveFile(media);
  }

  // Super admin has access to everything
  if (user.role === 'super_admin') {
    return serveFile(media);
  }

  // Check ticket-based access: find which ticket message references this media
  const result: any[] = await prisma.$queryRawUnsafe(
    `SELECT tm.ticket_id AS ticketId FROM ticket_messages tm WHERE JSON_SEARCH(tm.attachments, 'one', ?) IS NOT NULL LIMIT 1`,
    params.id
  );

  if (result.length > 0) {
    const ticketId = result[0].ticketId;
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { createdBy: true, assignedTo: true },
    });

    if (ticket) {
      // Ticket creator can access attachments on their tickets
      if (ticket.createdBy === user.uid) {
        return serveFile(media);
      }
      // Ticket assignee can access attachments on tickets assigned to them
      if (ticket.assignedTo === user.uid) {
        return serveFile(media);
      }
    }
  }

  throw new ForbiddenError('You do not have access to this file');
});

async function serveFile(media: any) {
  const filepath = join(process.cwd(), 'private', 'uploads', media.path);
  const buffer = await readFile(filepath);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': media.mimeType,
      'Content-Disposition': `inline; filename="${media.originalName}"`,
      'Cache-Control': 'private, max-age=86400',
    },
  });
}