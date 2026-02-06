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

  // Time Adjustments (Can be negative, so NO .min(0))
  adjSubuh: z.number().int().optional(),
  adjDzuhur: z.number().int().optional(),
  adjAshar: z.number().int().optional(),
  adjMaghrib: z.number().int().optional(),
  adjIsya: z.number().int().optional(),
  adjImsak: z.number().int().optional(),
  adjTerbit: z.number().int().optional(),
  adjDhuha: z.number().int().optional(),

  // Audio
  enableBeep: z.boolean().optional(),
});

export type UpdateDisplayConfigDto = z.infer<typeof updateDisplayConfigSchema>;
