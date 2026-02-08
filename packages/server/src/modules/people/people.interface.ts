import { z } from 'zod';

export const createPersonSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['jamaah', 'ustadz', 'pengurus']),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

export const updatePersonSchema = createPersonSchema.partial().extend({
  status: z.enum(['active', 'inactive']).optional()
});

export const getPeopleQuerySchema = z.object({
  type: z.enum(['jamaah', 'ustadz', 'pengurus']).optional()
});

// Typescript Interfaces (Inferred)
export type CreatePersonDto = z.infer<typeof createPersonSchema>;
export type UpdatePersonDto = z.infer<typeof updatePersonSchema>;