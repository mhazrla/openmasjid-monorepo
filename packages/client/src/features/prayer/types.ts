export interface PrayerTime 
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

export interface SyncPrayerRequest 
{
    cityId: string;
    year: number;
    month: number;
}
