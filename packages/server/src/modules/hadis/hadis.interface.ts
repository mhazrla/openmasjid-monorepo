
import { z } from 'zod';
import { InferSelectModel } from 'drizzle-orm';
import { hadisEnc } from '../../db/schema';

export type Hadis = InferSelectModel<typeof hadisEnc>;

export const getHadisDisplaySchema = z.object({});

export type GetHadisDisplayDto = z.infer<typeof getHadisDisplaySchema>;
