import { memo } from 'react';
import { Quote } from 'lucide-react';
import type { HaditsWidgetProps } from '../../types';

export const HaditsWidget = memo(({ data }: HaditsWidgetProps) => 
{
    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10 bg-white/5 backdrop-blur-2xl p-24 overflow-hidden rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <Quote className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] text-white/5 -scale-x-100" />
            
            <div className="z-10 w-full max-w-full flex flex-col items-center justify-center space-y-12">
                {data.arabic && (
                    <h1 className="text-[5.7rem] text-white font-serif leading-[1.6] drop-shadow-2xl text-center mb-6" dir="rtl">
                        {data.arabic}
                    </h1>
                )}
                
                <div className="text-center flex flex-col items-center w-full px-10">
                    <p className="font-bold text-slate-200 leading-tight italic mb-12 drop-shadow-md" style={{ fontSize: `calc(2.9rem * var(--scale-label, 1))` }}>
                        "{data.text}"
                    </p>
                    
                    <div className="inline-block text-primary font-black uppercase tracking-[0.3em] border-2 border-primary/60 px-16 py-6 rounded-[2.5rem] bg-primary/10 shadow-lg" style={{ fontSize: `calc(2.2rem * var(--scale-label, 1))` }}>
                        {data.source}
                    </div>
                </div>
            </div>
        </div>
    );
});
