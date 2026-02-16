import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

import path from 'path';

// Resolve database path relative to this file (src/db/index.ts)
// Production: dist/db/index.js -> ../../sqlite.db
// Development: src/db/index.ts -> ../../sqlite.db
const dbPath = path.resolve(__dirname, '../../sqlite.db');

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
