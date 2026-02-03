import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { usePrayerTime, useSyncPrayerTimes } from '../../features/prayer/hooks';
import type { SyncPrayerRequest } from '../../features/prayer/types';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { Calendar, CloudDownload, Loader2, Search, MapPin, LocateFixed } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { type City, CITIES, MONTHS, DEFAULT_CITY_ID, DATE_FORMAT_API } from '../../constants/prayer';
import { calculateDistance } from '../../lib/geo';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useQueryClient } from '@tanstack/react-query';

const CITY_OPTIONS = CITIES.map(c => ({ value: c.id, label: c.name }));
const MONTH_OPTIONS = MONTHS.map((m, idx) => ({ value: idx + 1, label: m }));

const BUTTON_PRIMARY = "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm";
const BUTTON_SECONDARY = "flex items-center justify-center gap-2 px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 focus:outline-none transition-colors";

function getCityNameById(id: string): string {
    return CITIES.find(c => c.id === id)?.name || 'Unknown City';
}

export const PrayerTimePage = () => 
{
    const currentYear = new Date().getFullYear();
    const queryClient = useQueryClient();

    // --- State: Sync Form ---
    const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<SyncPrayerRequest>({
        defaultValues: 
        {
            cityId: DEFAULT_CITY_ID,
            month: new Date().getMonth() + 1,
            year: currentYear,
        }
    });

    const [previewCityName, setPreviewCityName] = useState<string>(getCityNameById(DEFAULT_CITY_ID));
    const [selectedDate, setSelectedDate]       = useState<string>(format(new Date(), DATE_FORMAT_API));

    const syncMutation = useSyncPrayerTimes();
    const onSyncSubmit = (data: SyncPrayerRequest) => 
    {
        const payload = 
        {
            ...data,
            month: Number(data.month),
            year: Number(data.year)
        };

        syncMutation.mutate(payload, 
        {
            onSuccess: () => 
            {
                toast.success('Schedule successfully synchronized!');
                queryClient.invalidateQueries({ queryKey: ['prayer-times'] });
                
                setSelectedDate(format(new Date(), DATE_FORMAT_API));
                setPreviewCityName(getCityNameById(data.cityId));
            },
            onError: (err) => 
            {
                console.error(err);
                toast.error('Sync failed. Please check server connection.');
            }
        });
    };

    const [isLocating, setIsLocating] = useState(false);

    const onAutoDetect = () => 
    {
        if (!navigator.geolocation) 
        {
            toast.error("Browser does not support Geolocation.");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => 
            {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                
                let nearestCity: City | null = null;
                let minDistance = Infinity;

                CITIES.forEach(city => 
                {
                    const dist = calculateDistance(userLat, userLon, city.lat, city.lon);
                    if (dist < minDistance) 
                    {
                        minDistance = dist;
                        nearestCity = city;
                    }
                });

                if (nearestCity) 
                {
                    const city = nearestCity as City; 
                    setValue('cityId', city.id);
                    toast.success(`Location detected: ${city.name} (${minDistance.toFixed(1)} km). Syncing...`);
                    const currentValues = getValues();

                    onSyncSubmit({
                        cityId: city.id,
                        month: currentValues.month,
                        year: currentValues.year
                    });

                } 
                else 
                {
                    toast.error("Could not find nearest city.");
                }
                setIsLocating(false);
            },
            (error) => 
            {
                console.error("Geolocation Error:", error);
                setIsLocating(false);

                switch(error.code) 
                {
                    case error.PERMISSION_DENIED:
                        toast.error("Location permission denied. Please allow location access.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error("Location information unavailable.");
                        break;
                    case error.TIMEOUT:
                        toast.error("Location request timed out.");
                        break;
                    default:
                        toast.error("Failed to detect location.");
                        break;
                }
            }
        );
    };

    const { data: prayerData, isLoading: isPrayerLoading } = usePrayerTime(selectedDate);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Prayer Times</h1>
                <p className="text-slate-500 mt-1">Manage and synchronize prayer times from trusted sources.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Card 1: Sync Form */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-slate-100 bg-emerald-50/50 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-emerald-100 shadow-sm">
                             <CloudDownload className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Data Synchronization</h2>
                            <p className="text-xs text-slate-500">Download latest data from external source.</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit(onSyncSubmit)} className="p-6 space-y-6">
                        <div className="space-y-2">
                             <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none text-slate-700">City / District</label>
                                <button 
                                    type="button" 
                                    onClick={onAutoDetect}
                                    disabled={isLocating || syncMutation.isPending}
                                    className={BUTTON_SECONDARY}
                                >
                                    {isLocating ? <Loader2 className="w-3 h-3 animate-spin"/> : <LocateFixed className="w-3 h-3"/>}
                                    {isLocating ? 'Locating...' : 'Auto Detect'}
                                </button>
                            </div>
                            <Select
                                options={CITY_OPTIONS}
                                {...register('cityId', { required: 'Please select a city first' })}
                                error={errors.cityId?.message}
                            />
                        </div>

                        <div className="grid grid-cols-[2fr_1fr] gap-4">
                            <Select
                                label="Month"
                                options={MONTH_OPTIONS}
                                {...register('month', { required: true })}
                                error={errors.month?.message}
                            />
                            
                            <Input
                                label="Year"
                                type="number"
                                placeholder="Year"
                                {...register('year', { required: 'Year is required', min: 2020, max: currentYear + 5 })}
                                error={errors.year?.message}
                            />
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={syncMutation.isPending || isLocating}
                                className={cn(BUTTON_PRIMARY, "w-full h-10")}
                            >
                                {syncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
                                {syncMutation.isPending ? 'Syncing...' : 'Sync Data Now'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Card 2: Preview */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-sky-50/50 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-sky-100 shadow-sm">
                                <Calendar className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Schedule Preview</h2>
                                <p className="text-xs text-slate-500">Data stored in local database.</p>
                            </div>
                        </div>
                        {previewCityName && (
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-full text-xs font-medium text-slate-600 shadow-sm">
                                <MapPin className="w-3 h-3 text-red-500" />
                                {previewCityName}
                            </div>
                        )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col gap-6">
                         {/* Location Badge Mobile */}
                         <div className="sm:hidden flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700">
                             <MapPin className="w-4 h-4 text-red-500" />
                             Location: <span className="font-semibold">{previewCityName}</span>
                         </div>

                        <div className="flex items-center gap-3">
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="pl-3" // Override padding if needed
                            />
                        </div>

                        {isPrayerLoading ? (
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-pulse">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-24 bg-slate-100 rounded-lg"></div>
                                ))}
                             </div>
                        ) : prayerData ? (
                            <div className="space-y-4">
                                <div className="text-center pb-4 border-b border-slate-100">
                                    <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">Prayer Times</p>
                                    <p className="font-bold text-slate-800 text-lg">
                                        {format(new Date(selectedDate), 'EEEE, d MMMM yyyy', { locale: enUS })}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <PrayerTimeCard label="Imsak" time={prayerData.imsak} />
                                    <PrayerTimeCard label="Fajr" time={prayerData.subuh} />
                                    <PrayerTimeCard label="Dhuhr" time={prayerData.dzuhur} />
                                    <PrayerTimeCard label="Asr" time={prayerData.ashar} />
                                    <PrayerTimeCard label="Maghrib" time={prayerData.maghrib} highlight />
                                    <PrayerTimeCard label="Isha" time={prayerData.isya} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                <Search className="w-12 h-12 mb-3 opacity-20" />
                                <p className="font-medium text-slate-600">Schedule Not Found</p>
                                <p className="text-sm mt-1">Please synchronize data for this date.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component
const PrayerTimeCard = ({ label, time, highlight = false }: { label: string, time: string, highlight?: boolean }) => (
    <div className={cn(
        "flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-200 group relative overflow-hidden",
        highlight 
            ? "bg-amber-50 border-amber-200 shadow-md transform hover:-translate-y-1" 
            : "bg-white border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md"
    )}>
        {highlight && <div className="absolute top-0 inset-x-0 h-1 bg-amber-400" />}
        <span className={cn(
            "text-xs font-semibold uppercase tracking-wider mb-2",
            highlight ? "text-amber-700" : "text-slate-400 group-hover:text-emerald-600"
        )}>{label}</span>
        <span className={cn(
            "text-2xl font-bold font-mono tracking-tight",
            highlight ? "text-amber-900" : "text-slate-700"
        )}>{time}</span>
    </div>
);