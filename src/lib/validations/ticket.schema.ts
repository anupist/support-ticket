import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be at most 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  categoryId: z.string().min(1, 'Category is required'),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export const updateTicketSchema = z.object({
  status: z
    .enum(['open', 'in_progress', 'waiting_on_client', 'waiting_on_agent', 'resolved', 'closed'])
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  categoryId: z.string().min(1).optional(),
  assignedTo: z.string().nullable().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export const assignTicketSchema = z.object({
  assignedTo: z.string().min(1, 'Agent ID is required'),
});
