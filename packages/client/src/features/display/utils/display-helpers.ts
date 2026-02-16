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