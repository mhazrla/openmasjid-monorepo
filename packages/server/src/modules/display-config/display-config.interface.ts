import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { displayConfig } from '../../db/schema';
import { z } from 'zod';

// Entity Types
export type DisplayConfig = InferSelectModel<typeof displayConfig>;
export type InsertDisplayConfig = InferInsertModel<typeof displayConfig>;

// Zod Schema for Validation
export const updateDisplayConfigSchema = z.object({
  cityId: z.string().min(1, 'City ID required'),
  mosqueName: z.string().optional(),
  runningText: z.string().optional(),
  
  // Timings - Must be positive integers
  preAdzanDuration: z.number().int().min(0).optional(),
  adzanDuration: z.number().int().min(0).optional(),
  iqomahDelaySubuh: z.number().int().min(0).optional(),
  iqomahDelayDzuhur: z.number().int().min(0).optional(),
  iqomahDelayAshar: z.number().int().min(0).optional(),
  iqomahDelayMaghrib: z.number().int().min(0).optional(),
  iqomahDelayIsya: z.number().int().min(0).optional(),
  prayerDuration: z.number().int().min(0).optional(),

  // Audio
  enableBeep: z.boolean().optional(),
});

export type UpdateDisplayConfigDto = z.infer<typeof updateDisplayConfigSchema>;
