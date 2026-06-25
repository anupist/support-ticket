import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';

export const POST = createHandler(
  async (req) => {
    return NextResponse.json(
      { error: { code: 'not_implemented', message: 'File upload is not yet available' } },
      { status: 501 }
    );
  },
  { permissions: ['message.reply_public'] }
);