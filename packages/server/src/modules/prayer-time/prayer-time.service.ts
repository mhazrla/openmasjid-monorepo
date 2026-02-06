import { PrayerTimeRepository } from './prayer-time.repository';
import { MyQuranResponse, ParsedPrayerSchedule } from './prayer-time.interface';
import { config } from '../../config';
import { DisplayConfigRepository } from '../display-config/display-config.repository';
import { DisplayConfig } from '../display-config/display-config.interface';
import { addMinutes, parse, format } from 'date-fns';

export class PrayerTimeService 
{
  constructor(
    private repository: PrayerTimeRepository,
    private configRepository: DisplayConfigRepository
  ) {}

  async getTimesForDate(dateStr: string) 
  {
    const settings = await this.configRepository.getOrInit();
    let schedule  = await this.repository.getByDate(dateStr);

    if (!schedule) 
    {
       const activeCityId = settings.cityId;
       const [year, month] = dateStr.split('-');
       await this.syncFromExternalApi(activeCityId, year, month);
       
       schedule = await this.repository.getByDate(dateStr);
    }

    if (schedule) 
    {
       return this.applyTimeCorrections(schedule, settings);
    }

    return undefined;
  }

  private applyTimeCorrections(schedule: ParsedPrayerSchedule, config: DisplayConfig): ParsedPrayerSchedule 
  {
    const adjusted  = { ...schedule };
    const dateRef   = parse(schedule.date, 'yyyy-MM-dd', new Date()); 

    const adjustments: Partial<Record<keyof ParsedPrayerSchedule, number>> = {
      subuh: config.adjSubuh,
      dzuhur: config.adjDzuhur,
      ashar: config.adjAshar,
      maghrib: config.adjMaghrib,
      isya: config.adjIsya,
      terbit: config.adjTerbit,
      dhuha: config.adjDhuha,
    };

    (Object.keys(adjustments) as Array<keyof typeof adjustments>).forEach((key) => 
    {
      const rawTime = schedule[key];
      const adjMinutes = adjustments[key] ?? 0;

      if (rawTime && adjMinutes !== 0) 
      {
        try 
        {
           const parsedDate = parse(rawTime, 'HH:mm', dateRef);
           const newDate    = addMinutes(parsedDate, adjMinutes);
           adjusted[key]    = format(newDate, 'HH:mm');
        } 
        catch (e) 
        {
           console.error(`[PrayerTime] Failed to adjust ${key}: ${rawTime}`, e);
        }
      }
    });

    return adjusted;
  }

  async syncFromExternalApi(cityId: string, year: string, month: string) 
  {
    const formattedMonth  = month.toString().padStart(2, '0');
    const formattedYear   = year.toString();
    const url             = `${config.MYQURAN_API_URL}/sholat/jadwal/${cityId}/${formattedYear}-${formattedMonth}`;

    console.log(`[PrayerTime] Syncing from: ${url}`);

    try 
    {
      const response = await fetch(url);
      const json = await response.json() as MyQuranResponse;

      if (!json.status || !json.data?.jadwal) 
      {
        console.error('[PrayerTime] Invalid API Response:', JSON.stringify(json));
        throw new Error('Invalid response from MyQuran API');
      }

      const jadwalMap = json.data.jadwal;

      const schedules = Object.entries(jadwalMap).map(([dateKey, times]: [string, any]) => 
      {
        if (!dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) return null;

        return {
          date: dateKey,
          imsak: times.imsak,
          subuh: times.subuh,
          terbit: times.terbit,
          dhuha: times.dhuha,
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
