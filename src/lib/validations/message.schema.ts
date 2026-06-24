import { z } from 'zod';

export const createMessageSchema = z.object({
  body: z
    .string()
    .min(1, 'Message body is required')
    .max(10000, 'Message body must be at most 10000 characters'),
  messageType: z.enum(['public', 'internal_note']),
  attachmentIds: z.array(z.string()).max(10).optional(),
});
