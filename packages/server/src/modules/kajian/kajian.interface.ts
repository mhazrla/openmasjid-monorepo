import { z } from 'zod';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { kajianEvents } from '../../db/schema';
import { baseFilterSchema, ModuleFilter } from '../../common/interfaces/filter.interface';

// --- 1. Entity Types ---
export type KajianEvent = InferSelectModel<typeof kajianEvents>;
export type InsertKajianEvent = InferInsertModel<typeof kajianEvents>;

const baseKajianSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  speakerId: z.preprocess(
    (val) => val ? Number(val) : val, 
    z.number({ required_error: "Speaker is required" }).int().positive()
  ),
  type: z.enum(['kajian_rutin', 'kajian_tematik', 'tabligh_akbar']).default('kajian_tematik'),
  posterUrl: z.preprocess(
    (val) => val === 'null' || val === '' ? null : val,
    z.string().optional().nullable()
  ),
  status: z.preprocess(
    (val) => 
    {
        if (typeof val === 'boolean') return val;
        if (val === 'true' || val === 'active') return true;
        if (val === 'false' || val === 'inactive') return false;
        return val;
    },
    z.boolean().optional().default(true)
  ),
  date: z.coerce.date().optional().nullable(),
  dayOfWeek: z.preprocess(
    (val) => val ? Number(val) : null,
    z.number().min(0).max(6).optional().nullable()
  ),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)").optional().nullable(),
});

export const createKajianSchema = baseKajianSchema.superRefine((data, ctx) => 
{
  if (data.type === 'kajian_rutin') 
  {
    if (data.dayOfWeek === undefined || data.dayOfWeek === null) 
    {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dayOfWeek'],
        message: "Day is required for recurring events",
      });
    }
    if (!data.time) 
    {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['time'],
        message: "Time is required for recurring events",
      });
    }
  } 
  else 
  {
    if (!data.date) 
    {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['date'],
        message: "Date is required for thematic events",
      });
    }
  }
});

export const updateKajianSchema = baseKajianSchema.partial();

export const getKajianQuerySchema = baseFilterSchema.extend({
  type: z.enum(['kajian_rutin', 'kajian_tematik', 'tabligh_akbar', 'all']).optional(),
  upcoming: z.enum(['true', 'false']).optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
});

export type KajianFilter = ModuleFilter<{
  type?: string;
  upcoming?: string;
  status?: string;
}>;

export const fileValidationSchema = z.object({
  mimetype: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp"] as [string, ...string[]]),
});

export type CreateKajianDto = z.infer<typeof createKajianSchema>;
export type UpdateKajianDto = z.infer<typeof updateKajianSchema>;