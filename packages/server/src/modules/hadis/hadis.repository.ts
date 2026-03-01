
import { db } from '../../db';
import { hadisEnc } from '../../db/schema';
import { count, sql, and, gte, lte } from 'drizzle-orm';

export class HadisRepository 
{
    private safeFilter = and(
        gte(sql<number>`LENGTH(${hadisEnc.teksIndo})`, 50),
        lte(sql<number>`LENGTH(${hadisEnc.teksIndo})`, 200)
    );

    async countAll(): Promise<number> 
    {
        const result = await db.select({ count: count() }).from(hadisEnc);
        return result[0].count;
    }

    async getByOffset(offset: number) 
    {
        const result = await db.select().from(hadisEnc).limit(1).offset(offset);
        return result[0] || null;
    }
    
    async getRandom() 
    {
        const result = await db.select().from(hadisEnc).orderBy(sql`RANDOM()`).limit(1);
        return result[0] || null;
    }

    async getSafeDisplayHadith(): Promise<typeof hadisEnc.$inferSelect | null>
    {
        const countResult = await db.select({ count: count() })
            .from(hadisEnc)
            .where(this.safeFilter);
        
        const totalEligible = countResult[0].count;

        if (totalEligible === 0) return null;

        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDate();
        
        const hourlyIndex = currentHour + (currentDay * 24);
        const offset = hourlyIndex % totalEligible;

        const result = await db.select()
            .from(hadisEnc)
            .where(this.safeFilter)
            .limit(1)
            .offset(offset);

        return result[0] || null;
    }
}
