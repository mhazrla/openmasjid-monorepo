import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { dsMosqueProfile } from '../../db/schema';
import { z } from 'zod';

// Entity Types
export type MosqueProfile = InferSelectModel<typeof dsMosqueProfile>;
export type InsertMosqueProfile = InferInsertModel<typeof dsMosqueProfile>;

// Zod Schemas
export const updateMosqueProfileSchema = z.object(
{
  name: z.string().min(3, 'Mosque name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  bankName: z.string().min(3, 'Bank name must be at least 3 characters').optional(),
  bankAccountName: z.string().min(3, 'Bank account name must be at least 3 characters').optional(),
  bankAccountNumber: z.string().min(3, 'Bank account number must be at least 3 characters').optional(),
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
