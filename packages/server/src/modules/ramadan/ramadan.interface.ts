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

  // 2. Iftar Snack (Takjil)
  iftarSnackSource: z.string().optional().nullable(),
  iftarSnackQty: z.number().int().optional(),
  iftarSnackStatus: z.enum(['open', 'close']).optional(),

  // 3. Iftar Meal & Lecture (Makan Berat & Kajian)
  iftarSpeakerId: z.number().int().optional().nullable(),
  iftarKajianTitle: z.string().optional().nullable(),
  iftarMealQty: z.number().int().optional(),
  iftarMealStatus: z.enum(['open', 'close']).optional(),

  // 4. Mineral Water
  waterTarawihQty: z.number().int().optional(),
  waterIftarQty: z.number().int().optional(),
  waterItikafQty: z.number().int().optional(),
  waterStatus: z.enum(['open', 'close']).optional(),

  // 5. Itikaf & Suhoor
  itikafQty: z.number().int().optional(),
  itikafStatus: z.enum(['open', 'close']).optional(),

  // 6. Charity (Santunan)
  charityQty: z.number().int().optional(),
  charityStatus: z.enum(['open', 'close']).optional(),
});

// DTOs
export type CreateRamadanConfigDto = z.infer<typeof createRamadanConfigSchema>;
export type UpdateRamadanConfigDto = z.infer<typeof updateRamadanConfigSchema>;
export type UpdateRamadanScheduleDto = z.infer<typeof updateRamadanScheduleSchema>;
