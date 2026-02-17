import { migrate } from 'drizzle-orm/sqlite-proxy/migrator';
import { db } from './index';

const runMigrate = async () => {
  console.log('⏳ Migrating database...');

  try {
    await migrate(db, async (queries) => {
      for (const query of queries) {
        await db.run(query as any);
      }
    }, { migrationsFolder: 'drizzle' });
    console.log('✅ Migrasi SUCCESS! Database sqlite.db is ready to use.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migrasi FAILED:', error);
    process.exit(1);
  }
};

runMigrate();