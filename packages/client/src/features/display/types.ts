export interface RamadanScheduleUI 
{
  id: number;
  ramadanDay: number;
  date: string;
  iftarSnackStatus: 'open' | 'close';
  iftarSnackQty: number;
  iftarMealStatus: 'open' | 'close';
  iftarMealQty: number;
  itikafStatus: 'open' | 'close';
  itikafQty: number;
  charityStatus: 'open' | 'close';
  charityQty: number;
  waterTarawihQty: number;
  waterIftarQty: number;
  waterItikafQty: number;
  tarawihImam?: { name: string } | null;
  iftarSpeaker?: { name: string } | null;
  description?: string | null;
}

export interface PosterData 
{
  id: number;
  title: string;
  imageUrl: string;
}

export interface HaditsData 
{
  id: number;
  text: string;
  source: string;
  arabic?: string;
}

export interface RamadanTableWidgetProps 
{
  schedules: RamadanScheduleUI[];
}

export interface TarawihWidgetProps 
{
  data: 
  {
    ramadanDay: number;
    tarawihImam?: { name: string } | null;
    imam?: { name: string } | null;
    description?: string | null;
  };
  hijriYear?: number;
  title?: string;
}

export interface PosterWidgetProps 
{
  data: PosterData;
}

export interface HaditsWidgetProps 
{
  data: HaditsData;
}

export type SlideContent =
  | { type: 'lelang_table'; data: RamadanScheduleUI[] }
  | { type: 'tarawih_today'; data: RamadanScheduleUI }
  | { type: 'kajian_today'; data: RamadanScheduleUI }
  | { type: 'poster'; data: PosterData }
  | { type: 'hadits'; data: HaditsData };

export type SlideType = SlideContent['type'];

export type DisplayMode = 'normal' | 'pre_adzan' | 'adzan' | 'iqomah';

export interface PrayerCountdownWidgetProps 
{
  targetTime: Date;
  prayerName: string;
  mode: 'pre_adzan' | 'iqomah';
  beepReminderDuration: number;
  enableBeep: boolean;
}

export interface PrayerState 
{
    mode: DisplayMode;
    targetTime: Date | null;
    prayerName: string;
}