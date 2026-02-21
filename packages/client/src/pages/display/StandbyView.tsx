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

// --- Imports: Components ---
import { DisplayHeader } from '../../features/display/components/DisplayHeader';
import { DisplayFooter } from '../../features/display/components/DisplayFooter';
import { TarawihWidget, PosterWidget, HaditsWidget, RamadanTableWidget, BankInfoWidget } from '../../features/display/components/ContentWidgets';
import PrayerCountdownWidget from '../../features/display/components/PrayerCountdownWidget';
import { KajianWidget } from '../../features/display/components/KajianWidget';

// --- Imports: Utils & Types ---
import { DUMMY_HADITS, getNextPrayer } from '../../features/display/utils/display-helpers';
import { getImageUrl } from '../../lib/utils';
import type { SlideContent, RamadanScheduleUI } from '../../features/display/types';

// --- Constants ---
const REFETCH_INTERVAL = 5000;

// --- Helper Hook: Slide Data ---
const useSlideData = (ramadanConfig: any | undefined, todayStr: string, profile: any) => 
{
    const { data: kajianEvents }    = useKajianEvents({ upcoming: true, refetchInterval: REFETCH_INTERVAL });
    const { data: hadith }          = useHadithDisplay();

    return useMemo(() => 
    {
        const items: SlideContent[] = [];

        // 1. Ramadan Logic
        const ramadanSchedules: RamadanScheduleUI[] = ramadanConfig?.schedules || [];
        const todaysRamadanSchedule = ramadanConfig?.isActive 
            ? ramadanSchedules.find(s => s.date.startsWith(todayStr))
            : null;

        if (ramadanConfig?.isActive && ramadanSchedules.length > 0) 
        {
            let startIndex = 0;
            const todayIndex = ramadanSchedules.findIndex(s => s.date.startsWith(todayStr));
            
            if (todayIndex !== -1) 
            {
                // Today is during Ramadan, show today and the next two days (max 3)
                startIndex = Math.min(todayIndex, Math.max(0, ramadanSchedules.length - 3));
            } 
            else if (todayStr > ramadanSchedules[ramadanSchedules.length - 1].date) 
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
        
        return items;
    }, [ramadanConfig, todayStr, kajianEvents, profile, hadith]);
};

// --- Component: Slide Renderer ---
const SlideRenderer = memo(({ currentSlide, ramadanConfig }: { currentSlide: SlideContent | null; ramadanConfig?: any; }) => 
{
    if (!currentSlide) return null;

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-500">{children}</div>
    );

    switch (currentSlide.type) 
    {
        case 'lelang_table': return <Wrapper><RamadanTableWidget schedules={currentSlide.data} config={ramadanConfig} /></Wrapper>;
        case 'tarawih_today': return <Wrapper><TarawihWidget data={{ ...currentSlide.data, description: ramadanConfig?.badalImamText || "Mari Luruskan & Rapatkan Shaf" }} hijriYear={ramadanConfig?.hijriYear} /></Wrapper>;
        case 'kajian_today': return <Wrapper><TarawihWidget data={{ ramadanDay: currentSlide.data.ramadanDay, imam: currentSlide.data.iftarSpeaker, description: currentSlide.data.iftarKajianTitle || "Kajian Menjelang Berbuka Puasa" }} title="Kajian Ifthor" hijriYear={ramadanConfig?.hijriYear} /></Wrapper>;
        case 'kajian_event': return <KajianWidget data={currentSlide.data} />;
        case 'poster': return <Wrapper><PosterWidget data={currentSlide.data} /></Wrapper>;
        case 'bank_info': return <Wrapper><BankInfoWidget data={currentSlide.data} /></Wrapper>;
        case 'hadits': return <Wrapper><HaditsWidget data={currentSlide.data} /></Wrapper>;
        default: return null;
    }
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

    useEffect(() => 
    {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 3. Derived Data
    const todayStr = useMemo(() => format(now, 'yyyy-MM-dd'), [now]);
    const { data: prayerTimes } = usePrayerTime(todayStr, { refetchInterval: REFETCH_INTERVAL });
    const nextPrayer = useMemo(() => getNextPrayer(prayerTimes, now), [prayerTimes, now]);
    
    // 4. Custom Logic Hooks (Cleaned Up)
    const slides = useSlideData(ramadanConfig, todayStr, profile);
    const prayerState = usePrayerStateMachine(now, prayerTimes, config); 

    // 5. Slide Rotation Effect
    useEffect(() => 
    {
        if (slides.length <= 1 || prayerState.mode !== 'normal') return;
        const interval = setInterval(() => setSlideIndex((prev) => (prev + 1) % slides.length), 10000);
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
                    <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-900 to-black opacity-90" />
                        <div className="relative z-10 text-center">
                            <h1 className="text-6xl font-bold text-emerald-400 mb-4 drop-shadow-lg tracking-wider">ADZAN</h1>
                            <p className="text-3xl text-white/80 font-light uppercase tracking-widest">{prayerState.prayerName} Berkumandang</p>
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
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-black z-0" />
                    <div className="relative z-10 text-center space-y-8 px-4">
                        
                        {/* Title */}
                        <div className="space-y-2">
                            <p className="text-3xl text-emerald-500 font-medium tracking-[0.2em] uppercase">SHALAT SEDANG BERLANGSUNG</p>
                            <h1 className="text-8xl font-bold text-white drop-shadow-2xl tracking-tight">
                                {prayerState.prayerName.toUpperCase()}
                            </h1>
                        </div>

                        {/* Divider */}
                        <div className="w-32 h-1 bg-emerald-600 rounded-full mx-auto opacity-80" />

                        {/* Main Message */}
                        <div className="space-y-6">
                            <p className="text-2xl text-slate-400 font-light tracking-wide mx-auto px-8 leading-relaxed">
                                Mohon <span className="text-emerald-400 font-normal">Nonaktifkan</span> Nada Dering Handphone
                            </p>
                        </div>

                    </div>
                </div>
            );
        }

        // Mode: Normal Slides
        return <SlideRenderer currentSlide={slides[slideIndex] || null} ramadanConfig={ramadanConfig} />;
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-950 text-white font-sans select-none relative flex flex-col cursor-none">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />
            
            {/* Header */}
            {prayerState.mode === 'normal' && <DisplayHeader profile={profile} currentTime={now} />}
            
            {/* Main */}
            <main className={`relative z-10 flex-1 flex flex-col items-center justify-center w-full overflow-hidden transition-all duration-500 
                ${prayerState.mode === 'normal' ? 'px-6 py-8 md:px-8 md:py-6' : 'p-0 w-screen h-screen'}`}
            >
                {renderContent()}
            </main>
            
            {/* Footer */}
            {prayerState.mode === 'normal' && <DisplayFooter runningText={config.runningText as string} prayerTimes={prayerTimes} nextPrayer={nextPrayer} />}
        </div>
    );
};