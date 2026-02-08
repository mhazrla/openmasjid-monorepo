import { Moon, Sparkles, Quote } from 'lucide-react';

export const TarawihWidget = ({ data, hijriYear }: { data: any, hijriYear?: number }) => (
    <div className="flex items-center justify-center w-full h-full animate-in zoom-in duration-700 p-8">
        <div className="relative w-full max-w-6xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[50vh]">
            <div className="w-full md:w-1/3 bg-gradient-to-br from-emerald-600 to-emerald-900 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
                <div className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm shadow-lg">
                    <Moon className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white uppercase tracking-widest mb-3">Tarawih</h2>
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
                    {data.imam?.name || "Belum Ditentukan"}
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
);

export const PosterWidget = ({ data }: { data: any }) => (
    <div className="w-full h-full flex items-center justify-center relative animate-in fade-in zoom-in duration-700 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-60 scale-150 z-0" style={{ backgroundImage: `url(${data.imageUrl})` }} />
        <div className="relative z-10 w-full h-full flex items-center justify-center">
            <img src={data.imageUrl} alt={data.title} className="max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg" />
        </div>
    </div>
);

export const HaditsWidget = ({ data }: { data: any }) => (
    <div className="flex items-center justify-center w-full h-full animate-in slide-in-from-bottom-8 duration-1000 p-6">
        <div className="max-w-5xl text-center relative z-10 bg-slate-950/50 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 shadow-2xl">
            <Quote className="w-20 h-20 text-emerald-500/30 mx-auto mb-6" />
            {data.arabic && <h1 className="text-3xl lg:text-5xl text-white font-serif leading-loose mb-6 drop-shadow-lg" dir="rtl">{data.arabic}</h1>}
            <p className="text-xl lg:text-3xl text-slate-200 font-light leading-relaxed italic mb-8 max-w-4xl mx-auto">"{data.text}"</p>
            <div className="inline-block"><div className="h-1 w-20 bg-emerald-500 mx-auto mb-3 rounded-full"></div><p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-lg">{data.source}</p></div>
        </div>
    </div>
);