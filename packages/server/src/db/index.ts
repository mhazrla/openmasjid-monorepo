import initSqlJs from 'sql.js';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'sqlite.db');

let client: any = null;
let initPromise: Promise<void> | null = null;

const initializeDb = async () => {
    if (client) return;
    
    if (!initPromise) {
        initPromise = (async () => {
            try {
                const SQL = await initSqlJs();
                if (fs.existsSync(dbPath)) {
                    const filebuffer = fs.readFileSync(dbPath);
                    client = new SQL.Database(filebuffer);
                    console.log('✅ Database loaded from file');
                } else {
                    client = new SQL.Database();
                    console.log('✅ New in-memory database created');
                    saveDatabase();
                }
            } catch (err) {
                console.error('Failed to initialize sql.js:', err);
                throw err;
            }
        })();
    }
    await initPromise;
};

const saveDatabase = () => {
    if (!client) return;
    try {
        const data = client.export();
        const buffer = Buffer.from(data);
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dbPath, buffer);
    } catch (err) {
        console.error('Failed to save database:', err);
    }
};

// Ensure database is saved on exit
process.on('exit', () => saveDatabase());
process.on('SIGINT', () => {
    saveDatabase();
    process.exit();
});

export const db = drizzle(
    async (sql, params, method) => {
        await initializeDb();
        
        try {
            const stmt = client.prepare(sql);
            stmt.bind(params);

            if (method === 'run') {
                stmt.run();
                const changes = client.getRowsModified();
                
                // Get last insert ID
                const idRes = client.exec("SELECT last_insert_rowid()");
                const lastInsertRowid = idRes[0]?.values[0]?.[0] || 0;
                
                stmt.free();
                saveDatabase(); // Persist changes
                
                return {
                    rows: [],
                    lastInsertRowid: BigInt(lastInsertRowid), // Drizzle expects bigint or number
                    changes: changes
                };
            }

            const rows: any[] = [];
            while (stmt.step()) {
                rows.push(stmt.get()); // .get() returns array of values
            }
            stmt.free();

            if (method === 'get') {
                return { rows: rows[0] };
            }

            return { rows: rows };

        } catch (e: any) {
            console.error('Error from sql.js proxy:', e);
            throw e;
        }
    },
    { schema }
);
