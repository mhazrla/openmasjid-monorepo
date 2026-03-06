import React, { useState, useEffect, memo, useRef } from 'react';
import { differenceInSeconds } from 'date-fns';
import type { PrayerCountdownWidgetProps } from '../../types';

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

  const [minutes, seconds] = timeLeft.split(':');

  return (
    <div className="flex flex-col items-center justify-center w-full z-10 animate-in fade-in zoom-in duration-700">
      
      <h2 className="font-bold text-slate-300 tracking-[0.2em] uppercase mb-12 drop-shadow-md text-center" style={{ fontSize: 'calc(4rem * var(--scale-label, 1))' }}>
        {mode === 'pre_adzan' ? `Menuju Waktu ${prayerName}` : 'Menuju Iqomah'}
      </h2>

      <div className="flex items-center justify-center gap-6 mb-14">
        
        <div className="w-56 h-56 bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] flex items-center justify-center ring-1 ring-inset ring-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
            <span className="font-mono font-black text-white drop-shadow-lg relative z-10" style={{ fontSize: 'calc(7rem * var(--scale-clock, 1))' }}>
                {minutes}
            </span>
        </div>
        
        <span className="font-black text-primary/80 animate-pulse pb-4 drop-shadow-[0_0_15px_var(--theme-primary)]" style={{ fontSize: 'calc(6rem * var(--scale-clock, 1))' }}>
            :
        </span>
        
        <div className="w-56 h-56 bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] flex items-center justify-center ring-1 ring-inset ring-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/40 blur-[40px] rounded-full pointer-events-none" />
            
            <span className="font-mono font-black text-primary drop-shadow-[0_0_20px_var(--theme-primary)] relative z-10" style={{ fontSize: 'calc(7rem * var(--scale-clock, 1))' }}>
                {seconds}
            </span>
        </div>
      </div>

      {/* Subtext Bawah */}
      <p className="text-primary font-medium tracking-[0.2em] uppercase drop-shadow-md" style={{ fontSize: 'calc(4rem * var(--scale-label, 1))' }}>
        {mode === 'pre_adzan' ? "Persiapkan Diri Anda" : "Luruskan dan Rapatkan Shaf"}
      </p>
      
    </div>
  );
};

export default memo(PrayerCountdownWidget);