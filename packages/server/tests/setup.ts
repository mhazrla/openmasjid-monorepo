import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

import { runPGLiteMigrations } from '../src/db/migrate-pglite';

// Load test environment
dotenv.config({ path: path.join(process.cwd(), '.env.test') });

let app: FastifyInstance;

beforeAll(async () => {
  // Sync database schema to test database using PGLite migrator
  await runPGLiteMigrations();

  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

export { app };
