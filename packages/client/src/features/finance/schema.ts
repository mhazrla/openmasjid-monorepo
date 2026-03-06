import { z } from 'zod';

export const createTransactionSchema = z.object({
  date: z.coerce.date().refine((date) => date <= new Date(), { message: "Date cannot be in the future" }).transform(d => d.toISOString()),
  type: z.enum(['income', 'expense']),
  amount: z.number().int("Amount must be an integer").positive().min(100, "Minimum amount is 100"),
  description: z.string().min(1, "Description is required").max(255, "Description is too long"),
  fundCategory: z.enum(['operasional', 'yatim', 'pembangunan', 'ramadhan']),
  accountId: z.coerce.number().int().positive("Account is required"),
});
