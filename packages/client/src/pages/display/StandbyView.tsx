import { useState, useEffect, useMemo } from 'react';
import { useMosqueProfile } from '../../features/mosque/hooks';
import { useDisplayConfig } from '../../features/display-config/hooks';
import { usePrayerTime } from '../../features/prayer/hooks';
import { useActiveRamadan } from '../../features/ramadan/hooks';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

// Import Komponen
import { DisplayHeader } from '../../features/display/components/DisplayHeader';
import { DisplayFooter } from '../../features/display/components/DisplayFooter';
import { TarawihWidget, PosterWidget, HaditsWidget } from '../../features/display/components/ContentWidgets';

// Import Helpers
import { DUMMY_KAJIAN, DUMMY_POSTERS, DUMMY_HADITS, getNextPrayer } from '../../features/display/utils/display-helpers';

export const StandbyView = () => {
    // 1. Hooks Data
    const { data: profile } = useMosqueProfile();
    const { data: config } = useDisplayConfig();
    const { data: ramadanConfig } = useActiveRamadan();
    
    // 2. State & Timer
    const [now, setNow] = useState(new Date());
    const [slideIndex, setSlideIndex] = useState(0);

    // Fix Bug Jam: Update setiap 1 detik
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 3. Logic Data
    const todayStr = format(now, 'yyyy-MM-dd');
    const { data: prayerTimes } = usePrayerTime(todayStr);
    const nextPrayer = useMemo(() => getNextPrayer(prayerTimes, now), [prayerTimes, now]);

    const todaysTarawih = useMemo(() => {
        if (!ramadanConfig?.isActive || !ramadanConfig.schedules) return null;
        return ramadanConfig.schedules.find(s => s.date.startsWith(todayStr));
    }, [ramadanConfig, todayStr]);

    // 4. Slider Management
    const slides = useMemo(() => {
        const items: any[] = [];
        if (todaysTarawih) items.push({ type: 'tarawih', data: todaysTarawih });
        DUMMY_POSTERS.forEach(p => items.push({ type: 'poster', data: p }));
        DUMMY_KAJIAN.forEach(k => items.push({ type: 'kajian', data: k }));
        DUMMY_HADITS.forEach(h => items.push({ type: 'hadits', data: h }));
        return items;
    }, [todaysTarawih]);

    useEffect(() => {
        if (slides.length <= 1) return;
        const duration = slides[slideIndex]?.type === 'poster' ? 15000 : 10000;
        const interval = setInterval(() => {
            setSlideIndex((prev) => (prev + 1) % slides.length);
        }, duration);
        return () => clearInterval(interval);
    }, [slides.length, slideIndex]);

    const currentSlide = slides[slideIndex] || null;

    if (!profile || !config) return <Loader2 className="w-10 h-10 animate-spin text-emerald-500 m-auto" />;

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-950 text-white font-sans select-none relative flex flex-col">
            
            {/* Global Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0" />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />

            {/* Header */}
            <DisplayHeader profile={profile} currentTime={now} />

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-4 overflow-hidden">
                {currentSlide && (
                    <div key={slideIndex} className="w-full h-full max-w-[1920px] mx-auto flex items-center justify-center">
                        {currentSlide.type === 'tarawih' && <TarawihWidget data={currentSlide.data} hijriYear={ramadanConfig?.hijriYear} />}
                        
                        {currentSlide.type === 'poster' && <PosterWidget data={currentSlide.data} />}
                        
                        {currentSlide.type === 'hadits' && <HaditsWidget data={currentSlide.data} />}
                        
                        {/* Reuse Tarawih Widget for Kajian text */}
                        {currentSlide.type === 'kajian' && (
                            <TarawihWidget 
                                data={{
                                    ...currentSlide.data, 
                                    description: currentSlide.data.topic, 
                                    imam: { name: currentSlide.data.ustadz },
                                    ramadanDay: 'Info'
                                }} 
                                hijriYear={ramadanConfig?.hijriYear} 
                            />
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <DisplayFooter 
                runningText={config.runningText || "Selamat Datang di Masjid Kami"} 
                prayerTimes={prayerTimes} 
                nextPrayer={nextPrayer} 
            />
        </div>
    );
};