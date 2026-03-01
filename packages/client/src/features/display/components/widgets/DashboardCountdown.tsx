import { memo } from 'react';
import { differenceInSeconds } from 'date-fns';
import { Clock } from 'lucide-react';

export const DashboardCountdown = memo(({ prayerState, now }: { prayerState: any, now: Date }) => 
{
    const diff = prayerState.targetTime ? differenceInSeconds(prayerState.targetTime, now) : 0;
    const safeDiff = diff > 0 ? diff : 0;
    const hours = Math.floor(safeDiff / 3600);
    const minutes = Math.floor((safeDiff % 3600) / 60);
    const seconds = safeDiff % 60;

    return (
        <div className="w-full h-full bg-[#121914] flex flex-row overflow-hidden relative shadow-2xl animate-in fade-in duration-1000 rounded-[3rem] border border-white/5">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-primary/10"></div>
            </div>
            <div className="flex-[2] p-16 flex flex-col items-center justify-center relative z-10 border-r border-white/5">
                <span className="text-xl font-bold tracking-[0.4em] mb-6 uppercase" style={{ color: 'var(--theme-accent)', fontSize: 'calc(1.25rem * var(--scale-label, 1))' }}>Next Prayer</span>
                <h1 className="text-[9rem] font-black tracking-tighter mb-6 text-white drop-shadow-lg leading-none uppercase">{prayerState.prayerName || 'Menunggu'}</h1>
                <div className="flex items-center space-x-3 text-2xl bg-black/40 px-8 py-4 rounded-full border border-white/5 backdrop-blur-sm" style={{ color: 'var(--theme-label)' }}>
                    <Clock size={28} style={{ color: 'var(--theme-primary)' }} />
                    <span>Begins in</span>
                </div>
            </div>
            <div className="flex-1 p-16 flex flex-col justify-center bg-[#0d120e] relative z-10">
                <div className="flex justify-between items-center mb-12">
                    <span className="font-medium text-2xl" style={{ color: 'var(--theme-label)' }}>Countdown</span>
                    <span className="text-lg px-6 py-2 rounded-full font-bold border uppercase tracking-widest" style={{ color: 'var(--theme-primary)', backgroundColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)', borderColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)', fontSize: 'calc(1.125rem * var(--scale-label, 1))' }}>Menuju Waktu</span>
                </div>
                <div className="flex space-x-6 mb-12">
                    <div className="flex flex-col items-center flex-1">
                        <div className="bg-[#161f18] rounded-3xl w-full aspect-square flex items-center justify-center text-[4rem] font-black text-white shadow-inner font-mono border border-white/5">{hours.toString().padStart(2, '0')}</div>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                        <div className="bg-[#161f18] rounded-3xl w-full aspect-square flex items-center justify-center text-[4rem] font-black text-white shadow-inner font-mono border border-white/5">{minutes.toString().padStart(2, '0')}</div>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                        <div className="bg-[#161f18] rounded-3xl w-full aspect-square flex items-center justify-center text-[4rem] font-black text-primary border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] font-mono">{seconds.toString().padStart(2, '0')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
});
