import { z } from 'zod';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { ramadanConfigs, ramadanSchedules } from '../../db/schema';

// Entities
export type RamadanConfig = InferSelectModel<typeof ramadanConfigs>;
export type InsertRamadanConfig = InferInsertModel<typeof ramadanConfigs>;

export type RamadanSchedule = InferSelectModel<typeof ramadanSchedules>;
export type InsertRamadanSchedule = InferInsertModel<typeof ramadanSchedules>;

// Zod Schemas
export const createRamadanConfigSchema = z.object({
  hijriYear: z.number().int(),
  gregorianYear: z.number().int(),
  startDate: z.string(),
  badalImamText: z.string().optional(),
  footerNote: z.string().optional(),
});

export const updateRamadanConfigSchema = createRamadanConfigSchema.partial();

export const updateRamadanScheduleSchema = z.object({
  id: z.number().int(),
  date: z.string().or(z.date()).optional(),
  description: z.string().optional().nullable(),
  imamId: z.number().int().optional().nullable(),
});

// DTOs
export type CreateRamadanConfigDto = z.infer<typeof createRamadanConfigSchema>;
export type UpdateRamadanConfigDto = z.infer<typeof updateRamadanConfigSchema>;
export type UpdateRamadanScheduleDto = z.infer<typeof updateRamadanScheduleSchema>;
