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
        <div className="w-full h-full bg-white/5 backdrop-blur-2xl flex flex-row overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in duration-1000 rounded-[3rem] border border-white/10">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-primary/10"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full" />
            </div>
            <div className="flex-[2] p-16 flex flex-col items-center justify-center relative z-10 border-r border-white/10">
                <div className="flex flex-col items-center justify-center h-full w-full">
                <p className="font-bold text-slate-300 tracking-[0.4em] uppercase mb-4 drop-shadow-md" style={{ fontSize: 'calc(2.5rem * var(--scale-label, 1))' }}>Menuju Waktu Shalat</p>
                <h1 className="font-black tracking-tighter mb-6 text-white drop-shadow-lg leading-none uppercase" style={{ fontSize: 'calc(9rem * var(--scale-label, 1))' }}>{prayerState.prayerName || 'Menunggu'}</h1>
                <div className="flex items-center space-x-3 text-2xl bg-black/40 px-8 py-4 rounded-full border border-white/5 backdrop-blur-sm" style={{ color: 'var(--theme-label)' }}>
                    <Clock size={28} style={{ color: 'var(--theme-primary)' }} />
                    <span>Begins in</span>
                </div>
            </div>
            </div>
            <div className="flex-1 p-16 flex flex-col justify-center bg-white/5 relative z-10">
                <div className="flex justify-between items-center mb-12">
                    <span className="font-medium text-2xl" style={{ color: 'var(--theme-label)' }}>Countdown</span>
                    <span className="text-lg px-6 py-2 rounded-full font-bold border uppercase tracking-widest" style={{ color: 'var(--theme-primary)', backgroundColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)', borderColor: 'color-mix(in srgb, var(--theme-primary) 20%, transparent)', fontSize: 'calc(1.125rem * var(--scale-label, 1))' }}>Menuju Waktu</span>
                </div>
                <div className="flex space-x-6 mb-12">
                    <div className="flex flex-col items-center w-[160px]">
                        <div className="bg-white/5 rounded-3xl w-full aspect-square flex items-center justify-center font-black text-white shadow-inner font-mono border border-white/10" style={{ fontSize: 'calc(4rem * var(--scale-clock, 1))' }}>{hours.toString().padStart(2, '0')}</div>
                        <span className="mt-4 font-bold tracking-widest text-slate-400 uppercase" style={{ fontSize: 'calc(1.2rem * var(--scale-label, 1))' }}>Jam</span>
                    </div>
                    <span className="font-black text-slate-400 pb-10" style={{ fontSize: 'calc(4rem * var(--scale-clock, 1))' }}>:</span>
                    <div className="flex flex-col items-center w-[160px]">
                        <div className="bg-white/5 rounded-3xl w-full aspect-square flex items-center justify-center font-black text-white shadow-inner font-mono border border-white/10" style={{ fontSize: 'calc(4rem * var(--scale-clock, 1))' }}>{minutes.toString().padStart(2, '0')}</div>
                        <span className="mt-4 font-bold tracking-widest text-slate-400 uppercase" style={{ fontSize: 'calc(1.2rem * var(--scale-label, 1))' }}>Menit</span>
                    </div>
                    <span className="font-black text-slate-400 pb-10" style={{ fontSize: 'calc(4rem * var(--scale-clock, 1))' }}>:</span>
                    <div className="flex flex-col items-center w-[160px]">
                        <div className="bg-white/5 rounded-3xl w-full aspect-square flex items-center justify-center font-black text-primary border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] font-mono" style={{ fontSize: 'calc(4rem * var(--scale-clock, 1))' }}>{seconds.toString().padStart(2, '0')}</div>
                        <span className="mt-4 text-primary font-bold tracking-widest uppercase" style={{ fontSize: 'calc(1.2rem * var(--scale-label, 1))' }}>Detik</span>
                    </div>
                </div>
            </div>
        </div>
    );
});
