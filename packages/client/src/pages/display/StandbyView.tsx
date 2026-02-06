import { useState, useEffect, useMemo } from 'react';
import { useMosqueProfile } from '../../features/mosque/hooks';
import { useDisplayConfig } from '../../features/display-config/hooks';
import { usePrayerTime } from '../../features/prayer/hooks';
import { format } from 'date-fns';
import Marquee from 'react-fast-marquee';
import { Loader2 } from 'lucide-react';
import { DisplayLayout } from '../../layouts/DisplayLayout';
import { cn } from '../../lib/utils';
import type { PrayerTime } from '../../features/prayer/types';
import { ClockWidget } from '../../features/display/components/ClockWidget';

const timeToMinutes = (time: string): number => 
{
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
};

const getNextPrayer = (prayerTimes: PrayerTime | null | undefined, currentTime: Date): string => 
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
        if (timeToMinutes(s.time) >= currentMinutes) 
        {
            return s.key;
        }
    }

    // If no next prayer found today, it's Subuh (next day)
    return 'Subuh';
};

export const StandbyView = () => 
{
    const { data: profile } = useMosqueProfile();
    const { data: config }  = useDisplayConfig();
    const [now, setNow]     = useState(new Date());

    useEffect(() => 
    {
        let timeoutId: ReturnType<typeof setTimeout>;

        const syncToMinute = () => 
        {
            const currentDate = new Date();
            setNow(currentDate);

            const delay = 60000 - (currentDate.getSeconds() * 1000 + currentDate.getMilliseconds());

            timeoutId = setTimeout(() => 
            {
                syncToMinute();
            }, delay);
        };

        syncToMinute();

        return () => clearTimeout(timeoutId);
    }, []);

    const todayStr              = format(now, 'yyyy-MM-dd');
    const { data: prayerTimes } = usePrayerTime(todayStr);

    const nextPrayer = useMemo(() => getNextPrayer(prayerTimes, now), [prayerTimes, now]);

    if (!profile || !config) 
    {
        return (
            <DisplayLayout>
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                </div>
            </DisplayLayout>
        );
    }

    return (
        <DisplayLayout>
            {/* --- Header --- */}
            <header className="px-8 py-6 flex items-center justify-between bg-gradient-to-b from-slate-900/90 to-transparent z-10">
                <div className="flex items-center gap-5">
                     {/* Logo */}
                     <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-2xl overflow-hidden">
                        <img 
                            src={profile.logoUrl || "/images/logo1.webp"}
                            alt="Mosque Logo" 
                            className="w-full h-full object-contain p-2"
                            onError={(e) => 
                            {
                                // Fallback to default if load fails
                                const target = e.currentTarget;
                                if (target.src !== new URL("/images/logo1.webp", window.location.origin).href) 
                                {
                                    target.src = "/images/logo1.webp";
                                }
                            }}
                        />
                     </div>
                     <div>
                        <h1 className="text-5xl font-bold tracking-tight text-white mb-1 shadow-black/80 drop-shadow-2xl leading-none font-sans">
                            {profile.name}
                        </h1>
                        <p className="text-2xl text-slate-200 font-medium opacity-90 shadow-black/80 drop-shadow-lg tracking-wide">
                            {profile.address}
                        </p>
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="flex-1 px-8 grid grid-cols-12 gap-10 items-center pb-24">
                
                {/* LEFT: Clock Component (Isolated Render) */}
                <div className="col-span-12 lg:col-span-5 flex flex-col items-center lg:items-start justify-center space-y-8 relative">
                    <ClockWidget />
                </div>

                {/* RIGHT: Prayer Times Grid */}
                <div className="col-span-12 lg:col-span-7 h-full flex flex-col justify-center">
                    
                    {/* Ganti grid-cols-5 menjadi grid-cols-6 agar muat 6 kotak */}
                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 xl:gap-4 h-full max-h-[440px]">
                        
                        {['Subuh', 'Terbit', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'].map((name) => {
                            const key = name.toLowerCase() as keyof PrayerTime;
                            
                            const timeValue = prayerTimes ? prayerTimes[key] : '--:--';
                            const isNext = name === nextPrayer;

                            return (
                                <div 
                                    key={name} 
                                    className={cn(
                                        "relative flex flex-col items-center justify-center rounded-3xl border backdrop-blur-md transition-all duration-700 min-h-[140px] lg:min-h-auto",
                                        isNext 
                                            ? "bg-emerald-600/90 border-emerald-400/50 shadow-[0_0_50px_rgba(16,185,129,0.5)] scale-110 z-10 animate-pulse-slow" 
                                            : "bg-slate-900/40 border-white/5 text-slate-300 hover:bg-slate-800/40" 
                                    )}
                                >
                                    {isNext && (
                                        <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-3xl opacity-30 blur-md animate-pulse"></div>
                                    )}

                                    <div className="relative z-10 flex flex-col items-center">
                                        <span className={cn(
                                            "text-sm uppercase tracking-widest font-bold mb-1",
                                            isNext ? "text-emerald-50" : "text-slate-400" 
                                        )}>
                                            {name}
                                        </span>
                                        <span className={cn(
                                            "text-3xl xl:text-5xl font-bold font-mono tracking-tighter",
                                            isNext ? "text-white drop-shadow-lg" : "text-slate-200"
                                        )}>
                                            {timeValue as string}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>

            {/* --- QR Code Widget (Floating Bottom Right) --- */}
            {profile.qrisUrl && (
                <div className="absolute bottom-28 right-8 z-20">
                    <div className="bg-white p-4 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center gap-5 animate-in fade-in slide-in-from-bottom-10 duration-1000 border border-slate-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-200 p-1">
                            <img 
                                src={profile.qrisUrl}
                                alt="QRIS Donasi" 
                                className="w-full h-full object-cover rounded-xl"
                            />
                        </div>
                        <div className="pr-2">
                            <p className="text-base font-bold text-slate-900 uppercase tracking-wider mb-1">Infaq / Donasi</p>
                            <p className="text-sm text-slate-500 mb-2">Scan QRIS</p>
                            
                            {/* Bank Info */}
                            {profile.bankAccountNumber && (
                                <p className="text-xs font-mono text-slate-600 mb-1.5 border-t border-dashed pt-1 max-w-[150px] truncate">
                                    {profile.bankAccountNumber}
                                </p>
                            )}
                            
                            <div className="flex gap-1.5 grayscale opacity-70">
                                {/* Badges Mockup */}
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">BSI</span>
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">GOPAY</span>
                                <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded">OVO</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Footer Running Text --- */}
            <footer className="fixed bottom-0 left-0 right-0 h-20 bg-emerald-950/95 backdrop-blur-xl border-t border-emerald-900/50 flex items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="bg-emerald-900 px-10 h-full flex items-center justify-center border-r border-emerald-800 shrink-0 shadow-xl z-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 to-emerald-900 opacity-50"></div>
                    <span className="font-bold text-emerald-100 tracking-widest text-xl relative z-10">INFO</span>
                </div>
                <Marquee gradient={false} speed={40} className="text-3xl font-medium text-white py-2 h-full flex items-center">
                    {(config.runningText || "Selamat Datang di Masjid Kami.")
                        .split('||')
                        .map((segment, index, array) => (
                            <span key={index} className="inline-flex items-center">
                                <span>{segment.trim()}</span>

                                {index < array.length - 1 && (
                                    <span className="mx-12 text-emerald-400/50 font-light">
                                        || 
                                    </span>
                                )}
                            </span>
                        ))
                    }
                    
                    {/* Separator Penutup Marquee (Dot Besar) */}
                    <span className="mx-24 text-emerald-500/50 text-xl">●</span>
                </Marquee>
            </footer>
        </DisplayLayout>
    );
};

