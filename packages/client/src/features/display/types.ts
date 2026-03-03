export interface RamadanScheduleUI 
{
  id: number;
  ramadanDay: number;
  date: string;
  iftarTarget?: number;
  iftarCurrent?: number;
  itikafTarget?: number;
  itikafCurrent?: number;
  tarawihImam?: { name: string } | null;
  iftarSpeaker?: { name: string } | null;
  iftarKajianTitle?: string | null;
  description?: string | null;
  badalImam?: string | null;
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
  data: RamadanScheduleUI;
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
  timeMode?: 'manual' | 'bada_sholat';
  badaSholat?: string;
  time?: string;
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

export interface DisplayConfig 
{
  id: number;
  cityId: string;
  runningText?: string | null;
  preAdzanDuration: number;
  adzanDuration: number;
  iqomahDelaySubuh: number;
  iqomahDelayDzuhur: number;
  iqomahDelayAshar: number;
  iqomahDelayMaghrib: number;
  iqomahDelayIsya: number;
  shalatDuration: number;
  enablePreAdzan: boolean;
  enableAdzan: boolean;
  enableIqomah: boolean;
  enableShalat: boolean;
  adjSubuh: number;
  adjTerbit: number;
  adjDhuha: number;
  adjDzuhur: number;
  adjAshar: number;
  adjMaghrib: number;
  adjIsya: number;
  hijriAdj: number;
  cachedHijriDate?: string | null;
  cachedHijriDateAt?: string | null;
  enableBeep: boolean;
  beepReminderDuration: number;
  themeColor?: string | null;
  fontFamily?: string | null;
  baseFontSize?: number;
  clockFontSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinanceSummaryData 
{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    lastUpdated: string | Date | null;
}

export interface FinanceSummaryWidgetProps
{
    data: FinanceSummaryData;
}

export type SlideContent =
  | { type: 'lelang_table'; data: RamadanScheduleUI[] }
  | { type: 'tarawih_today'; data: RamadanScheduleUI }
  | { type: 'kajian_today'; data: RamadanScheduleUI }
  | { type: 'kajian_event'; data: KajianSlideData }
  | { type: 'poster'; data: PosterData }
  | { type: 'hadits'; data: HaditsData }
  | { type: 'bank_info'; data: BankInfoData }
  | { type: 'finance_summary'; data: FinanceSummaryData };