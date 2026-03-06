import { z } from 'zod';

export const createRamadanConfigSchema = z.object({
  hijriYear: z.number().int(),
  gregorianYear: z.number().int(),
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  startDate: z.string(),
  badalImamText: z.string().optional(),
  footerNote: z.string().optional(),
});

export const updateRamadanConfigSchema = createRamadanConfigSchema.partial();
