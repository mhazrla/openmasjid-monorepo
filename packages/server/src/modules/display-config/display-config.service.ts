import { DisplayConfigRepository } from './display-config.repository';
import { UpdateDisplayConfigDto } from './display-config.interface';
import { PrayerTimeService } from '../prayer-time/prayer-time.service';
import { db } from '../../db';
import { dailyPrayerTimes, displayConfig } from '../../db/schema';
import { eq } from 'drizzle-orm';

export class DisplayConfigService 
{
  constructor(
    private repository: DisplayConfigRepository,
    private prayerTimeService: PrayerTimeService
  ) {}

  async get() 
  {
    return this.repository.getOrInit();
  }

  async update(data: UpdateDisplayConfigDto) 
  {
    const currentConfig = await this.repository.getOrInit();
    const isCityChanged = data.cityId && data.cityId !== currentConfig.cityId;

    if (isCityChanged) 
    {
      await db.transaction(async (tx: any) => 
      {
        await tx.delete(dailyPrayerTimes);
        await tx.update(displayConfig)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(displayConfig.id, 1));
      });

      await this.triggerAutoSync(data.cityId!);

      return this.repository.getOrInit();
    }
    else 
    {
      return this.repository.update(data);
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
