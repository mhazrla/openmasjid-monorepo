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

  async getConfig() 
  {
    return this.repository.getOrInit();
  }

  async updateConfig(data: UpdateDisplayConfigDto) 
  {
    const currentConfig = await this.repository.getOrInit();
    const isCityChanged = data.cityId && data.cityId !== currentConfig.cityId;

    if (isCityChanged) 
    {
      // Atomic Transaction (Wipe + Update)
      db.transaction(() => 
      {
        db.delete(dailyPrayerTimes).run();
        db.update(displayConfig)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(displayConfig.id, 1))
          .run();
      });

      await this.triggerAutoSync(data.cityId!); // Fire and forget or await? User said "SETELAH transaction sukses".

      return this.repository.getOrInit();
    }
    else 
    {
      return this.repository.update(data);
    }
  }

  private async triggerAutoSync(cityId: string) 
  {
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString();

    try 
    {
      await this.prayerTimeService.syncFromExternalApi(cityId, currentYear, currentMonth);
    } 
    catch (error) 
    {
      console.warn('Auto re-sync failed after config update.', error);
    }
  }
}
