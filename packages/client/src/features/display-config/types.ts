import { z } from 'zod';

export const displayConfigSchema = z.object({
  id: z.number(),
  cityId: z.string(),
  runningText: z.string().optional().nullable(),
  
  // Timings
  preAdzanDuration: z.number().default(2),
  adzanDuration: z.number().default(4),
  iqomahDelaySubuh: z.number().default(10),
  iqomahDelayDzuhur: z.number().default(10),
  iqomahDelayAshar: z.number().default(10),
  iqomahDelayMaghrib: z.number().default(10),
  iqomahDelayIsya: z.number().default(10),
  shalatDurationSubuh: z.number().default(10),
  shalatDurationDzuhur: z.number().default(10),
  shalatDurationAshar: z.number().default(10),
  shalatDurationMaghrib: z.number().default(10),
  shalatDurationIsya: z.number().default(10),

  // Mode Toggles
  enablePreAdzan: z.boolean().default(true),
  enableAdzan: z.boolean().default(true),
  enableIqomah: z.boolean().default(true),
  enableShalat: z.boolean().default(true),
  
  // Time Adjustments
  adjSubuh: z.number().default(0),
  adjDzuhur: z.number().default(0),
  adjAshar: z.number().default(0),
  adjMaghrib: z.number().default(0),
  adjIsya: z.number().default(0),
  adjTerbit: z.number().default(0),
  adjDhuha: z.number().default(0),
  hijriAdj: z.number().default(0),

  // Audio
  enableBeep: z.boolean().default(true),
  beepReminderDuration: z.number().default(30),

  // Cached data
  cachedHijriDate: z.string().optional(),
  cachedHijriDateAt: z.string().optional(), 
});

export type DisplayConfig = z.infer<typeof displayConfigSchema>;

// Update DTO
export const updateDisplayConfigSchema = displayConfigSchema.partial().omit({ id: true });
export type UpdateDisplayConfigDto = z.infer<typeof updateDisplayConfigSchema>;
