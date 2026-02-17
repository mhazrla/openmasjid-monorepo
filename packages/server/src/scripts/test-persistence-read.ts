
import { db } from '../db';
import { mosqueProfile } from '../db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('Reading mosque name...');
    const result = await db.select().from(mosqueProfile).where(eq(mosqueProfile.id, 1));
    const name = result[0]?.name;
    console.log('Mosque Name:', name);
    
    if (name === 'Persistence Test') {
        console.log('✅ Persistence verified!');
    } else {
        console.error('❌ Persistence failed. Expected "Persistence Test", got:', name);
        process.exit(1);
    }
}

main().catch(console.error).finally(() => process.exit());
