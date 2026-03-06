import { z } from 'zod';

export const createPersonSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['jamaah', 'ustadz', 'pengurus']),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  status: z.union([z.boolean(), z.enum(['true', 'false'])]).optional().default(true),
});
