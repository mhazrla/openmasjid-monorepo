import { db } from '../../db';
import { dailyPrayerTimes } from '../../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { InsertDailyPrayerTime } from './prayer-time.interface';

export class PrayerTimeRepository 
{
  async getByDate(dateStr: string) 
  {
    const result = await db.select()
      .from(dailyPrayerTimes)
      .where(eq(dailyPrayerTimes.date, dateStr))
      .limit(1);

    return result[0] || null;
  }

  async getByMonth(yearMonth: string) 
  {
    const start = `${yearMonth}-01`;
    const end = `${yearMonth}-31`; 

    return db.select()
      .from(dailyPrayerTimes)
      .where(and(gte(dailyPrayerTimes.date, start), lte(dailyPrayerTimes.date, end)));
  }

  async upsertMany(data: InsertDailyPrayerTime[]) 
  {
    if (data.length === 0) return [];
    
    return db.insert(dailyPrayerTimes)
      .values(data)
      .onConflictDoUpdate({
        target: dailyPrayerTimes.date,
        set: 
        {
          imsak: sql.raw('excluded.imsak'),
          subuh: sql.raw('excluded.subuh'),
          terbit: sql.raw('excluded.terbit'),
          dzuhur: sql.raw('excluded.dzuhur'),
          ashar: sql.raw('excluded.ashar'),
          maghrib: sql.raw('excluded.maghrib'),
          isya: sql.raw('excluded.isya'),
          updatedAt: new Date()
        }
      })
      .returning();
  }
}
