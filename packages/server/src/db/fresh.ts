import postgres from 'postgres';
import 'dotenv/config';

if (!process.env.DATABASE_URL) 
{
  throw new Error('DATABASE_URL is not set');
}

async function main() 
{
  console.log('🗑️  Dropping all tables (Resetting database)...');

  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

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

main();
