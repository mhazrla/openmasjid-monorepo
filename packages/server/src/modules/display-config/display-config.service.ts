import { DisplayConfigRepository } from './display-config.repository';
import { UpdateDisplayConfigDto } from './display-config.interface';
import { PrayerTimeService } from '../prayer-time/prayer-time.service';
import { db } from '../../db';
import { dailyPrayerTimes, displayConfig } from '../../db/schema';
import { eq } from 'drizzle-orm';
import axios from 'axios';
import { format } from 'date-fns';

export class DisplayConfigService 
{
  constructor(
    private repository: DisplayConfigRepository,
    private prayerTimeService: PrayerTimeService
  ) {}

  async get() 
  {
    const config = await this.repository.getOrInit();
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    if (config.cachedHijriDateAt !== todayStr) 
    {
      try 
      {
        const response = await axios.get(`${process.env.MYQURAN_API_URL}/cal/today?adj=${config.hijriAdj || 0}&tz=Asia%2FJakarta`);
        if (response.data?.status && response.data?.data?.hijr) 
        {
          const hijri = response.data.data.hijr;
          const cachedHijriDate = `${hijri.day} ${hijri.monthName} ${hijri.year} H`;
          
          await db.update(displayConfig)
            .set({ cachedHijriDate, cachedHijriDateAt: todayStr })
            .where(eq(displayConfig.id, 1));
            
          return { ...config, cachedHijriDate, cachedHijriDateAt: todayStr };
        }
      } 
      catch (err) 
      {
        console.error('Failed to fetch Hijri date from MyQuran API', err);
      }
    }

    return config;
  }

  async update(data: UpdateDisplayConfigDto) 
  {
    const currentConfig = await this.repository.getOrInit();
    const isCityChanged = data.cityId && data.cityId !== currentConfig.cityId;
    const isHijriAdjChanged = typeof data.hijriAdj === 'number' && data.hijriAdj !== currentConfig.hijriAdj;

    let updatePayload: any = { ...data };

    if (isHijriAdjChanged) 
    {
       updatePayload.cachedHijriDate = null;
       updatePayload.cachedHijriDateAt = null;
    }

    if (isCityChanged) 
    {
      await db.transaction(async (tx: any) => 
      {
        await tx.delete(dailyPrayerTimes);
        await tx.update(displayConfig)
          .set({ ...updatePayload, updatedAt: new Date() })
          .where(eq(displayConfig.id, 1));
      });

      await this.triggerAutoSync(data.cityId!);

      return this.get(); // Re-fetch to populate Hijri cache if needed
    }
    else 
    {
       await this.repository.update(updatePayload);
       return this.get(); // Re-fetch to populate Hijri cache if needed
    }
  }

  private async triggerAutoSync(cityId: string) 
  {
    try 
    {
      await this.prayerTimeService.syncYearlyFromExternalApi(cityId);
    } 
    catch (error) 
    {
      console.warn('Auto re-sync failed after config update.', error);
    }
  }
}
