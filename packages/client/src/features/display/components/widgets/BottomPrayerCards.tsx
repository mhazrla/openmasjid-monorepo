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
        { name: 'Shubuh', time: prayerTimes.fajr || prayerTimes.subuh || prayerTimes.shubuh, id: 'fajr' },
        { name: 'Dzuhur', time: prayerTimes.dhuhr || prayerTimes.dzuhur, id: 'dhuhr' },
        { name: 'Ashar', time: prayerTimes.asr || prayerTimes.ashar, id: 'asr' },
        { name: 'Maghrib', time: prayerTimes.maghrib, id: 'maghrib' },
        { name: 'Isya', time: prayerTimes.isha || prayerTimes.isya, id: 'isha' },
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
                        ? 'bg-white/10 backdrop-blur-3xl border-t border-l border-white/40 border-b border-r border-white/10 shadow-[0_15px_40px_rgba(16,185,129,0.5)] scale-[1.05] z-30' 
                        : 'bg-[#121914] border border-white/5 z-10'
                    }`}>
                        {isActive && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/50 blur-[50px] rounded-full pointer-events-none" />
                                <div className="absolute top-4 right-5 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_var(--theme-primary)] animate-pulse border border-white/50"></div>
                            </>
                        )}
                        <h3 className="text-[2rem] font-black mb-2 uppercase tracking-widest relative z-10" style={{ color: isActive ? 'var(--theme-accent)' : 'var(--theme-label)' }}>
                            {prayer.name}
                        </h3>
                        <p className={`text-[4rem] font-mono font-black leading-none ...`}>
                            {prayer.time}
                        </p>
                    </div>
                );
            })}
        </div>
    );
});
