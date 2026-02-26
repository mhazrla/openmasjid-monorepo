import type { PrayerTime } from '../../prayer/types';

export const DUMMY_HADITS = [
    { id: 1, source: "HR. Muslim", arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", text: "Barangsiapa menempuh jalan menuntut ilmu, Allah mudahkan jalan ke Surga." }
];

// --- LOGIC HELPERS ---
const timeToMinutes = (time: string): number => 
{
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

export const getEffectiveDate = (now: Date, maghribTime?: string): Date => 
{
    if (!maghribTime) return now;

    const [hours, minutes] = maghribTime.split(':').map(Number);
    const maghribDate = new Date(now);
    maghribDate.setHours(hours, minutes, 0, 0);

    if (now >= maghribDate) 
    {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return tomorrow;
    }

    return now;
};

export const getShalatDuration = (prayerName: string, config: any): number => 
{
    const name = prayerName.toLowerCase();
    switch(name) 
    {
        case 'subuh': return Number(config.shalatDurationSubuh) || 10;
        case 'dzuhur': return Number(config.shalatDurationDzuhur) || 10;
        case 'ashar': return Number(config.shalatDurationAshar) || 10;
        case 'maghrib': return Number(config.shalatDurationMaghrib) || 10;
        case 'isya': return Number(config.shalatDurationIsya) || 10;
        default: return 10;
    }
};

export const getNextPrayer = (prayerTimes: PrayerTime | null | undefined, currentTime: Date): string => 
{
    if (!prayerTimes) return '';

    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const schedule = [
        { key: 'Subuh', time: prayerTimes.subuh },
        { key: 'Terbit', time: prayerTimes.terbit },
        { key: 'Dzuhur', time: prayerTimes.dzuhur },
        { key: 'Ashar', time: prayerTimes.ashar },
        { key: 'Maghrib', time: prayerTimes.maghrib },
        { key: 'Isya', time: prayerTimes.isya },
    ];

    for (const s of schedule) 
    {
        if (timeToMinutes(s.time) >= currentMinutes) return s.key;
    }
    
    return 'Subuh';
};