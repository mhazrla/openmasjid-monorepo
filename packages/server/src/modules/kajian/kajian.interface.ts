import { z } from 'zod';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { kajianEvents } from '../../db/schema';

// --- 1. Entity Types (Drizzle) ---
export type KajianEvent = InferSelectModel<typeof kajianEvents>;
export type InsertKajianEvent = InferInsertModel<typeof kajianEvents>;

// --- 2. Constants for File Validation ---
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// --- 3. Zod Schemas ---
export const createKajianSchema = z.object({
  title: z.string().min(3, "At least 3 characters"),
  speakerId: z.preprocess(
    (val) => Number(val), 
    z.number({ required_error: "Speaker is required" }).int().positive()
  ),
  date: z.coerce.date(),
  type: z.enum(['subuh', 'tematik', 'tabligh_akbar']).default('tematik'),
  posterUrl: z.string().optional().nullable(),
});

export const updateKajianSchema = createKajianSchema.partial();

export const getKajianQuerySchema = z.object({
  type: z.enum(['subuh', 'tematik', 'tabligh_akbar']).optional(),
  upcoming: z.enum(['true', 'false']).optional(),
});

export const fileValidationSchema = z.object({
  mimetype: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp"] as [string, ...string[]]),
});

// --- 4. DTO Types (Inferred) ---
export type CreateKajianDto = z.infer<typeof createKajianSchema>;
export type UpdateKajianDto = z.infer<typeof updateKajianSchema>;