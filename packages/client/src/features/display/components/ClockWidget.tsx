import { useState, useEffect, memo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Helper: Get Hijri Date
const formatHijri = (date: Date) => 
{
    try 
    {
        return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', 
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date) + ' H';
    } 
    catch (e) 
    {
        return new Intl.DateTimeFormat('id-ID-u-ca-islamic', 
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date) + ' H';
    }
};

export const ClockWidget = memo(() => 
{
    const [time, setTime] = useState(new Date());

    useEffect(() => 
    {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-10 border border-white/5 shadow-2xl text-center lg:text-left w-full relative overflow-hidden group">
            
            {/* Background Blur Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -z-10"></div>

            <div className="text-center lg:text-left w-full pl-4">
                {/* Time */}
                <div className="text-[7rem] xl:text-[8.5rem] leading-none font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 drop-shadow-2xl font-mono">
                    {format(time, 'HH:mm')}
                    <span className="text-4xl xl:text-5xl text-emerald-500/80 font-medium ml-2">{format(time, 'ss')}</span>
                </div>
                
                {/* Date */}
                <div className="mt-4 space-y-2">
                    <p className="text-3xl xl:text-4xl font-semibold text-white tracking-wide drop-shadow-lg">
                        {format(time, 'EEEE, d MMMM yyyy', { locale: id })}
                    </p>
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                        <span className="inline-block px-4 py-1.5 bg-emerald-900/50 border border-emerald-500/30 rounded-full text-emerald-300 text-lg xl:text-xl font-medium backdrop-blur-sm">
                            {formatHijri(time)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});
