import { FastifyInstance } from 'fastify';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import * as schema from '../src/db/schema';

import { getTableConfig } from 'drizzle-orm/pg-core';

/**
 * Get an authentication token for testing.
 */
export async function getAuthToken(app: FastifyInstance) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'admin',
      password: 'testpassword', // Match the password used in tests
    },
  });

  const data = response.json();
  if (!data.success) {
    throw new Error(`Failed to get auth token: ${JSON.stringify(data)}`);
  }
  return data.data.token;
}

/**
 * Truncate all tables in the test database.
 */
export async function truncateAllTables() {
  const tableNames = Object.values(schema)
    .map((entity) => {
      try {
        return getTableConfig(entity as any).name;
      } catch {
        return null;
      }
    })
    .filter((name): name is string => name !== null);

  // Filter unique names in case of duplicate exports
  const uniqueTables = [...new Set(tableNames)];

  for (const table of uniqueTables) {
    try {
      await db.execute(sql.raw(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`));
    } catch (err) {
      // Skip if not a table or other error
    }
  }
}

/**
 * Create a dummy file for upload testing.
 */
export function createDummyFile(filename: string = 'test.jpg') {
  return {
    filename,
    contentType: 'image/jpeg',
    content: Buffer.from('fake-image-binary-content'),
  };
}
