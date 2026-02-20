import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // PGlite is compatible with Postgres dialect
  driver: 'pglite',
  dbCredentials: {
    url: './.pgdata',
  },
  verbose: true,
  strict: true,
});
