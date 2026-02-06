import { db } from '../../db';
import { displayConfig } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { UpdateDisplayConfigDto } from './display-config.interface';
import { config } from '../../config';

export class DisplayConfigRepository 
{
  async getOrInit() 
  {
    const result = await db.select().from(displayConfig).where(eq(displayConfig.id, 1)).limit(1);

    if (result.length > 0) 
    {
      return result[0];
    }

    const defaultCityId = config.DEFAULT_CITY_ID as string;

    const defaults = await db.insert(displayConfig).values({
      id: 1,
      cityId: defaultCityId,
      runningText: 'Luruskan dan rapatkan shaf...',
      preAdzanDuration: 2,
      adzanDuration: 4,
      iqomahDelaySubuh: 15,
      iqomahDelayDzuhur: 10,
      iqomahDelayAshar: 10,
      iqomahDelayMaghrib: 10,
      iqomahDelayIsya: 10,
      enableBeep: true
    }).returning();
    
    return defaults[0];
  }

  async update(data: UpdateDisplayConfigDto) 
  {
    await this.getOrInit();

    const result = await db.update(displayConfig)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(displayConfig.id, 1))
      .returning();
      
    return result[0];
  }
}
