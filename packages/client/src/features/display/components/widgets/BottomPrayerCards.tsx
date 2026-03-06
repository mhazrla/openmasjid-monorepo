import  { memo } from 'react';

export const BottomPrayerCards = memo(({ prayerTimes, currentTimeStr }: { prayerTimes: any, currentTimeStr: string }) => 
{
    if (!prayerTimes) return null;

    const getNextPrayerId = () => 
    {
        const fajr = prayerTimes.fajr || prayerTimes.subuh || prayerTimes.shubuh || '04:00';
        const dhuhr = prayerTimes.dhuhr || prayerTimes.dzuhur || '12:00';
        const asr = prayerTimes.asr || prayerTimes.ashar || '15:00';
        const maghrib = prayerTimes.maghrib || '18:00';
        const isha = prayerTimes.isha || prayerTimes.isya || '19:00';

        if (currentTimeStr >= isha) return 'fajr'; 
        if (currentTimeStr >= maghrib) return 'isha';
        if (currentTimeStr >= asr) return 'maghrib';
        if (currentTimeStr >= dhuhr) return 'asr';
        if (currentTimeStr >= fajr) return 'dhuhr';
        return 'fajr'; 
    };

    const activeId = getNextPrayerId();

    const prayers = [
        { 
            name: 'Shubuh', time: prayerTimes.fajr || prayerTimes.subuh || prayerTimes.shubuh, id: 'fajr',
            colorTheme: { bg: 'from-indigo-950/80 to-slate-900/80', border: 'border-indigo-900/50', text: 'text-indigo-300', label: 'text-indigo-400' }
        },
        { 
            name: 'Dzuhur', time: prayerTimes.dhuhr || prayerTimes.dzuhur, id: 'dhuhr',
            colorTheme: { bg: 'from-sky-950/80 to-slate-900/80', border: 'border-sky-900/50', text: 'text-sky-300', label: 'text-sky-400' }
        },
        { 
            name: 'Ashar', time: prayerTimes.asr || prayerTimes.ashar, id: 'asr',
            colorTheme: { bg: 'from-orange-950/80 to-slate-900/80', border: 'border-orange-900/50', text: 'text-orange-300', label: 'text-orange-400' }
        },
        { 
            name: 'Maghrib', time: prayerTimes.maghrib, id: 'maghrib',
            colorTheme: { bg: 'from-rose-950/80 to-slate-900/80', border: 'border-rose-900/50', text: 'text-rose-300', label: 'text-rose-400' }
        },
        { 
            name: 'Isya', time: prayerTimes.isha || prayerTimes.isya, id: 'isha',
            colorTheme: { bg: 'from-violet-950/80 to-slate-900/80', border: 'border-violet-900/50', text: 'text-violet-300', label: 'text-violet-400' }
        },
    ];

    return (
        <div className="grid grid-cols-5 gap-4 lg:gap-6 w-full pb-6 px-10 relative z-20">
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-primary/20 blur-[60px] pointer-events-none z-0"></div>
            {prayers.map((prayer, index) => 
        {
                const isActive = activeId === prayer.id;

                return (
                    <div key={index} className={`relative flex flex-col items-center justify-center py-5 px-4 rounded-[2.5rem] transition-all duration-500 overflow-hidden ${
                        isActive 
                        ? 'bg-amber-500 scale-[1.05] z-30 shadow-[0_10px_40px_rgba(251,191,36,0.4)]' 
                        : 'bg-white/10 backdrop-blur-[40px] border border-white/20 z-10 shadow-lg'
                    }`}>
                        {!isActive && (
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                        )}
                        {isActive && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent pointer-events-none" />
                            </>
                        )}
                        <h3 className={`text-[2rem] font-black mb-2 uppercase tracking-widest relative z-10 ${isActive ? 'text-slate-900' : prayer.colorTheme.label}`}>
                            {prayer.name}
                        </h3>
                        <p className={`text-[4rem] font-mono font-black leading-none ${isActive ? 'text-slate-900' : prayer.colorTheme.text}`}>
                            {prayer.time}
                        </p>
                    </div>
                );
            })}
        </div>
    );
});
