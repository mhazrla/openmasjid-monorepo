import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Removed 'dotenv/config' to allow parent script to control env

export async function fresh(
    databaseUrl: string = process.env.DATABASE_URL!
) 
{
  // Test: Memory DB is always fresh
  if (process.env.NODE_ENV === 'test') {
      console.log('✨ [Test] Memory database is always fresh.');
      return;
  }

  // Development: Delete local data
  if (process.env.NODE_ENV === 'development' && !databaseUrl) {
     const dbPath = path.resolve(process.cwd(), '.pgdata');
     console.log(`🗑️  [PGLite] Removing database directory: ${dbPath}`);
     
     if (fs.existsSync(dbPath)) {
         try {
             fs.rmSync(dbPath, { recursive: true, force: true });
             console.log('✅ PGLite database reset.');
         } catch (e) {
             console.error('❌ Failed to remove .pgdata. Ensure no other process is using it.', e);
             process.exit(1);
         }
     } else {
         console.log('✨ .pgdata does not exist, nothing to clean.');
     }
     return;
  }

  // Postgres Logic
  if (!databaseUrl) 
  {
    throw new Error('DATABASE_URL is not set for production/refresh');
  }

  console.log('🗑️  Dropping all tables (Resetting database)...');

  const sql = postgres(databaseUrl, { max: 1 });

  try 
  {
    await sql.unsafe('DROP SCHEMA public CASCADE;');
    await sql.unsafe('CREATE SCHEMA public;');
    await sql.unsafe('GRANT ALL ON SCHEMA public TO public;');
    await sql.unsafe('COMMENT ON SCHEMA public IS \'standard public schema\';');

    console.log('✅ Database fresh as a daisy!');
  } 
  catch (error) 
  {
    console.error('❌ Failed to reset database:', error);
    process.exit(1);
  } 
  finally 
    {
    await sql.end();
  }
}

if (require.main === module) {
  fresh();
}
