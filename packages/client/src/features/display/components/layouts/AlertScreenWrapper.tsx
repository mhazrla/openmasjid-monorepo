import React, { memo } from 'react';
import { FloatingPillClock } from '../widgets';

export const AlertScreenWrapper = memo(({ now, config, profile, zIndex = "z-50", children }: { 
    now: Date, 
    config: any, 
    profile: any, 
    zIndex?: string, 
    children: React.ReactNode 
}) => (
        <div className={`absolute inset-0 ${zIndex} bg-[#0a0f0b] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700 overflow-hidden`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-900/30 blur-[150px] rounded-full pointer-events-none z-0" />
        <FloatingPillClock 
            now={now} 
            hijriDate={config?.cachedHijriDate as string | undefined} 
            profile={profile} 
            isVisible={true} 
        />
        <div className="relative z-10 flex flex-col items-center w-full">
            {children}
        </div>
    </div>
));
