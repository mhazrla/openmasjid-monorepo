import React, { useState, useEffect, useMemo, memo } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

// --- Imports: Hooks ---
import { useMosqueProfile } from '../../features/mosque/hooks';
import { useDisplayConfig } from '../../features/display-config/hooks';
import { usePrayerTime } from '../../features/prayer/hooks';
import { useActiveRamadan } from '../../features/ramadan/hooks';
import { useKajianEvents } from '../../features/kajian/hooks';
import { usePrayerStateMachine, useHadithDisplay } from '../../features/display/hooks';
import { useFinanceSummaryData } from '../../features/finance/hooks';

// --- Imports: Components ---
import { DisplayHeader } from '../../features/display/components/DisplayHeader';
import { DisplayFooter } from '../../features/display/components/DisplayFooter';
import { TarawihWidget, PosterWidget, HaditsWidget, RamadanTableWidget, BankInfoWidget, FinanceSummaryWidget } from '../../features/display/components/ContentWidgets';
import PrayerCountdownWidget from '../../features/display/components/PrayerCountdownWidget';
import { KajianWidget } from '../../features/display/components/KajianWidget';

// --- Imports: Utils & Types ---
import { DUMMY_HADITS, getNextPrayer, getEffectiveDate } from '../../features/display/utils/display-helpers';
import { getImageUrl } from '../../lib/utils';
import type { SlideContent, RamadanScheduleUI } from '../../features/display/types';
import { REFETCH_INTERVAL, SLIDE_DURATION } from '../../constants/duration';

// --- Helper Hook: Slide Data ---
const useSlideData = (ramadanConfig: any | undefined, effectiveDateStr: string, profile: any) => 
{
    const { data: kajianEvents }    = useKajianEvents({ upcoming: true, refetchInterval: REFETCH_INTERVAL });
    const { data: hadith }          = useHadithDisplay();
    const { data: financeSummary }  = useFinanceSummaryData({ refetchInterval: REFETCH_INTERVAL });

    return useMemo(() => 
    {
        const items: SlideContent[] = [];

        // 1. Ramadan Logic
        const ramadanSchedules: RamadanScheduleUI[] = ramadanConfig?.schedules || [];
        const todaysRamadanSchedule = ramadanConfig?.isActive 
            ? ramadanSchedules.find(s => s.date.startsWith(effectiveDateStr))
            : null;

        if (ramadanConfig?.isActive && ramadanSchedules.length > 0) 
        {
            let startIndex = 0;
            const todayIndex = ramadanSchedules.findIndex(s => s.date.startsWith(effectiveDateStr));
            
            if (todayIndex !== -1) 
            {
                // Today is during Ramadan, show today and the next two days (max 3)
                startIndex = Math.min(todayIndex, Math.max(0, ramadanSchedules.length - 3));
            } 
            else if (effectiveDateStr > ramadanSchedules[ramadanSchedules.length - 1].date) 
            {
                // Past Ramadan, show the last 3 days
                startIndex = Math.max(0, ramadanSchedules.length - 3);
            } 
            else 
            {
                // Before Ramadan, show the first 3 days
                startIndex = 0;
            }

            items.push({ type: 'lelang_table', data: ramadanSchedules.slice(startIndex, startIndex + 3) });
            if (todaysRamadanSchedule?.tarawihImam) items.push({ type: 'tarawih_today', data: todaysRamadanSchedule });
            if (todaysRamadanSchedule?.iftarSpeaker) items.push({ type: 'kajian_today', data: todaysRamadanSchedule });
        }

        // 2. Kajian Events
        if (kajianEvents && kajianEvents.length > 0) 
        {
            kajianEvents.forEach((ev: any) => 
            {
                items.push({ 
                    type: 'kajian_event', 
                    data: { 
                        id: ev.id,
                        title: ev.title,
                        speaker: ev.speaker?.name || 'Ustadz',
                        type: ev.type,
                        dateRaw: ev.displayDate || ev.date,
                        posterUrl: ev.posterUrl ? getImageUrl(ev.posterUrl) : undefined
                    } 
                });
            });
        }

        // 3. Bank Info & QRIS (NEW)
        if (profile && (profile.bankAccountNumber || profile.qrisUrl)) 
        {
             items.push({ 
                type: 'bank_info', 
                data: {
                    mosqueName: profile.name,
                    bankName: profile.bankName,
                    bankAccountName: profile.bankAccountName,
                    accountNumber: profile.bankAccountNumber,
                    qrisUrl: profile.qrisUrl ? getImageUrl(profile.qrisUrl) : undefined
                }
            });
        }

        // 4. Hadith
        if (hadith) 
        {
            items.push({ 
                type: 'hadits', 
                data: 
                {
                    id: hadith.id,
                    text: hadith.teksIndo || '',
                    source: `${hadith.takhrij || 'Hadits'} ${hadith.grade ? `(${hadith.grade})` : ''}`,
                    arabic: hadith.teksArab || undefined
                }
            });
        }
        else if (DUMMY_HADITS.length > 0 && !hadith) 
        {
             items.push({ type: 'hadits', data: DUMMY_HADITS[0] });
        }

        // 5. Finance Summary
        if (financeSummary) 
        {
             items.push({ type: 'finance_summary', data: financeSummary });
        }
        
        return items;
    }, [ramadanConfig, effectiveDateStr, kajianEvents, profile, hadith, financeSummary]);
};

