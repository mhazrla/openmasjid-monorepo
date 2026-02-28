import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { differenceInSeconds } from 'date-fns';
import type { PrayerCountdownWidgetProps } from '../types';

const PrayerCountdownWidget: React.FC<PrayerCountdownWidgetProps> = ({ 
  targetTime, 
  prayerName, 
  mode,
  beepReminderDuration,
  enableBeep
}) => 
{
  const [timeLeft, setTimeLeft] = useState<string>("00:00");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastBeepTimeRef = useRef<number | null>(null);

  // Initialize Audio
  useEffect(() => 
  {
    audioRef.current = new Audio('/sounds/beep.mp3');
    audioRef.current.volume = 1.0;
    audioRef.current.load();
  }, []);

  const formatTime = (totalSeconds: number) => 
  {
    if (totalSeconds < 0) return "00:00";
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;

    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => 
  {
    const calculate = () => 
    {
      const diff = differenceInSeconds(targetTime, new Date());
      setTimeLeft(formatTime(diff));

        if (enableBeep && audioRef.current) 
        {
            if (diff <= beepReminderDuration && diff > 0 && diff !== lastBeepTimeRef.current) 
            {
                const isEvenSecond = diff % 2 === 0;

                if (isEvenSecond) 
                {
                    lastBeepTimeRef.current = diff;
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(e => console.warn("Autoplay blocked", e));
                }
            }
        }
    };
    
    calculate();
    
    const timer = setInterval(calculate, 1000);

    return () => clearInterval(timer);
  }, [targetTime, beepReminderDuration, enableBeep]);

  const theme = useMemo(() => 
  {
    if (mode === 'pre_adzan') 
    {
      return {
        bgGradient: "from-amber-600 to-orange-800",
        pulseColor: "bg-amber-500/20",
        title: `Menuju Waktu ${prayerName}`,
        textColor: "text-amber-100"
      };
    } 
    else 
    {
      return {
        bgGradient: "from-primary to-primary",
        pulseColor: "bg-primary/20",
        title: "Menuju Iqomah",
        textColor: "text-white"
      };
    }
  }, [mode, prayerName]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-linear-to-br ${theme.bgGradient} opacity-90`} />
      
      {/* Animated Pulse Effect */}
      <div className={`absolute inset-0 ${theme.pulseColor} animate-pulse-slow`} />
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
        
        {/* Header Text */}
        <h2 className={`text-[3rem] md:text-[3.75rem] font-extrabold uppercase tracking-wider ${theme.textColor} drop-shadow-lg text-center`}>
          {theme.title}
        </h2>

        {/* Countdown Timer */}
        <div className="bg-black/30 backdrop-blur-md rounded-3xl px-16 py-8 border border-white/10 shadow-2xl">
          <span className="font-mono text-[8rem] md:text-[10rem] leading-none font-extrabold text-white tabular-nums tracking-tighter drop-shadow-2xl">
            {timeLeft}
          </span>
        </div>

        {/* Subtext */}
        <p className={`text-[1.5rem] md:text-[1.875rem] opacity-80 ${theme.textColor} font-bold tracking-widest uppercase`}>
            {mode === 'pre_adzan' ? "Persiapkan Diri Anda" : "Luruskan dan Rapatkan Shaf"}
        </p>
      </div>
    </div>
  );
};

export default memo(PrayerCountdownWidget);