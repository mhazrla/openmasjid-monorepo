import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  MYQURAN_API_URL: z.string().url().default('https://api.myquran.com/v3'),
  // Default City ID (e.g. 9766527f2b5d3e95d4a733fcfb77bd7e for Kab. Bekasi)
  DEFAULT_CITY_ID: z.string().default('9766527f2b5d3e95d4a733fcfb77bd7e'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) 
{
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;
