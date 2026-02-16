import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { mosqueProfile } from '../../db/schema';
import { z } from 'zod';

// Entity Types
export type MosqueProfile = InferSelectModel<typeof mosqueProfile>;
export type InsertMosqueProfile = InferInsertModel<typeof mosqueProfile>;

// Zod Schemas
export const updateMosqueProfileSchema = z.object(
{
  name: z.string().min(3, 'Mosque name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  logoUrl: z.string().optional(),
  qrisUrl: z.string().optional(),
  letterheadConfig: z.object({
    headerText: z.string(),
    logoPosition: z.enum(['left', 'center', 'right']),
    font: z.string(),
  }).optional().nullable(),
});

// DTOs
export type UpdateMosqueProfileDto = z.infer<typeof updateMosqueProfileSchema>;
