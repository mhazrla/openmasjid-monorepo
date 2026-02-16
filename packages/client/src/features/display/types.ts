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
  iftarKajianTitle?: string | null;
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
export interface Hadith 
{
  id: number;
  apiId: number;
  teksArab: string | null;
  teksIndo: string | null;
  takhrij: string | null;
  hikmah: string | null;
  grade: string | null;
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

export type SlideType = SlideContent['type'];

export type DisplayMode = 'normal' | 'pre_adzan' | 'adzan' | 'iqomah' | 'shalat';

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

export interface KajianSlideData 
{
  id: number;
  title: string;
  speaker: string;
  type: string;
  dateRaw: string;
  posterUrl?: string;
}

export interface BankInfoData 
{
    bankName?: string;
    bankAccountName?: string;
    accountNumber?: string;
    qrisUrl?: string;
    mosqueName: string;
}

export interface BankInfoWidgetProps 
{
    data: BankInfoData;
}

export type SlideContent =
  | { type: 'lelang_table'; data: RamadanScheduleUI[] }
  | { type: 'tarawih_today'; data: RamadanScheduleUI }
  | { type: 'kajian_today'; data: RamadanScheduleUI }
  | { type: 'kajian_event'; data: KajianSlideData }
  | { type: 'poster'; data: PosterData }
  | { type: 'hadits'; data: HaditsData }
  | { type: 'bank_info'; data: BankInfoData };