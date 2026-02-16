
import { db } from '../db';
import { hadisEnc } from '../db/schema';
import { count } from 'drizzle-orm';

async function verify() {
    const result = await db.select({ count: count() }).from(hadisEnc);
    console.log('Total Hadiths in DB (All Grades):', result[0].count);
    
     // Sample check
    const sample = await db.select().from(hadisEnc).limit(1);
    if (sample.length > 0) {
        console.log('Sample:', sample[0]);
    }
}

verify().catch(console.error);
