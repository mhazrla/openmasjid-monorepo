import { buildApp } from './app';
import { config } from './config';
import { db } from './db';
import { sql } from 'drizzle-orm';

const start = async () => 
{
    try 
    {
        const app = await buildApp();
        
        try 
        {
            await db.execute(sql`SELECT 1`);
            console.log('✅ Database connection successful');
        } 
        catch (dbErr) 
        {
            console.error('❌ Database connection failed:', dbErr);
            process.exit(1);
        }

        await app.listen({ port: config.PORT, host: config.HOST });
        console.log(`🚀 Server running at http://${config.HOST}:${config.PORT}`);
    } 
    catch (err) 
    {
        console.error(err);
        process.exit(1);
    }
};

start();
