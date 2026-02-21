import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePGLite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import postgres from 'postgres';
import * as schema from './schema';
import { config } from '../config';

// Debugging Log: Cek apa yang dibaca oleh sistem
console.log('----------------------------------------');
console.log('🔧 DB Init Check:');
console.log(`   NODE_ENV: ${config.NODE_ENV}`);
console.log(`   DATABASE_URL exists?: ${!!config.DATABASE_URL}`);
console.log('----------------------------------------');

export let db: any;

if (config.NODE_ENV === 'production' || config.DATABASE_URL) 
{
  console.log(`🔌 Mode: ${config.NODE_ENV.toUpperCase()} (Connecting to Postgres...)`);
  
  if (!config.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL is missing!');
  }

  // Gunakan postgres-js client
  const client = postgres(config.DATABASE_URL);
  db = drizzlePg(client, { schema });
} 
else 
{
  console.log('📂 Mode: DEV/TEST (Using Local PGLite)');
  
  const dbPath = config.NODE_ENV === 'test' ? 'memory://' : './.pgdata';
  console.log(`   Path: ${dbPath}`);
  
  const client = new PGlite(dbPath);
  db = drizzlePGLite(client, { schema });
}