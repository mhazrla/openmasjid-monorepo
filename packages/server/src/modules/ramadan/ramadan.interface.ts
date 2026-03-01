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
  title: z.string(),
  subtitle: z.string(),
  startDate: z.string(),
  badalImamText: z.string().optional(),
  footerNote: z.string().optional(),
});

export const updateRamadanConfigSchema = createRamadanConfigSchema.partial();

export const updateRamadanScheduleSchema = z.object({
  id: z.number().int(),
  date: z.string().or(z.date()).optional(),
  description: z.string().optional().nullable(),

  // 1. Tarawih Prayer
  tarawihImamId: z.number().int().optional().nullable(),

  // 2. Iftar Meal & Lecture (Makan Berat & Kajian)
  iftarSpeakerId: z.number().int().optional().nullable(),
  iftarKajianTitle: z.string().optional().nullable(),

  // 3. Iftar Target & Current
  iftarTarget: z.number().int().nonnegative().optional(),
  iftarCurrent: z.number().int().nonnegative().optional(),

  // 4. Itikaf Target & Current
  itikafTarget: z.number().int().nonnegative().optional(),
  itikafCurrent: z.number().int().nonnegative().optional(),
});

// DTOs
export type CreateRamadanConfigDto = z.infer<typeof createRamadanConfigSchema>;
export type UpdateRamadanConfigDto = z.infer<typeof updateRamadanConfigSchema>;
export type UpdateRamadanScheduleDto = z.infer<typeof updateRamadanScheduleSchema>;
