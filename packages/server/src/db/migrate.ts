import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index';

const runMigrate = async () => {
  console.log('⏳ Migrating database...');

  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('✅ Migrasi SUCCESS! Database is ready to use.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migrasi FAILED:', error);
    process.exit(1);
  }
};

runMigrate();