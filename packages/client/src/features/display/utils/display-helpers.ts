import type { PrayerTime } from '../../prayer/types';

// --- DUMMY DATA ---
export const DUMMY_KAJIAN = [
    { id: 1, title: "Kajian Rutin Ahad Subuh", ustadz: "Ust. Dr. Syafiq Riza Basalamah", topic: "Kitab Riyadhus Shalihin", time: "Ba'da Subuh", date: "Ahad, 9 Feb" }
];

export const DUMMY_HADITS = [
    { id: 1, source: "HR. Muslim", arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", text: "Barangsiapa menempuh jalan menuntut ilmu, Allah mudahkan jalan ke Surga." }
];

export const DUMMY_POSTERS = 
[
    {
        id: 1,
        title: "Kajian Akbar",
        imageUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1000&auto=format&fit=crop" 
    },
    {
        id: 2,
        title: "Laporan Keuangan",
        imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1920&auto=format&fit=crop"
    }
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