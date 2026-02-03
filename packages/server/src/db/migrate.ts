import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';

const runMigrate = () => {
  console.log('⏳ Migrating database...');

  try 
  {
    migrate(db, { migrationsFolder: 'drizzle' });
    console.log('✅ Migrasi SUCCESS! Database sqlite.db is ready to use.');
  } 
  catch (error) 
  {
    console.error('❌ Migrasi FAILED:', error);
    process.exit(1);
  }
};

runMigrate();