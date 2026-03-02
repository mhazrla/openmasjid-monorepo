import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { dsConfig } from '../../db/schema';
import { z } from 'zod';

// Entity Types
export type DisplayConfig = InferSelectModel<typeof dsConfig>;
export type InsertDisplayConfig = InferInsertModel<typeof dsConfig>;

// Zod Schema for Validation
export const updateDisplayConfigSchema = z.object({
  cityId: z.string().min(1, 'City ID required'),
  runningText: z.string().optional(),
  
  // Timings - Must be positive integers
  preAdzanDuration: z.number().int().min(0).optional(),
  adzanDuration: z.number().int().min(0).optional(),
  iqomahDelaySubuh: z.number().int().min(0).optional(),
  iqomahDelayDzuhur: z.number().int().min(0).optional(),
  iqomahDelayAshar: z.number().int().min(0).optional(),
  iqomahDelayMaghrib: z.number().int().min(0).optional(),
  iqomahDelayIsya: z.number().int().min(0).optional(),
  shalatDurationSubuh: z.number().int().min(1).optional(),
  shalatDurationDzuhur: z.number().int().min(1).optional(),
  shalatDurationAshar: z.number().int().min(1).optional(),
  shalatDurationMaghrib: z.number().int().min(1).optional(),
  shalatDurationIsya: z.number().int().min(1).optional(),
  
  // Mode Toggles
  enablePreAdzan: z.boolean().optional(),
  enableAdzan: z.boolean().optional(),
  enableIqomah: z.boolean().optional(),
  enableShalat: z.boolean().optional(),

  // Time Adjustments (Can be negative, so NO .min(0))
  adjSubuh: z.number().int().optional(),
  adjDzuhur: z.number().int().optional(),
  adjAshar: z.number().int().optional(),
  adjMaghrib: z.number().int().optional(),
  adjIsya: z.number().int().optional(),
  adjImsak: z.number().int().optional(),
  adjTerbit: z.number().int().optional(),
  adjDhuha: z.number().int().optional(),
  hijriAdj: z.number().int().optional(),

  // Audio
  enableBeep: z.boolean().optional(),

  // Theme Config
  themeColor: z.string().optional(),
  accentColor: z.string().optional(),
  labelColor: z.string().optional(),
  fontFamily: z.string().optional(),
  baseFontSize: z.number().int().min(50).max(200).optional(),
  clockFontSize: z.number().int().min(50).max(200).optional(),
  labelFontSize: z.number().int().min(50).max(200).optional(),
});

export type UpdateDisplayConfigDto = z.infer<typeof updateDisplayConfigSchema>;
