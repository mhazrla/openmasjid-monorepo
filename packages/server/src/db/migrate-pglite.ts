import { migrate } from 'drizzle-orm/pglite/migrator';
import { db } from './index';
import path from 'path';

export async function runPGLiteMigrations() 
{
  console.log('⏳ Running PGLite migrations...');
  try 
  {
    await migrate(db, {
      migrationsFolder: path.resolve(__dirname, '../../drizzle'),
    });
    console.log('✅ PGLite migrations completed.');
  } 
  catch (error) 
  {
    console.error('❌ PGLite migration failed:', error);
    throw error;
  }
}

// If run directly
if (require.main === module) 
{
  runPGLiteMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
