import React, { useState, useEffect, useMemo, memo } from 'react';
import { format, parseISO, isSameDay, addMinutes, isWithinInterval, subMinutes, parse } from 'date-fns';
import { Loader2 } from 'lucide-react';

import { useMosqueProfile } from '../../features/mosque/hooks';
import { useDisplayConfig } from '../../features/display-config/hooks';
import { usePrayerTime } from '../../features/prayer/hooks';
import { useActiveRamadan } from '../../features/ramadan/hooks';

import { DisplayHeader } from '../../features/display/components/DisplayHeader';
import { DisplayFooter } from '../../features/display/components/DisplayFooter';
import { TarawihWidget, PosterWidget, HaditsWidget, RamadanTableWidget } from '../../features/display/components/ContentWidgets';
import PrayerCountdownWidget from '../../features/display/components/PrayerCountdownWidget';

import { DUMMY_POSTERS, DUMMY_HADITS, getNextPrayer } from '../../features/display/utils/display-helpers';
import type { SlideContent, RamadanScheduleUI, DisplayMode, PrayerState } from '../../features/display/types';

const useSlideData = (ramadanConfig: any | undefined, todayStr: string) => 
{
    return useMemo(() => 
    {
        const items: SlideContent[] = [];
        const ramadanSchedules: RamadanScheduleUI[] = ramadanConfig?.schedules || [];
        const todaysRamadanSchedule = ramadanConfig?.isActive 
            ? ramadanSchedules.find(s => s.date.startsWith(todayStr))
            : null;

        if (ramadanConfig?.isActive && ramadanSchedules.length > 0) 
        {
            const todayDate = parseISO(todayStr); 
            const todayIndex = ramadanSchedules.findIndex(s => isSameDay(parseISO(s.date), todayDate));
            let filteredSchedules: RamadanScheduleUI[] = [];
            
            if (todayIndex === -1) 
            {
                const firstDate = parseISO(ramadanSchedules[0].date);
                filteredSchedules = todayDate < firstDate ? ramadanSchedules.slice(0, 3) : ramadanSchedules.slice(-3);
            } else {
                const start = Math.max(0, todayIndex - 1);
                const safeStart = Math.min(start, Math.max(0, ramadanSchedules.length - 3));
                filteredSchedules = ramadanSchedules.slice(safeStart, safeStart + 3);
            }

            items.push({ type: 'lelang_table', data: filteredSchedules });

            if (todaysRamadanSchedule?.tarawihImam) items.push({ type: 'tarawih_today', data: todaysRamadanSchedule });
            if (todaysRamadanSchedule?.iftarSpeaker) items.push({ type: 'kajian_today', data: todaysRamadanSchedule });
        }

        DUMMY_POSTERS.forEach(p => items.push({ type: 'poster', data: p }));
        DUMMY_HADITS.forEach(h => items.push({ type: 'hadits', data: h }));
        
        return items;
    }, [ramadanConfig, todayStr]);
};

const MemoizedSlideContent = memo(({ currentSlide, ramadanConfig }: { currentSlide: SlideContent | null, ramadanConfig?: any }) => 
{
    if (!currentSlide) return null;

    return (
        <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-500">
            {currentSlide.type === 'lelang_table' && <RamadanTableWidget schedules={currentSlide.data} config={ramadanConfig} />}
            {currentSlide.type === 'tarawih_today' && <TarawihWidget data={{ ...currentSlide.data, description: "Mari Luruskan & Rapatkan Shaf" }} hijriYear={ramadanConfig?.hijriYear} />}
            {currentSlide.type === 'kajian_today' && <TarawihWidget data={{ ramadanDay: currentSlide.data.ramadanDay, imam: currentSlide.data.iftarSpeaker, description: "Kajian Menjelang Berbuka Puasa" }} title="Kajian Ifthor" hijriYear={ramadanConfig?.hijriYear} />}
            {currentSlide.type === 'poster' && <PosterWidget data={currentSlide.data} />}
            {currentSlide.type === 'hadits' && <HaditsWidget data={currentSlide.data} />}
        </div>
    );
}, (prev, next) => prev.currentSlide === next.currentSlide && prev.ramadanConfig === next.ramadanConfig);

