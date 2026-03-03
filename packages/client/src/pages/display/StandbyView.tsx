import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useMosqueProfile } from '../../features/mosque/hooks';
import { useDisplayConfig } from '../../features/display-config/hooks';
import { usePrayerTime } from '../../features/prayer/hooks';
import { useActiveRamadan } from '../../features/ramadan/hooks';
import { usePrayerStateMachine } from '../../features/display/hooks';
import { useSlideData } from '../../features/display/hooks/useSlideData';
import { FloatingPillClock, BottomPrayerCards, DashboardCountdown, PrayerCountdownWidget } from '../../features/display/components/widgets';
import { SlideRenderer } from '../../features/display/components/layouts/SlideRenderer';
import { AlertScreenWrapper } from '../../features/display/components/layouts/AlertScreenWrapper';
import { getEffectiveDate } from '../../features/display/utils/display-helpers';
import { REFETCH_INTERVAL, SLIDE_DURATION } from '../../constants/duration';

export const StandbyView = () => 
{
    const { data: profile } = useMosqueProfile({ refetchInterval: REFETCH_INTERVAL }); 
    const { data: config } = useDisplayConfig({ refetchInterval: REFETCH_INTERVAL });
    const { data: ramadanConfig } = useActiveRamadan({ refetchInterval: REFETCH_INTERVAL });
    
    const [now, setNow] = useState(new Date());
    const [slideIndex, setSlideIndex] = useState(0);

    useEffect(() => 
    {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todayStr = useMemo(() => format(now, 'yyyy-MM-dd'), [now]);
    const currentTimeStr = useMemo(() => format(now, 'HH:mm'), [now]);
    const { data: prayerTimes } = usePrayerTime(todayStr, { refetchInterval: REFETCH_INTERVAL });
    const effectiveDate = useMemo(() => getEffectiveDate(now, prayerTimes?.maghrib), [now, prayerTimes?.maghrib]);
    const effectiveDateStr = useMemo(() => format(effectiveDate, 'yyyy-MM-dd'), [effectiveDate]);
    
    const slides = useSlideData(ramadanConfig, effectiveDateStr, profile);
    const prayerState = usePrayerStateMachine(now, prayerTimes, config as any); 

    const isMenuVisible = useMemo(() => 
    {
        if (slides.length === 0) return true;
        const currentType = slides[slideIndex % slides.length]?.type;
        
        const hiddenOn = ['lelang_table', 'bank_info', 'hadits', 'kajian_event'];
        return !hiddenOn.includes(currentType);
    }, [slides, slideIndex]);

    useEffect(() => 
    {
        if (config?.baseFontSize) document.documentElement.style.fontSize = `${config.baseFontSize}%`;
        else document.documentElement.style.fontSize = '100%';
        return () => 
        { document.documentElement.style.fontSize = '100%'; };
    }, [config?.baseFontSize]);
    
    useEffect(() => 
    {
        if (slides.length <= 1 || prayerState.mode !== 'normal') return;
        const interval = setInterval(() => 
        {
            setSlideIndex((prev) => (prev + 1) % slides.length);
        }, SLIDE_DURATION || 15000); 
        return () => clearInterval(interval);
    }, [slides.length, prayerState.mode]); 

    if (!profile || !config) return <Loader2 className="animate-spin w-10 h-10 text-emerald-500 m-auto" />;

    const getFontFamily = () => 
    {
        const type = config.fontFamily || 'sans';
        if (type === 'serif') return '"Playfair Display", Georgia, serif';
        if (type === 'mono') return 'monospace';
        return 'Inter, ui-sans-serif, system-ui, sans-serif';
    };

    const safeSlideIndex = slides.length > 0 ? (slideIndex >= slides.length ? 0 : slideIndex) : 0;
    const currentActiveSlide = slides.length > 0 ? slides[safeSlideIndex] : null;

    return (
        <div 
            className="w-[1920px] h-[1080px] overflow-hidden relative flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white select-none cursor-none"
            style={{
                fontFamily: getFontFamily(),
                transformOrigin: 'top left',
                '--theme-primary': config.themeColor || '#10b981',
                '--color-primary': 'var(--theme-primary)',
                '--theme-accent': config.accentColor || '#fbbf24',
                '--color-accent': 'var(--theme-accent)',
                '--theme-label': config.labelColor || '#cbd5e1',
                '--scale-label': (config.labelFontSize || 100) / 100
            } as React.CSSProperties}
        >
            <style>
                {`
                    @keyframes marquee {
                        0% { transform: translateX(100%); }
                        100% { transform: translateX(-100%); }
                    }
                    .animate-marquee {
                        display: inline-block;
                        white-space: nowrap;
                        animation: marquee 25s linear infinite;
                    }
                `}
            </style>
            
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-900/20 blur-[150px] rounded-full pointer-events-none z-0" />
            <div className={`absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-primary/20 to-transparent blur-[80px] pointer-events-none z-0 transition-opacity duration-1000 ${isMenuVisible ? 'opacity-100' : 'opacity-0'}`} />

            {prayerState.mode === 'adzan' && (
                <AlertScreenWrapper now={now} config={config} profile={profile} zIndex="z-50">
                    <h1 className="text-[8rem] font-black text-primary mb-6 drop-shadow-[0_0_40px_rgba(16,185,129,0.5)] tracking-[0.2em] animate-pulse">ADZAN</h1>
                    <p className="text-[3.5rem] text-slate-200 font-light uppercase tracking-[0.4em] drop-shadow-lg">
                        <span className="font-bold text-white">{prayerState.prayerName}</span> BERKUMANDANG
                    </p>
                </AlertScreenWrapper>
            )}

            {prayerState.mode === 'shalat' && (
                <AlertScreenWrapper now={now} config={config} profile={profile} zIndex="z-[100]">
                    <p className="text-[2.5rem] text-primary font-medium tracking-[0.4em] uppercase mb-6 drop-shadow-md">SHALAT BERLANGSUNG</p>
                    <h1 className="text-[9rem] font-black text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] tracking-tighter mb-14 uppercase leading-none">
                        {prayerState.prayerName || 'SHALAT'}
                    </h1>
                    <div className="w-64 h-2 bg-primary rounded-full shadow-[0_0_20px_var(--theme-primary)] mb-14" />
                    <p className="text-[3rem] text-slate-300 font-light tracking-wide drop-shadow-md">Mohon Nonaktifkan Nada Dering Handphone</p>
                </AlertScreenWrapper>
            )}

            {prayerState.mode !== 'normal' && prayerState.mode !== 'adzan' && prayerState.mode !== 'shalat' && prayerState.targetTime && (
                <AlertScreenWrapper now={now} config={config} profile={profile} zIndex="z-50">
                    <PrayerCountdownWidget targetTime={prayerState.targetTime} prayerName={prayerState.prayerName} mode={prayerState.mode as any} beepReminderDuration={config.beepReminderDuration} enableBeep={config.enableBeep} />
                </AlertScreenWrapper>
            )}

            {prayerState.mode === 'normal' && (
                <>
                    <FloatingPillClock 
                        now={now} 
                        hijriDate={config.cachedHijriDate} 
                        profile={profile} 
                        isVisible={isMenuVisible} 
                    />
                    
                    <main className={`flex-1 w-full flex items-center justify-center px-10 overflow-hidden z-10 relative transition-all duration-1000 ease-in-out ${
                        isMenuVisible ? 'pt-10 pb-[180px]' : 'pt-10 pb-10'
                    }`}>
                        {slides.length > 0 ? (
                            <SlideRenderer currentSlide={currentActiveSlide} slideIndex={safeSlideIndex} ramadanConfig={ramadanConfig} effectiveDate={effectiveDate} />
                        ) : (
                            <DashboardCountdown prayerState={prayerState} now={now} />
                        )}
                    </main>

                    <div className={`absolute left-0 w-full flex flex-col z-20 transition-all duration-1000 ease-in-out ${
                        isMenuVisible 
                        ? 'bottom-0 translate-y-0 opacity-100' 
                        : 'bottom-0 translate-y-full opacity-0 pointer-events-none'
                    }`}>
                        <BottomPrayerCards prayerTimes={prayerTimes} currentTimeStr={currentTimeStr} />
                        
                        <div className="h-[60px] flex items-center shadow-[0_-10px_30px_rgba(16,185,129,0.2)] overflow-hidden relative" style={{ backgroundColor: 'var(--theme-primary)' }}>
                            <div className="font-black uppercase tracking-widest animate-marquee w-full whitespace-nowrap" style={{ fontSize: 'calc(2.5rem * var(--scale-label, 1))', color: 'var(--theme-label)' }}>
                                {config.runningText || "MARI RAPATKAN BARISAN, LURUSKAN SHAF, DAN KHUSYUK DALAM BERIBADAH."}
                                <span className="mx-24" style={{ color: 'var(--theme-accent)' }}>•</span>
                                {config.runningText || "MARI RAPATKAN BARISAN, LURUSKAN SHAF, DAN KHUSYUK DALAM BERIBADAH."}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};