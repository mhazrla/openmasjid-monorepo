import { memo } from 'react';
import { Moon } from 'lucide-react';
import type { TarawihWidgetProps } from '../../types';

export const TarawihWidget = memo(({ data, hijriYear, title = "Tarawih" }: TarawihWidgetProps) => (
    <div className="w-full h-full flex flex-row bg-[#121914] rounded-[3rem] overflow-hidden shadow-xl border border-white/5">
        <div className="w-1/3 p-16 flex flex-col items-center justify-center text-center relative bg-primary">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay"></div>
            <Moon className="w-32 h-32 text-black drop-shadow-md mb-8" />
            <h2 className="text-[3.5rem] font-black text-black uppercase tracking-widest mb-4">{title}</h2>
            <span className="px-6 py-2 bg-black/20 text-black text-2xl font-bold uppercase tracking-widest border border-black/30 mt-4">
                {hijriYear || "1447"} Hijriah
            </span>
        </div>

        <div className="w-2/3 p-24 flex flex-col justify-center items-start bg-[#0d120e]">
            <div className="flex items-center gap-6 mb-10">
                <span className="px-6 py-2 bg-primary/20 text-primary text-2xl font-bold uppercase tracking-widest border border-primary/30">Malam Ini</span>
                <span className="text-slate-300 text-3xl font-medium tracking-wide">Ramadhan Ke-{data.ramadanDay}</span>
            </div>

            <h1 className="text-[5.5rem] font-black text-white leading-tight mb-16 font-serif">
                {data.tarawihImam?.name || "Belum Ditentukan"}
            </h1>

            <div className="bg-[#161f18] p-10 border border-white/5 w-full rounded-2xl">
                <span className="font-bold text-primary uppercase tracking-[0.3em] mb-4 block" style={{ fontSize: `calc(2rem * var(--scale-label, 1))` }}>Badal Imam</span>
                <h3 className="text-[3.5rem] font-extrabold text-white leading-tight">
                    {typeof data.badalImam === 'string' 
                        ? data.badalImam 
                        : "Belum Ditentukan"}
                </h3>
            </div>
        </div>
    </div>
));