// --- Component: Slide Renderer ---
const SlideRenderer = memo(({ currentSlide, ramadanConfig, effectiveDate }: { currentSlide: SlideContent | null; ramadanConfig?: any; effectiveDate: Date; }) => 
{
    if (!currentSlide) return null;

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-500">{children}</div>
    );

    switch (currentSlide.type) 
    {
        case 'lelang_table': return <Wrapper><RamadanTableWidget schedules={currentSlide.data} config={ramadanConfig} effectiveDate={effectiveDate} /></Wrapper>;
        case 'tarawih_today': return <Wrapper><TarawihWidget data={{ ...currentSlide.data, description: ramadanConfig?.badalImamText || "Mari Luruskan & Rapatkan Shaf" }} hijriYear={ramadanConfig?.hijriYear} /></Wrapper>;
        case 'kajian_today': return <Wrapper><TarawihWidget data={{ ramadanDay: currentSlide.data.ramadanDay, imam: currentSlide.data.iftarSpeaker, description: currentSlide.data.iftarKajianTitle || "Kajian Menjelang Berbuka Puasa" }} title="Kajian Ifthor" hijriYear={ramadanConfig?.hijriYear} /></Wrapper>;
        case 'kajian_event': return <KajianWidget data={currentSlide.data} />;
        case 'poster': return <Wrapper><PosterWidget data={currentSlide.data} /></Wrapper>;
        case 'bank_info': return <Wrapper><BankInfoWidget data={currentSlide.data} /></Wrapper>;
        case 'hadits': return <Wrapper><HaditsWidget data={currentSlide.data} /></Wrapper>;
        case 'finance_summary': return <Wrapper><FinanceSummaryWidget data={currentSlide.data} /></Wrapper>;
        default: return null;
    }
});

// --- Reusable Component: Time & Date Display ---
const TimeAndDateDisplay = memo(({ now, hijriDate, config }: { now: Date, hijriDate?: string, config: any }) => 
{
    const clockScale = (config.clockFontSize || 100) / 100;

    return (
        <div 
            className="absolute top-12 w-full flex flex-col items-center justify-center z-10 space-y-2"
        >
            <div 
                className="font-clock text-primary drop-shadow-[0_0_15px_var(--theme-primary)] tracking-wider leading-none"
                style={{ fontSize: `calc(6rem * ${clockScale})` }}
            >
                {format(now, 'HH:mm:ss')}
            </div>
            <div className="flex items-center gap-6 text-[1.25rem] text-slate-200 font-medium tracking-wide">
                <span>{format(now, 'EEEE, dd MMMM yyyy')}</span>
                <span className="w-[0.4rem] h-[0.4rem] rounded-full bg-primary drop-shadow-sm"></span>
                <span>{hijriDate || 'H'}</span>
            </div>
        </div>
    );
});

