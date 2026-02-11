
import { memo } from 'react';
import { Moon, Sparkles, Quote, HandHeart } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import type 
{ 
    RamadanScheduleUI, 
    TarawihWidgetProps, 
    PosterWidgetProps, 
    HaditsWidgetProps 
} from '../types';
import type { RamadanConfig } from '../../ramadan/types';

const BigStatusBadge = memo(({ status, qty, active }: { status: string, qty: number, active: boolean }) => 
{
    return (
        <div className={`w-full h-full flex flex-col items-center justify-center rounded-xl border-2 relative overflow-hidden transition-all ${
            active 
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-inner' 
                : 'bg-emerald-950/30 text-emerald-600 border-emerald-800/30'
        }`}>
            {active && <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent" />}
            
            <span className={`font-mono font-black leading-none z-10 tracking-tighter ${active ? 'text-5xl drop-shadow-md' : 'text-4xl opacity-80'}`}>
                {qty || 0}
            </span>
            
            <span className={`text-[12px] font-black uppercase z-10 tracking-widest mt-0.5 ${active ? 'text-emerald-100' : 'text-emerald-800'}`}>
                {status === 'close' ? 'TERPENUHI' : 'TERKUMPUL'}
            </span>
        </div>
    );
});

const RamadanRow = memo(({ row }: { row: RamadanScheduleUI }) => 
{
    const isToday = isSameDay(parseISO(row.date), new Date());
    
    return (
        <div className={`relative grid grid-cols-12 gap-3 flex-1 items-center px-2 rounded-2xl border-2 transition-all duration-500 ${
            isToday 
                ? 'bg-linear-to-r from-emerald-900/80 to-slate-800 border-emerald-400 shadow-[0_0_25px_-5px_rgba(52,211,153,0.3)] z-10 scale-[1.01]' 
                : 'bg-slate-900/40 border-slate-800 opacity-70'
        }`}>
            {isToday && <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-emerald-400 rounded-r-full shadow-[0_0_15px_#34d399]" />}

            {/* DATE */}
            <div className="col-span-2 flex flex-col items-center justify-center border-r-2 border-white/5 h-full py-1">
                <span className={`font-mono font-black leading-none tracking-tighter ${isToday ? 'text-6xl text-white drop-shadow-xl' : 'text-5xl text-slate-500'}`}>
                    {row.ramadanDay}
                </span>
                <span className={`uppercase font-black text-[10px] mt-0.5 tracking-widest ${isToday ? 'text-emerald-300' : 'text-slate-600'}`}>
                    {format(parseISO(row.date), 'dd MMM', { locale: id })}
                </span>
            </div>

            {/* TAKJIL */}
            <div className="col-span-3 h-full py-1">
                <BigStatusBadge status={row.iftarSnackStatus} qty={row.iftarSnackQty} active={isToday} />
            </div>

            {/* IFTHOR */}
            <div className="col-span-3 h-full py-1">
                <BigStatusBadge status={row.iftarMealStatus} qty={row.iftarMealQty} active={isToday} />
            </div>

            {/* AIR MINERAL */}
            <div className="col-span-2 h-full flex flex-col items-center justify-center border-x-2 border-white/5 bg-black/20">
                <span className={`font-mono font-black block leading-none tracking-tighter ${isToday ? 'text-5xl text-cyan-300 drop-shadow-lg' : 'text-4xl text-slate-500'}`}>
                    {(row.waterTarawihQty + row.waterIftarQty + row.waterItikafQty) || 0}
                </span>
                <span className={`text-[12px] font-black uppercase tracking-widest mt-1 ${isToday ? 'text-cyan-600' : 'text-slate-700'}`}>DUS</span>
            </div>

            <div className="col-span-2 h-full flex flex-col justify-between py-1 pl-2 gap-1">
                {/* Itikaf */}
                <div className="flex-1 flex items-center justify-between bg-slate-800/60 rounded-lg px-2">
                    <span className="text-[12px] font-black text-slate-500 uppercase">ITIKAF</span>
                    <span className={`text-xl font-mono font-black ${row.itikafStatus === 'open' ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {row.itikafQty || 0}
                    </span>
                </div>
                {/* Santunan */}
                <div className="flex-1 flex items-center justify-between bg-slate-800/60 rounded-lg px-2">
                    <span className="text-[12px] font-black text-slate-500 uppercase">SANTUNAN</span>
                    <span className={`text-xl font-mono font-black ${row.charityStatus === 'open' ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {row.charityQty || 0}
                    </span>
                </div>
            </div>
        </div>
    );
});

export const RamadanTableWidget = memo(({ schedules, config }: { schedules: RamadanScheduleUI[], config?: RamadanConfig }) => (
    <div className="w-full h-full flex flex-col px-4 pt-2 pb-1 overflow-hidden font-sans bg-slate-950/40 rounded-3xl border border-white/5 backdrop-blur-sm">
        {/* HEADER */}
        <div className="min-h-[50px] flex items-center justify-between mb-2 px-6 bg-slate-900/80 rounded-2xl border border-emerald-500/20 shadow-lg shrink-0">
            <div className="flex items-center gap-3 py-3">
                <div className="p-2 bg-emerald-600/20 rounded-xl text-emerald-400 border border-emerald-500/30">
                    <HandHeart className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none mt-1">{ config?.title }</h2>
                    <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase">{ config?.subtitle }</span>
                </div>
            </div>
        </div>

        {/* TABLE HEADER */}
        <div className="h-[5%] min-h-[25px] grid grid-cols-12 gap-2 px-6 items-center text-xs font-black uppercase tracking-widest text-slate-400 shrink-0">
            <div className="col-span-2 text-center border-b-2 border-slate-800 pb-0.5">Tanggal</div>
            <div className="col-span-3 text-center border-b-2 border-slate-800 pb-0.5">Takjil</div>
            <div className="col-span-3 text-center border-b-2 border-slate-800 pb-0.5">Ifthor</div>
            <div className="col-span-2 text-center border-b-2 border-slate-800 pb-0.5">Air</div>
            <div className="col-span-2 text-center border-b-2 border-slate-800 pb-0.5">Lainnya</div>
        </div>

        {/* BODY ROWS */}
        <div className="flex-1 flex flex-col gap-2 min-h-0 pt-1 pb-1">
            {schedules.map((row) => (
                <RamadanRow key={row.id || row.date} row={row} />
            ))}
        </div>
    </div>
));

export const TarawihWidget = memo(({ data, hijriYear, title = "Tarawih" }: TarawihWidgetProps) => (
    <div className="flex items-center justify-center w-full h-full animate-in zoom-in duration-700 p-8">
        <div className="relative w-full max-w-6xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[50vh]">
            <div className="w-full md:w-1/3 bg-linear-to-br from-emerald-600 to-emerald-900 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
                <div className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm shadow-lg">
                    <Moon className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white uppercase tracking-widest mb-3">{title}</h2>
                <span className="px-5 py-2 bg-black/20 rounded-full text-emerald-100 text-lg font-mono border border-white/10">
                    {hijriYear} Hijriah
                </span>
            </div>
            <div className="w-full md:w-2/3 p-12 flex flex-col justify-center items-start">
                <div className="flex items-center gap-4 mb-6">
                    <span className="px-4 py-1.5 rounded bg-emerald-500/10 text-emerald-400 text-sm font-bold uppercase tracking-wider border border-emerald-500/20">Malam Ini</span>
                    <span className="text-slate-400 text-lg">Ramadhan Ke-{data.ramadanDay}</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 font-serif">
                    {data.tarawihImam?.name || data.imam?.name || "Belum Ditentukan"}
                </h1>
                {data.description && (
                    <div className="flex items-start gap-4 bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 w-full">
                        <Sparkles className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                        <p className="text-amber-200 text-xl leading-relaxed">{data.description}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
));

export const PosterWidget = memo(({ data }: PosterWidgetProps) => (
    <div className="w-full h-full flex items-center justify-center relative animate-in fade-in zoom-in duration-700 overflow-hidden">
        {data.imageUrl && (
            <>
                <div className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-60 scale-150 z-0" style={{ backgroundImage: `url(${data.imageUrl})` }} />
                <div className="relative z-10 w-full h-full flex items-center justify-center p-10">
                    <img src={data.imageUrl} alt={data.title || "Poster"} className="max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl border-4 border-white/10" />
                </div>
            </>
        )}
    </div>
));

export const HaditsWidget = memo(({ data }: HaditsWidgetProps) => (
    <div className="flex items-center justify-center w-full h-full animate-in slide-in-from-bottom-8 duration-1000 p-6">
        <div className="max-w-5xl text-center relative z-10 bg-slate-950/50 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 shadow-2xl">
            <Quote className="w-20 h-20 text-emerald-500/30 mx-auto mb-6" />
            {data.arabic && <h1 className="text-4xl lg:text-6xl text-white font-serif leading-loose mb-8 drop-shadow-lg" dir="rtl">{data.arabic}</h1>}
            <p className="text-2xl lg:text-4xl text-slate-200 font-light leading-relaxed italic mb-10 max-w-4xl mx-auto">"{data.text}"</p>
            <div className="inline-block border-t border-emerald-500/50 pt-6 px-10">
                <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xl">{data.source}</p>
            </div>
        </div>
    </div>
));
