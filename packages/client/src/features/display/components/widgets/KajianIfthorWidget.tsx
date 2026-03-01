import { memo } from 'react';
import { Sunset } from 'lucide-react';

export const KajianIfthorWidget = memo(({ data }: any) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-16 relative overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[3rem]">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center px-10">
            <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-4 bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-3 rounded-full shadow-lg border border-orange-400/50">
                    <Sunset className="w-8 h-8 text-white drop-shadow-md" />
                    <span className="text-white text-[1.75rem] font-bold uppercase tracking-widest drop-shadow-md">Kajian Ifthor</span>
                </div>
                <span className="px-8 py-3 bg-white/5 border border-white/10 text-[1.75rem] font-bold uppercase tracking-widest rounded-full backdrop-blur-md" style={{ color: 'var(--theme-accent)' }}>Ramadhan Ke-{data.ramadanDay}</span>
            </div>
            <span className="font-bold uppercase tracking-[0.4em] mb-3" style={{ fontSize: 'calc(2rem * var(--scale-label, 1))', color: 'var(--theme-accent)' }}>Pemateri</span>
            <h1 className="text-[5rem] font-black text-white leading-tight mb-10 font-serif drop-shadow-lg">{typeof data.iftarSpeaker === 'string' ? data.iftarSpeaker : data.iftarSpeaker?.name || "Belum Ditentukan"}</h1>
            <div className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-10 backdrop-blur-md relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
                <span className="font-bold uppercase tracking-[0.3em] mb-4 block relative z-10" style={{ fontSize: 'calc(2rem * var(--scale-label, 1))', color: 'var(--theme-accent)' }}>Tema Kajian</span>
                <h3 className="text-[3.2rem] font-extrabold text-white leading-tight relative z-10 drop-shadow-sm">{data.iftarKajianTitle || "Kajian Menjelang Berbuka Puasa"}</h3>
            </div>
        </div>
    </div>
));
