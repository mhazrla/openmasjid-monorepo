import sqlite3 from 'sqlite3';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

import path from 'path';

// Resolve database path relative to this file (src/db/index.ts)
// Production: dist/db/index.js -> ../../sqlite.db
// Development: src/db/index.ts -> ../../sqlite.db
const dbPath = path.resolve(__dirname, '../../sqlite.db');

const client = new sqlite3.Database(dbPath);

export const db = drizzle(
    async (sql, params, method) => 
    {
        try 
        {
            if (method === 'run') 
            {
                return new Promise((resolve, reject) => 
                {
                    client.run(sql, params, function (this: any, err: any) 
                    {
                        if (err) 
                        {
                            console.error('SQLite Error (run):', err);
                            reject(err);
                        } 
                        else 
                        {
                            resolve({
                                rows: [],
                                lastInsertRowid: this.lastID,
                                changes: this.changes,
                            } as any);
                        }
                    });
                });
            }

            const rows: any = await new Promise((resolve, reject) => 
            {
                client.all(sql, params, (err: any, rows: any) => 
                {
                    if (err) 
                    {
                        console.error('SQLite Error:', err);
                        reject(err);
                    } 
                    else 
                    {
                        resolve(rows);
                    }
                });
            });

            const valueRows = rows.map((row: any) => Object.values(row));

            if (method === 'get') 
            {
                return { rows: valueRows[0] };
            }

            return { rows: valueRows };
        } 
        catch (e: any) 
        {
            console.error('Error from sqlite proxy server: ', e);
            return { rows: [] };
        }
    },
  { schema }
);
