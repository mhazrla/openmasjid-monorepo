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
    // 1. Check Current Config (Async read is fine outside transaction)
    const currentConfig = await this.repository.getOrInit();

    // 2. Detect Change
    const isCityChanged = data.cityId && data.cityId !== currentConfig.cityId;

    if (isCityChanged) 
    {
      console.log(`[DisplayConfig] Critical: City changed from ${currentConfig.cityId} to ${data.cityId}. Initiating atomic update...`);
      
      // 3. Branch A: Atomic Transaction (Wipe + Update)
      // Drizzle + Better-SQLite3 transaction is synchronous.
      db.transaction(() => {
        // a. Wipe Cache
        console.log('[DisplayConfig] Transaction Step 1: Wiping prayer times cache...');
        db.delete(dailyPrayerTimes).run();

        // b. Update Config (Replicating repository logic for sync execution inside transaction)
        console.log('[DisplayConfig] Transaction Step 2: Updating display configuration...');
        db.update(displayConfig)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(displayConfig.id, 1))
          .run();
      });

      console.log('[DisplayConfig] Atomic transaction committed successfully.');

      // 4. Auto Re-Sync (Safe to run async after transaction)
      console.log('[DisplayConfig] Triggering auto re-sync for new city...');
      await this.triggerAutoSync(data.cityId!); // Fire and forget or await? User said "SETELAH transaction sukses".

      // Return updated config (Fetching again to be sure, or construct it)
      return this.repository.getOrInit();
    }
    else 
    {
      // 5. Branch B: Standard Update
      console.log('[DisplayConfig] Standard update (City unchanged).');
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
      console.log(`[DisplayConfig] Starting background sync for City: ${cityId}, Period: ${currentYear}-${currentMonth}`);
      await this.prayerTimeService.syncFromExternalApi(cityId, currentYear, currentMonth);
      console.log('[DisplayConfig] Auto re-sync completed successfully.');
    } 
    catch (error) 
    {
      // User Requirement: "error-nya tidak membatalkan penyimpanan config (cukup log warning saja)"
      console.warn('[DisplayConfig] Warning: Auto re-sync failed after config update.', error);
    }
  }
}
