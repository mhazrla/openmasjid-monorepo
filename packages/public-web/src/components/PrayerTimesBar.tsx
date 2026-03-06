import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';

let baseURL = '/api/';
if (import.meta.env.PROD && import.meta.env.VITE_API_URL) 
{
    const apiUrl = import.meta.env.VITE_API_URL as string;
    baseURL = apiUrl.endsWith('/api/') ? apiUrl : apiUrl.replace(/\/$/, '') + '/api/';
}

const fetchPrayerTimes = async () => 
{
    const response = await fetch(`${baseURL}prayer-times`);
    if (!response.ok) throw new Error('Gagal mengambil data jadwal shalat dari server');
    const { data } = await response.json();
    return data;
};

const fetchDisplayConfig = async () => 
{
    const response = await fetch(`${baseURL}display-config`);
    if (!response.ok) throw new Error('Gagal mengambil data konfigurasi dari server');
    const { data } = await response.json();
    return data;
};

export const PrayerTimesBar = () => 
{
    const { data: timings, isLoading, isError } = useQuery({
        queryKey: ['prayerTimes', 'internal'],
        queryFn: fetchPrayerTimes,
        staleTime: 1000 * 60 * 60 * 6,
    });

    const { data: config } = useQuery({
        queryKey: ['displayConfig', 'internal'],
        queryFn: fetchDisplayConfig,
        staleTime: 1000 * 60 * 60 * 6,
    });

    const times = [
        { name: 'Subuh', time: timings?.subuh || '--:--' },
        { name: 'Dzuhur', time: timings?.dzuhur || '--:--' },
        { name: 'Ashar', time: timings?.ashar || '--:--' },
        { name: 'Maghrib', time: timings?.maghrib || '--:--' },
        { name: 'Isya', time: timings?.isya || '--:--' },
    ];

    return (
        <div className="bg-white shadow-xl rounded-2xl p-4 md:p-6 mx-4 sm:mx-8 lg:mx-auto max-w-5xl -mt-16 sm:-mt-24 relative z-10 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-emerald-700">
                <div className="bg-emerald-100 p-3 rounded-full">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold leading-none">Jadwal Shalat</h3>
                    <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">{config?.cachedHijriDate || 'Memuat tanggal...'}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 sm:gap-6 w-full md:w-auto text-center divide-x divide-slate-100">
                {times.map((prayer) => (
                    <div key={prayer.name} className="px-1 sm:px-4 flex flex-col items-center justify-center">
                        <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">{prayer.name}</p>
                        {isLoading ? (
                            <div className="h-6 sm:h-8 w-12 sm:w-16 bg-slate-200 animate-pulse rounded mt-1 sm:mt-2"></div>
                        ) : isError ? (
                            <p className="text-sm font-bold text-red-500 mt-1">Error</p>
                        ) : (
                            <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">{prayer.time}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
