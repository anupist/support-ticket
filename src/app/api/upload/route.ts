import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { getAdminStorage } from '@/lib/firebase-admin';

export const POST = createHandler(
  async (req, { user }) => {
    const { fileName, mimeType } = await req.json();

    if (!fileName || !mimeType) {
      return NextResponse.json(
        { error: { code: 'validation_error', message: 'fileName and mimeType are required' } },
        { status: 400 }
      );
    }

    const bucket = getAdminStorage().bucket();
    const filePath = `attachments/${user.tenantId}/${Date.now()}_${fileName}`;
    const file = bucket.file(filePath);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType: mimeType,
    });

    const [publicUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    });

    return NextResponse.json({
      uploadUrl: signedUrl,
      publicUrl,
      filePath,
    });
  },
  { permissions: ['message.reply_public'] }
);