export const StandbyView = () => 
{
    const { data: profile } = useMosqueProfile();
    const { data: config } = useDisplayConfig();
    const { data: ramadanConfig } = useActiveRamadan();
    
    const [now, setNow] = useState(new Date());
    const [slideIndex, setSlideIndex] = useState(0);
    const [prayerState, setPrayerState] = useState<PrayerState>({ mode: 'normal', targetTime: null, prayerName: '' });

    useEffect(() => 
    {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todayStr = useMemo(() => format(now, 'yyyy-MM-dd'), [now]);
    
    // KEMBALI MENGGUNAKAN DATA ASLI
    const { data: prayerTimes } = usePrayerTime(todayStr);
    
    const nextPrayer = useMemo(() => getNextPrayer(prayerTimes, now), [prayerTimes, now]);
    const slides = useSlideData(ramadanConfig, todayStr);
    const currentSlide = slides[slideIndex] || null;

    useEffect(() => 
    {
        if (slides.length <= 1 || prayerState.mode !== 'normal') return;
        const interval = setInterval(() => setSlideIndex((prev) => (prev + 1) % slides.length), 5000);
        return () => clearInterval(interval);
    }, [slides.length, slideIndex, prayerState.mode]); 

    useEffect(() => 
    {
        if (!prayerTimes || !config) return;

        const checkState = () => 
        {
            const delays = {
                Subuh: config.iqomahDelaySubuh,
                Dzuhur: config.iqomahDelayDzuhur,
                Ashar: config.iqomahDelayAshar,
                Maghrib: config.iqomahDelayMaghrib,
                Isya: config.iqomahDelayIsya
            };

            const prayers = [
                { name: 'Subuh', time: prayerTimes.subuh },
                { name: 'Dzuhur', time: prayerTimes.dzuhur },
                { name: 'Ashar', time: prayerTimes.ashar },
                { name: 'Maghrib', time: prayerTimes.maghrib },
                { name: 'Isya', time: prayerTimes.isya }
            ];

            let foundMode: DisplayMode = 'normal';
            let target: Date | null = null;
            let pName = '';

            for (const p of prayers) 
            {
                // Parsing HH:mm standar
                const pTime = parse(p.time, 'HH:mm', now);

                // MENGGUNAKAN NILAI DARI DATABASE
                const preAdzanStart = subMinutes(pTime, config.preAdzanDuration);
                const adzanEnd = addMinutes(pTime, config.adzanDuration);
                const iqomahTime = addMinutes(adzanEnd, delays[p.name as keyof typeof delays] || 10);

                if (isWithinInterval(now, { start: preAdzanStart, end: pTime })) 
                {
                    foundMode = 'pre_adzan';
                    target = pTime;
                    pName = p.name;
                    break; 
                }
                if (isWithinInterval(now, { start: pTime, end: adzanEnd })) 
                {
                    foundMode = 'adzan';
                    target = null; 
                    pName = p.name;
                    break;
                }
                if (isWithinInterval(now, { start: adzanEnd, end: iqomahTime })) 
                {
                    foundMode = 'iqomah';
                    target = iqomahTime;
                    pName = p.name;
                    break;
                }
            }

            setPrayerState(prev => 
            {
                const isChanged = prev.mode !== foundMode || prev.prayerName !== pName || prev.targetTime?.getTime() !== target?.getTime();
                return isChanged ? { mode: foundMode, targetTime: target, prayerName: pName } : prev;
            });
        };

        checkState();
    }, [now, prayerTimes, config]);

    if (!profile || !config) return <div className="h-screen w-screen flex bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-emerald-500 m-auto" /></div>;

    const renderContent = () => 
    {
        if (prayerState.mode === 'pre_adzan' && prayerState.targetTime) 
        {
            return (
                <PrayerCountdownWidget 
                    targetTime={prayerState.targetTime}
                    prayerName={prayerState.prayerName} 
                    mode="pre_adzan" 
                    beepReminderDuration={config.beepReminderDuration}
                    enableBeep={config.enableBeep}
                />
            );
        }

        if (prayerState.mode === 'iqomah' && prayerState.targetTime) 
        {
            return (
                <PrayerCountdownWidget 
                    targetTime={prayerState.targetTime}
                    prayerName={prayerState.prayerName} 
                    mode="iqomah" 
                    beepReminderDuration={config.beepReminderDuration}
                    enableBeep={config.enableBeep}
                />
            );
        }

        if (prayerState.mode === 'adzan') return (
            <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-900 to-black opacity-90" />
                <div className="relative z-10 text-center">
                    <h1 className="text-6xl font-bold text-emerald-400 mb-4 drop-shadow-lg tracking-wider">ADZAN</h1>
                    <p className="text-3xl text-white/80 font-light uppercase tracking-widest">{prayerState.prayerName} Berkumandang</p>
                    <div className="mt-8">
                        <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full animate-bounce mx-1" />
                        <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full animate-bounce delay-100 mx-1" />
                        <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full animate-bounce delay-200 mx-1" />
                    </div>
                </div>
            </div>
        );
        return <MemoizedSlideContent currentSlide={currentSlide} ramadanConfig={ramadanConfig} />;
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-950 text-white font-sans select-none relative flex flex-col cursor-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse-slow delay-1000 pointer-events-none" />

            {prayerState.mode === 'normal' && <DisplayHeader profile={profile} currentTime={now} />}
            <main className={`relative z-10 flex-1 flex flex-col items-center justify-center w-full overflow-hidden transition-all duration-500 ${prayerState.mode === 'normal' ? 'px-4' : 'p-0 w-screen h-screen'}`}>
                {renderContent()}
            </main>
            {prayerState.mode === 'normal' && <DisplayFooter runningText={config.runningText as string} prayerTimes={prayerTimes} nextPrayer={nextPrayer} />}
        </div>
    );
};