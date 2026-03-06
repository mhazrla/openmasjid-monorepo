import { z } from 'zod';

export const updateMosqueProfileSchema = z.object({
  name: z.string().min(3, 'Mosque name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  bankName: z.string().min(3, 'Bank name must be at least 3 characters').optional().or(z.literal('')),
  bankAccountName: z.string().min(3, 'Bank account name must be at least 3 characters').optional().or(z.literal('')),
  bankAccountNumber: z.string().min(3, 'Bank account number must be at least 3 characters').optional().or(z.literal('')),
  logoUrl: z.string().optional().nullable(),
  qrisUrl: z.string().optional().nullable(),
  letterheadConfig: z.object({
    headerText: z.string(),
    logoPosition: z.enum(['left', 'center', 'right']),
    font: z.string()
  }).optional().nullable()
});
