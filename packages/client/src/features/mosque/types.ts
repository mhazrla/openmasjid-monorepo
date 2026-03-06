import { z } from 'zod';
import { updateMosqueProfileSchema } from './schema';

export interface MosqueProfile 
{
    id: number;
    name: string;
    address: string;
    bankName?: string | null;
    bankAccountName?: string | null;
    bankAccountNumber?: string | null;
    logoUrl?: string | null;
    qrisUrl?: string | null;
    letterheadConfig?: 
    {
        headerText: string;
        logoPosition: 'left' | 'center' | 'right';
        font: string;
    } | null;
    createdAt?: string;
    updatedAt?: string;
}

export type UpdateMosqueProfileDto = z.infer<typeof updateMosqueProfileSchema>;