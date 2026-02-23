import { z } from 'zod';

export const createTransactionSchema = z.object({
  date: z.coerce.date().max(new Date(), "Date cannot be in the future").transform(d => d.toISOString()),
  type: z.enum(['debit', 'credit']),
  amount: z.number().int("Must be an integer").positive().min(100, "Minimum amount is 100"),
  description: z.string().min(1, "Description is required").max(255, "Description is too long"),
  categoryId: z.number().int().positive(),
  accountId: z.number().int().positive(),
});

export const updateTransactionSchema = createTransactionSchema;

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>;

export const getTransactionsQuerySchema = z.object({
  accountId: z.coerce.number().int().positive().optional(),
  startDate: z.coerce.date().optional().transform(val => val ? val.toISOString() : undefined),
  endDate: z.coerce.date().optional().transform(val => val ? val.toISOString() : undefined),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(100),
}).refine(data => 
{
  if (data.startDate && data.endDate) 
  {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, 
{
  message: "End date cannot be before start date",
  path: ["endDate"]
});

export type GetTransactionsQueryDto = z.infer<typeof getTransactionsQuerySchema>;