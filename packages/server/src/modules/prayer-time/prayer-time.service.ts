import { PrayerTimeRepository } from './prayer-time.repository';
import { MyQuranResponse, ParsedPrayerSchedule } from './prayer-time.interface';
import { config } from '../../config';
import { DisplayConfigRepository } from '../display-config/display-config.repository';

export class PrayerTimeService 
{
  constructor(
    private repository: PrayerTimeRepository,
    private configRepository: DisplayConfigRepository
  ) {}

  async getTimesForDate(dateStr: string) 
  {
    const cached = await this.repository.getByDate(dateStr);
    if (cached) return cached;

    const settings = await this.configRepository.getOrInit();
    const activeCityId = settings.cityId;

    const [year, month] = dateStr.split('-');
    await this.syncFromExternalApi(activeCityId, year, month);

    return this.repository.getByDate(dateStr);
  }

  async syncFromExternalApi(cityId: string, year: string, month: string) 
  {
    const url = `${config.MYQURAN_API_URL}/sholat/jadwal/${cityId}/${year}-${month}`;

    try 
    {
      const response = await fetch(url);
      const json = await response.json() as MyQuranResponse;

      if (!json.status || !json.data?.jadwal) 
      {
        throw new Error('Invalid response from MyQuran API');
      }

      const schedules = Object.entries(json.data.jadwal).map(([dateKey, times]) => {
        if (!dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) return null;

        return {
          date: dateKey,
          imsak: times.imsak,
          subuh: times.subuh,
          terbit: times.terbit,
          dzuhur: times.dzuhur,
          ashar: times.ashar,
          maghrib: times.maghrib,
          isya: times.isya
        } as ParsedPrayerSchedule;
      }).filter((item): item is ParsedPrayerSchedule => item !== null);

      if (schedules.length > 0) 
      {
        await this.repository.upsertMany(schedules);
      }
      
      return schedules;
    } 
    catch (error) 
    {
      console.error('Failed to sync prayer times:', error);
      throw error;
    }
  }
}
