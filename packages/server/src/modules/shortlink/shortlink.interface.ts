import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { shortlinks } from '../../db/schema';
import { z } from 'zod';

// Entity Types
export type Shortlink = InferSelectModel<typeof shortlinks>;
export type InsertShortlink = InferInsertModel<typeof shortlinks>;

// DTOs
export const createShortlinkSchema = z.object({
  originalUrl: z.string().url('Invalid URL format'),
  slug: z.string().regex(/^[a-zA-Z0-9-_]+$/, 'Slug must be alphanumeric (dash/underscore allowed)').optional(),
  description: z.string().optional()
});

export type CreateShortlinkDto = z.infer<typeof createShortlinkSchema>;
