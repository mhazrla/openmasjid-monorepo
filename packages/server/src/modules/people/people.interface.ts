import { z } from 'zod';

export const createPersonSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['jamaah', 'ustadz', 'pengurus']),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  status: z.boolean().optional().default(true),
});

export const updatePersonSchema = createPersonSchema.partial().extend({
  status: z.boolean().optional()
});

export const getPeopleQuerySchema = z.object({
  type: z.enum(['jamaah', 'ustadz', 'pengurus' ,'all']).optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(), 
  search: z.string().optional(),
});

export type CreatePersonDto = z.infer<typeof createPersonSchema>;
export type UpdatePersonDto = z.infer<typeof updatePersonSchema>;