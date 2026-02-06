import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  MYQURAN_API_URL: z.string().url().default('https://api.myquran.com/v3'),
  DEFAULT_CITY_ID: z.string().default(process.env.DEFAULT_CITY_ID as string),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) 
{
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;