// --- MAIN PAGE ---
export const StandbyView = () => 
{
    // 1. Data Hooks
    const { data: profile } = useMosqueProfile({ refetchInterval: REFETCH_INTERVAL }); 
    const { data: config } = useDisplayConfig({ refetchInterval: REFETCH_INTERVAL });
    const { data: ramadanConfig } = useActiveRamadan({ refetchInterval: REFETCH_INTERVAL });
    
    // 2. Local State & Clock
    const [now, setNow] = useState(new Date());
    const [slideIndex, setSlideIndex] = useState(0);

    // Debug Theme Injection
    useEffect(() => 
    {
        if (config) {
            console.log('StandbyView Loaded Config:', {
                themeColor: config.themeColor,
                fontFamily: config.fontFamily,
                baseFontSize: config.baseFontSize,
                clockFontSize: config.clockFontSize
            });
        }
    }, [config]);

    useEffect(() => 
    {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Global Font Scaling Layer
    useEffect(() => 
    {
        if (config?.baseFontSize) {
            document.documentElement.style.fontSize = `${config.baseFontSize}%`;
        } else {
            document.documentElement.style.fontSize = '100%';
        }
        
        return () => 
        {
            document.documentElement.style.fontSize = '100%';
        };
    }, [config?.baseFontSize]);

    // 3. Derived Data
    const todayStr = useMemo(() => format(now, 'yyyy-MM-dd'), [now]);
    const { data: prayerTimes } = usePrayerTime(todayStr, { refetchInterval: REFETCH_INTERVAL });
    const nextPrayer = useMemo(() => getNextPrayer(prayerTimes, now), [prayerTimes, now]);
    const effectiveDate = useMemo(() => getEffectiveDate(now, prayerTimes?.maghrib), [now, prayerTimes?.maghrib]);
    const effectiveDateStr = useMemo(() => format(effectiveDate, 'yyyy-MM-dd'), [effectiveDate]);
    
    // 4. Custom Logic Hooks (Cleaned Up)
    const slides = useSlideData(ramadanConfig, effectiveDateStr, profile);
    const prayerState = usePrayerStateMachine(now, prayerTimes, config as any); 

    // 5. Slide Rotation Effect
    useEffect(() => 
    {
        if (slides.length <= 1 || prayerState.mode !== 'normal') return;
        const interval = setInterval(() => setSlideIndex((prev) => (prev + 1) % slides.length), SLIDE_DURATION);
        return () => clearInterval(interval);
    }, [slides.length, prayerState.mode]); 

    // 6. Loading State
    if (!profile || !config) return <Loader2 className="animate-spin w-10 h-10 text-emerald-500 m-auto" />;

    // 7. Render Content Switcher
    const renderContent = () => 
    {
        // Mode: Alerts (Countdown / Adzan)
        if (prayerState.mode !== 'normal') 
        {
            if (prayerState.mode === 'adzan') 
            {
                return (
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700 w-full h-full relative">
                        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-950 to-black opacity-90 z-0" />
                        
                        <TimeAndDateDisplay now={now} hijriDate={config.cachedHijriDate as string | undefined} config={config} />

                        <div className="relative z-10 text-center mt-16">
                            <h1 className="text-[4rem] lg:text-[5rem] font-bold text-primary mb-4 drop-shadow-lg tracking-wider">ADZAN</h1>
                            <p className="text-[1.5rem] lg:text-[2rem] text-white/80 font-light uppercase tracking-widest">{prayerState.prayerName} Berkumandang</p>
                        </div>
                    </div>
                );
            }
            // Pre-Adzan & Iqomah share the same widget logic
            if (prayerState.targetTime) 
            {
                return (
                    <PrayerCountdownWidget 
                        targetTime={prayerState.targetTime}
                        prayerName={prayerState.prayerName} 
                        mode={prayerState.mode as 'pre_adzan' | 'iqomah'}
                        beepReminderDuration={config.beepReminderDuration}
                        enableBeep={config.enableBeep}
                    />
                );
            }
        }
        
        // Mode: Shalat
        if (prayerState.mode === 'shalat')
        {
             return (
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700 w-full h-full relative">
                        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-950 to-black z-0" />
                        
                        <TimeAndDateDisplay now={now} hijriDate={config.cachedHijriDate as string | undefined} config={config} />

                        <div className="relative z-10 text-center space-y-8 px-4 mt-16">
                            
                            {/* Title */}
                            <div className="space-y-2">
                                <p className="text-[1.5rem] lg:text-[2rem] text-primary font-medium tracking-[0.2em] uppercase drop-shadow-md">SHALAT SEDANG BERLANGSUNG</p>
                                <h1 className="text-[6rem] font-bold text-white drop-shadow-2xl tracking-tight leading-none">
                                    {prayerState.prayerName.toUpperCase()}
                                </h1>
                            </div>

                            {/* Divider */}
                            <div className="w-32 h-1 bg-primary rounded-full mx-auto shadow-[0_0_10px_var(--theme-primary)]" />

                            {/* Main Message */}
                            <div className="space-y-6">
                                <p className="text-[2rem] text-slate-300 font-light tracking-wide mx-auto px-8 leading-relaxed">
                                    Mohon <span className="text-primary font-semibold">Nonaktifkan</span> Nada Dering Handphone
                                </p>
                            </div>

                        </div>
                    </div>
            );
        }

        // Mode: Normal Slides
        return <SlideRenderer currentSlide={slides[slideIndex] || null} ramadanConfig={ramadanConfig} effectiveDate={effectiveDate} />;
    };

    // Get correct font family fallback
    const getFontFamily = () => 
    {
        const type = config.fontFamily || 'sans';
        if (type === 'serif') return '"Playfair Display", Georgia, serif';
        if (type === 'mono') return 'monospace';
        return 'Inter, ui-sans-serif, system-ui, sans-serif';
    };

    return (
        <div 
            className="w-full h-full overflow-hidden relative flex flex-col text-white select-none cursor-none bg-slate-950"
            style={{
                fontFamily: getFontFamily(),
                '--theme-primary': config.themeColor || '#10b981',
                '--color-primary': 'var(--theme-primary)',
                '--theme-accent': config.accentColor || '#fbbf24',
                '--color-accent': 'var(--theme-accent)',
                '--theme-label': config.labelColor || '#cbd5e1',
                '--color-label': 'var(--theme-label)',
                '--scale-label': (config.labelFontSize || 100) / 100
            } as React.CSSProperties}
        >
            {/* Header */}
            {prayerState.mode === 'normal' && <DisplayHeader profile={profile} currentTime={now} config={config as any} effectiveDate={effectiveDate} />}
            
            {/* Main */}
            <main className={`relative z-10 flex-1 flex flex-col items-center justify-center w-full overflow-hidden transition-all duration-500 
                ${prayerState.mode === 'normal' ? 'p-12' : 'p-0 w-full h-full'}`}
            >
                {renderContent()}
            </main>
            {prayerState.mode === 'normal' && <DisplayFooter runningText={config.runningText as string} prayerTimes={prayerTimes} nextPrayer={nextPrayer} />}
        </div>
    );
};