import { memo } from 'react';
import { HandHeart } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

const AuctionBadge = memo(({ target, current, isItikafDay }: { target: number, current: number, isItikafDay?: boolean }) => {
    if (isItikafDay === false) {
        return <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold text-[6rem] bg-black/20 border border-white/5 rounded-[3rem]">-</div>;
    }

    const shortage = target - current;
    const isOpen = current < target; 

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center p-4 border-4 rounded-[3rem] transition-all relative overflow-hidden ${
            isOpen ? 'bg-[#0d160f] border-primary/50 text-white' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-600'
        }`}>
            <div className="flex flex-col items-center z-10 w-full gap-2">
                <span 
                    className="font-black tracking-[0.3em] uppercase mb-2"
                    style={{ fontSize: 'calc(2.2rem * var(--scale-label, 1))', color: isOpen ? 'var(--theme-accent)' : 'var(--theme-primary)' }}
                >
                    {isOpen ? '❌ OPEN' : '✅ TERPENUHI'}
                </span>
                
                <div className="font-mono text-[5.5rem] font-black leading-none mb-4 text-white">
                    {current} <span className="text-[2.8rem]" style={{ color: 'var(--theme-label)' }}>/ {target}</span>
                </div>
                
                {isOpen && (
                    <div 
                        className="bg-rose-600 border-2 border-rose-400 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-tighter animate-pulse shadow-lg shadow-rose-900/50"
                        style={{ fontSize: `calc(2.8rem * var(--scale-label, 1))` }}
                    >
                        KURANG: {shortage}
                    </div>
                )}
            </div>
        </div>
    );
});

const RamadanRow = memo(({ row, effectiveDate }: { row: any, effectiveDate: Date }) => {
    const isToday = isSameDay(parseISO(row.date), effectiveDate);
    const isLast10Days = row.ramadanDay >= 21; 
    
    return (
        <div className={`relative grid grid-cols-12 gap-8 flex-1 items-center px-10 py-4 border-4 transition-all duration-500 rounded-[4rem] ${
            isToday ? 'bg-[#0d160f] border-primary shadow-[0_0_30px_rgba(16,185,129,0.2)] z-10 scale-[1.02]' : 'bg-[#0d120e] border-white/5'
        }`}>
            <div className="col-span-2 flex flex-col items-center justify-center h-full border-r-2 border-white/10 pr-4">
                <span className={`font-mono font-black leading-none ${isToday ? 'text-[8rem] text-white' : 'text-[7rem] text-slate-500'}`}>
                    {row.ramadanDay}
                </span>
                <span 
                    className={`uppercase font-black mt-2 tracking-tighter ${isToday ? 'text-primary' : 'text-slate-600'}`}
                    style={{ fontSize: `calc(2.2rem * var(--scale-label, 1))` }}
                >
                    {format(parseISO(row.date), 'dd MMM', { locale: id })}
                </span>
            </div>

            <div className="col-span-5 h-full py-2">
                <AuctionBadge target={row.iftarTarget || 0} current={row.iftarCurrent || 0} />
            </div>

            <div className="col-span-5 h-full py-2">
                <AuctionBadge target={row.itikafTarget || 0} current={row.itikafCurrent || 0} isItikafDay={isLast10Days} />
            </div>
        </div>
    );
});

export const RamadanTableWidget = memo(({ schedules, config, effectiveDate }: { schedules: any[], config?: any, effectiveDate: Date }) => {
    const displayedSchedules = schedules.slice(0, 2);

    return (
        <div className="w-full h-full flex flex-col p-12 bg-black/40 backdrop-blur-2xl rounded-[4rem] border border-white/10 overflow-hidden relative">
            <div className="flex items-center gap-10 mb-8 shrink-0 relative z-10">
                <div className="p-5 bg-white/5 border-2 border-white/10 text-primary rounded-3xl shadow-xl">
                    <HandHeart className="w-16 h-16" />
                </div>
                <div className="flex flex-col">
                    <h2 className="text-[3.5rem] font-black text-white tracking-widest uppercase leading-none mb-2">
                        {config?.title || "PROGRAM RAMADHAN"}
                    </h2>
                    <span 
                        className="text-primary font-bold tracking-[0.5em] uppercase"
                        style={{ fontSize: `calc(2rem * var(--scale-label, 1))` }}
                    >
                        LAPORAN KEBUTUHAN IFTHOR & SAHUR
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 px-12 items-center font-black uppercase tracking-[0.4em] mb-6 shrink-0 border-b-2 border-white/10 pb-8 relative z-10" style={{ color: 'var(--theme-label)' }}>
                <div className="col-span-2 text-center" style={{ fontSize: `calc(2rem * var(--scale-label, 1))` }}>MALAM</div>
                <div className="col-span-5 text-center" style={{ fontSize: `calc(2rem * var(--scale-label, 1))` }}>PAKET BUKA PUASA</div>
                <div className="col-span-5 text-center" style={{ fontSize: `calc(2rem * var(--scale-label, 1))` }}>SAHUR I'TIKAF</div>
            </div>

            <div className="flex-1 flex flex-col gap-8 min-h-0 overflow-hidden w-full relative z-10">
                {displayedSchedules.map((row) => (
                    <RamadanRow key={row.id || row.date} row={row} effectiveDate={effectiveDate} />
                ))}
            </div>
        </div>
    );
});
