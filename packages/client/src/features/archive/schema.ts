import { z } from 'zod';

export const createArchiveAlbumSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  eventDate: z.string().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  isFeatured: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
});
