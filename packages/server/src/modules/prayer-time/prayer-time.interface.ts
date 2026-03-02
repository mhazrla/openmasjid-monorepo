import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { dsPrayerTimes } from '../../db/schema';

// Entity Types
export type DailyPrayerTime = InferSelectModel<typeof dsPrayerTimes>;
export type InsertDailyPrayerTime = InferInsertModel<typeof dsPrayerTimes>;

// Type for External API Response (MyQuran)
export interface MyQuranResponse 
{
  status: boolean;
  data: 
  {
    jadwal: Record<string, 
    {
      subuh: string;
      dzuhur: string;
      ashar: string;
      maghrib: string;
      isya: string;
      imsak: string;
      terbit: string;
      date: string;
    }>;
  };
}

// Parsed Schedule Object
export interface ParsedPrayerSchedule 
{
  date: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}
