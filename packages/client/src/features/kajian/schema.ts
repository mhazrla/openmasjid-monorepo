import { z } from 'zod';

const baseKajianSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  speakerId: z.preprocess(
    (val) => val ? Number(val) : val, 
    z.number({ message: "Speaker is required" }).int().positive()
  ),
  type: z.enum(['kajian_rutin', 'kajian_tematik', 'tabligh_akbar']).default('kajian_tematik'),
  status: z.union([z.boolean(), z.enum(['true', 'false'])]).optional().default(true),
  date: z.string().optional().nullable(),
  dayOfWeek: z.preprocess(
    (val) => val ? String(val) : null,
    z.string().optional().nullable()
  ),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)").optional().nullable(),
  timeMode: z.enum(['manual', 'bada_sholat']).default('manual'),
  badaSholat: z.enum(['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']).optional().nullable(),
  poster: z.any().optional(),
});

export const createKajianSchema = baseKajianSchema.superRefine((data, ctx) => 
{
  if (data.type === 'kajian_rutin') 
  {
    if (!data.dayOfWeek) 
    {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dayOfWeek'],
        message: "Day is required for recurring events",
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

  if (data.timeMode === 'bada_sholat') 
  {
    if (!data.badaSholat) 
    {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['badaSholat'],
        message: "Prayer selection is required",
      });
    }
  } 
  else if (data.type === 'kajian_rutin' && !data.time) 
  {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['time'],
      message: "Time is required",
    });
  }
});
