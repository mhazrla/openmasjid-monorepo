import Marquee from 'react-fast-marquee';
import { cn } from '../../../lib/utils'; 
import type { PrayerTime } from '../../prayer/types';

interface DisplayFooterProps 
{
    runningText: string;
    prayerTimes: PrayerTime | null | undefined;
    nextPrayer: string;
}

export const DisplayFooter = ({ runningText, prayerTimes, nextPrayer }: DisplayFooterProps) => (
    <footer className="relative z-30 shrink-0">
        <div className="bg-primary/90 backdrop-blur-md border-t border-primary/30 h-8 flex items-center">
            <div className="px-6 bg-primary h-full flex items-center justify-center font-extrabold text-[0.75rem] uppercase tracking-widest text-white shrink-0 shadow-lg z-10">
                Informasi
            </div>
            <Marquee gradient={false} speed={40} className="text-[1.125rem] font-bold text-white py-1">
                {(runningText || "Mohon lurus dan rapatkan shaf.").split('||').map((s, i) => <span key={i} className="mx-8 flex items-center gap-2">✨ {s}</span>)}
            </Marquee>
        </div>

        <div className="bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-4 py-3">
            <div className="max-w-[1920px] mx-auto flex items-stretch justify-between gap-3 h-20 lg:h-24">
                {['Subuh', 'Terbit', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'].map((name) => 
                {
                    const key = name.toLowerCase() as keyof PrayerTime;
                    const timeValue = prayerTimes ? prayerTimes[key] : '--:--';
                    const isNext = name === nextPrayer;
                    return (
                        <div key={name} className={cn(
                            "flex-1 flex flex-col items-center justify-center rounded-xl border transition-all duration-500 relative overflow-hidden group",
                            isNext
                                ? "bg-linear-to-b from-primary to-primary border-primary shadow-[0_0_30px_rgba(16,185,129,0.4)] -translate-y-2 scale-105 z-10"
                                : "bg-white/5 border-white/5 hover:bg-white/10"
                        )}>
                            {isNext && <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-50"></div>}
                            <span className={cn(
                                "font-extrabold uppercase tracking-widest mb-0.5 z-10 transition-all",
                                isNext ? "text-accent" : "text-label opacity-70 group-hover:opacity-100 transition-opacity"
                            )} style={{ fontSize: `calc(0.75rem * var(--scale-label, 1))` }}>{name}</span>
                            <span className={cn(
                                "text-[1.875rem] lg:text-[2.25rem] font-mono font-extrabold tracking-tighter z-10",
                                isNext ? "text-white drop-shadow-md" : "text-slate-200"
                            )}>{timeValue as string}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    </footer>
);