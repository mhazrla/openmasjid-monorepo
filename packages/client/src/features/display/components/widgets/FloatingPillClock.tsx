import { memo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getImageUrl } from '../../../../lib/utils';

export const FloatingPillClock = memo(({ now, hijriDate, profile, isVisible = true }: { now: Date, hijriDate?: string, profile: any, isVisible?: boolean }) => 
{
    return (
        <div 
            className={`absolute top-6 left-1/2 z-[100] flex items-center justify-center min-w-[120rem] px-12 py-6 rounded-full bg-black/50 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-white/5 transition-all duration-1000 ease-in-out origin-top ${
                isVisible 
                    ? 'opacity-100 translate-y-0 -translate-x-1/2 scale-100' 
                    : 'opacity-0 -translate-y-20 -translate-x-1/2 scale-90 pointer-events-none'
            }`}
        >
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex items-center gap-8 mr-12 pr-12 border-r border-white/20 min-w-[550px]">
                <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center p-3 border border-white/20 shadow-inner shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    {profile?.logoUrl ? (
                        <img src={getImageUrl(profile.logoUrl)} alt="Logo" className="w-full h-full object-contain relative z-10" />
                    ) : (
                        <img src="/images/logo1.webp" alt="Logo" className="w-full h-full object-contain relative z-10" />
                    )}
                </div>
                
                <div className="flex flex-col justify-center overflow-hidden">
                    <h1 className="text-[2.6rem] font-black text-white leading-none tracking-tight uppercase drop-shadow-md whitespace-nowrap">
                        {profile?.name || "NAMA MASJID"}
                    </h1>
                </div>
            </div>

            <div className="relative z-10 flex items-baseline font-extrabold text-primary mr-12 tracking-wide drop-shadow-lg leading-none shrink-0" style={{ fontSize: 'calc(6rem * var(--scale-clock, 1))' }}>
                {format(now, 'HH:mm')}
                <span className="ml-2 text-primary/80 animate-pulse" style={{ fontSize: 'calc(3.5rem * var(--scale-clock, 1))' }}>:{format(now, 'ss')}</span>
            </div>
            
            <div className="relative z-10 flex flex-col justify-center font-medium tracking-wide gap-2 border-l border-white/20 pl-12 shrink-0" style={{ color: 'var(--theme-label)' }}>
                <span className="drop-shadow-md leading-none whitespace-nowrap font-bold" style={{ fontSize: 'calc(2rem * var(--scale-label, 1))' }}>
                    {format(now, 'EEEE, dd MMM yyyy', { locale: id })}
                </span>
                <span className="font-black drop-shadow-md leading-none uppercase tracking-widest text-amber-400" style={{ fontSize: 'calc(2rem * var(--scale-label, 1))' }}>
                    {hijriDate || 'H'}
                </span>
            </div>
        </div>
    );
});
