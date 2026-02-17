
import { db } from '../db';
import { mosqueProfile } from '../db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('Updating mosque name to "Persistence Test"...');
    await db.update(mosqueProfile)
        .set({ name: 'Persistence Test', updatedAt: new Date() })
        .where(eq(mosqueProfile.id, 1));
    console.log('Update complete.');
}

main().catch(console.error).finally(() => process.exit());
