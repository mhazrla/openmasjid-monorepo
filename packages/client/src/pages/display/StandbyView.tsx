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
        
        const hiddenOn = [
            'lelang_table', 
            'bank_info', 
            'hadits', 
            'kajian_rutin', 
            'kajian_tematik', 
            'tabligh_akbar',
            'poster'
        ];
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
            className="w-[1920px] h-[1080px] overflow-hidden relative flex flex-col text-white select-none cursor-none"
            style={{
                fontFamily: getFontFamily(),
                transformOrigin: 'top left',
                background: `
                    radial-gradient(ellipse at 0% 0%, #020617 0%, transparent 50%),
                    radial-gradient(ellipse at 100% 0%, #064e3b 0%, transparent 50%),
                    radial-gradient(ellipse at 0% 100%, #0f172a 0%, transparent 50%),
                    radial-gradient(ellipse at 100% 100%, #020617 0%, transparent 50%),
                    linear-gradient(135deg, #020617 0%, #0f172a 100%)
                `,
                '--theme-primary': config.themeColor || '#10b981',
                '--color-primary': 'var(--theme-primary)',
                '--theme-accent': config.accentColor || '#fbbf24',
                '--color-accent': 'var(--theme-accent)',
                '--theme-label': config.labelColor || '#cbd5e1',
                '--scale-label': (config.labelFontSize || 100) / 100,
                '--scale-clock': (config.clockFontSize || 100) / 100
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
                    @keyframes orb-breathe {
                        0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
                        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
                    }
                    @keyframes orb-breathe-slow {
                        0%, 100% { opacity: 0.5; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.05); }
                    }
                `}
            </style>
            
            {/* Glow Orbs */}
            <div 
                className="absolute top-[-15%] left-1/2 w-[1400px] h-[900px] bg-primary/25 blur-[180px] rounded-full pointer-events-none z-0"
                style={{ animation: 'orb-breathe 9s ease-in-out infinite' }}
            />
            <div 
                className="absolute bottom-[-15%] right-[-10%] w-[1000px] h-[1000px] bg-emerald-500/20 blur-[150px] rounded-full pointer-events-none z-0"
                style={{ animation: 'orb-breathe-slow 12s ease-in-out infinite' }}
            />
            <div 
                className="absolute top-[30%] right-[-5%] w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none z-0"
                style={{ animation: 'orb-breathe-slow 15s ease-in-out infinite 3s' }}
            />
            <div className={`absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-primary/20 to-transparent blur-[80px] pointer-events-none z-0 transition-opacity duration-1000 ${isMenuVisible ? 'opacity-100' : 'opacity-0'}`} />
            
            {/* Texture Overlay */}
            <div 
                className="absolute inset-0 pointer-events-none z-[1] mix-blend-overlay opacity-[0.03]"
                style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')", backgroundRepeat: 'repeat' }}
            />

            {prayerState.mode === 'adzan' && (
                <AlertScreenWrapper now={now} config={config} profile={profile} zIndex="z-50">
                    <h1 className="font-black text-primary mb-6 drop-shadow-[0_0_40px_rgba(16,185,129,0.5)] tracking-[0.2em] animate-pulse" style={{ fontSize: 'calc(8rem * var(--scale-label, 1))' }}>ADZAN</h1>
                    <p className="text-slate-200 font-light uppercase tracking-[0.3em] drop-shadow-lg" style={{ fontSize: 'calc(4.5rem * var(--scale-label, 1))' }}>
                        <span className="font-bold text-white">{prayerState.prayerName}</span> BERKUMANDANG
                    </p>
                </AlertScreenWrapper>
            )}

            {prayerState.mode === 'shalat' && (
                <AlertScreenWrapper now={now} config={config} profile={profile} zIndex="z-[100]">
                    <p className="text-primary font-medium tracking-[0.2em] uppercase mb-6 drop-shadow-md" style={{ fontSize: 'calc(4.5rem * var(--scale-label, 1))' }}>SHALAT BERLANGSUNG</p>
                    <h1 className="font-black text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] tracking-wider mb-14 uppercase leading-none" style={{ fontSize: 'calc(9rem * var(--scale-label, 1))' }}>
                        {prayerState.prayerName || 'SHALAT'}
                    </h1>
                    <div className="w-64 h-2 bg-primary rounded-full shadow-[0_0_20px_var(--theme-primary)] mb-14" />
                    <p className="text-slate-300 font-light tracking-wider drop-shadow-md" style={{ fontSize: 'calc(3.7rem * var(--scale-label, 1))' }}>Mohon Nonaktifkan Nada Dering Handphone</p>
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