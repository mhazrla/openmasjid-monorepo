import { useForm, Controller } from 'react-hook-form';
import { useDisplayConfig, useUpdateDisplayConfig } from '../../features/display-config/hooks';
import type { UpdateDisplayConfigDto } from '../../features/display-config/types';
import { type City, CITIES } from '../../constants/prayer';
import { useEffect, useState } from 'react';
import { Loader2, Save, Settings, LocateFixed, Type, Volume2, Clock, BellRing } from 'lucide-react';
import { toast } from 'sonner';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { calculateDistance } from '../../lib/geo';
import { ActionButton } from '../../components/ui/ActionButton';
import { cn } from '../../lib/utils';
import { useBeep } from '../../hooks/use-beep';

const CITY_OPTIONS = CITIES.map(c => ({ value: c.id, label: c.name }));

export const DisplayConfigPage = () => 
{
    const { data: config, isLoading }   = useDisplayConfig();
    const updateMutation                = useUpdateDisplayConfig();
    const [isLocating, setIsLocating]   = useState(false);
    const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } = useForm<UpdateDisplayConfigDto>();
    const enableBeepWatch               = watch('enableBeep');
    const { playBeep }                  = useBeep(enableBeepWatch);

    useEffect(() => 
    {
        if (config) 
        {
            reset({
                cityId: config.cityId,
                runningText: config.runningText || '',
                enableBeep: config.enableBeep,
                beepReminderDuration: config.beepReminderDuration || 30,
                
                // Durations
                preAdzanDuration: config.preAdzanDuration,
                adzanDuration: config.adzanDuration,
                
                // Iqomah
                iqomahDelaySubuh: config.iqomahDelaySubuh,
                iqomahDelayDzuhur: config.iqomahDelayDzuhur,
                iqomahDelayAshar: config.iqomahDelayAshar,
                iqomahDelayMaghrib: config.iqomahDelayMaghrib,
                iqomahDelayIsya: config.iqomahDelayIsya,
                
                // Adjustments
                adjSubuh: config.adjSubuh,
                adjTerbit: config.adjTerbit,
                adjDhuha: config.adjDhuha,
                adjDzuhur: config.adjDzuhur,
                adjAshar: config.adjAshar,
                adjMaghrib: config.adjMaghrib,
                adjIsya: config.adjIsya,
            });
        }
    }, [config, reset]);

    const onAutoDetect = () => 
    {
        if (!navigator.geolocation) {
            toast.error("Browser does not support Geolocation.");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                
                let nearestCity: City | null = null;
                let minDistance = Infinity;

                CITIES.forEach(city => {
                    const dist = calculateDistance(userLat, userLon, city.lat, city.lon);
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearestCity = city;
                    }
                });

                if (nearestCity) {
                    const city = nearestCity as City; 
                    setValue('cityId', city.id, { shouldDirty: true });
                    toast.success(`Location detected: ${city.name} (${minDistance.toFixed(1)} km)`);
                } else {
                    toast.error("Could not find nearest city.");
                }
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation Error:", error);
                setIsLocating(false);
                toast.error("Failed to detect location. Please try again.");
            }
        );
    };

    const onSubmit = (data: UpdateDisplayConfigDto) => 
    {
        const payload: UpdateDisplayConfigDto = {
            ...data,
            // Number casting safety
            preAdzanDuration: Number(data.preAdzanDuration),
            adzanDuration: Number(data.adzanDuration),
            beepReminderDuration: Number(data.beepReminderDuration),
            
            iqomahDelaySubuh: Number(data.iqomahDelaySubuh),
            iqomahDelayDzuhur: Number(data.iqomahDelayDzuhur),
            iqomahDelayAshar: Number(data.iqomahDelayAshar),
            iqomahDelayMaghrib: Number(data.iqomahDelayMaghrib),
            iqomahDelayIsya: Number(data.iqomahDelayIsya),
            
            adjSubuh: Number(data.adjSubuh),
            adjTerbit: Number(data.adjTerbit),
            adjDhuha: Number(data.adjDhuha),
            adjDzuhur: Number(data.adjDzuhur),
            adjAshar: Number(data.adjAshar),
            adjMaghrib: Number(data.adjMaghrib),
            adjIsya: Number(data.adjIsya),
            
            enableBeep: Boolean(data.enableBeep),
            runningText: data.runningText,
        };

        updateMutation.mutate(payload, {
            onSuccess: () => {
                toast.success('Configuration updated successfully!');
                reset(payload);
            },
            onError: () => {
                toast.error('Failed to update configuration.');
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Display Configuration</h1>
                <p className="text-slate-500">Manage display settings, running text, and timings.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* --- Section 1: General & Location --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-slate-500" />
                        <h2 className="font-semibold text-slate-900">General Settings</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        
                        {/* City & Auto Detect */}
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none text-slate-700">City / Location</label>
                                <ActionButton 
                                    type="button" 
                                    variant="outline"
                                    onClick={onAutoDetect}
                                    disabled={isLocating}
                                    isLoading={isLocating}
                                    icon={<LocateFixed className="w-3 h-3"/>}
                                    className="px-3 py-1 text-xs h-auto"
                                >
                                    Auto Detect
                                </ActionButton>
                            </div>
                            <Select
                                options={CITY_OPTIONS}
                                {...register('cityId', { required: 'City is required' })}
                                error={errors.cityId?.message}
                            />
                        </div>

                        {/* Running Text */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Type className="w-4 h-4" /> Running Text
                            </label>
                            <textarea 
                                rows={3}
                                className={cn(
                                    "flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                    errors.runningText && "border-red-500 focus:ring-red-500"
                                )}
                                placeholder="Enter message to display at the bottom..."
                                {...register('runningText')}
                            />
                            <p className="text-xs text-slate-500">Text displayed at the bottom of the screen.</p>
                        </div>

                        {/* Beep Settings Group */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                        <Volume2 className="w-4 h-4" /> Enable Beep Sound
                                    </label>
                                    <p className="text-xs text-slate-500">Play a beep sound before Adzan and Iqomah.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={playBeep}
                                        className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1"
                                    >
                                        <Volume2 className="w-3 h-3" /> Test
                                    </button>

                                    <Controller
                                        control={control}
                                        name="enableBeep"
                                        render={({ field: { value, onChange } }) => (
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer"
                                                    checked={!!value}
                                                    onChange={(e) => onChange(e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Beep Reminder Duration (Hanya positif) */}
                            <div className={cn(
                                "transition-all duration-300 overflow-hidden",
                                enableBeepWatch ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                            )}>
                                <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium text-emerald-900 flex items-center gap-2">
                                            <BellRing className="w-4 h-4" /> Beep Reminder Start
                                        </label>
                                        <p className="text-xs text-emerald-700">Seconds before phase starts (Minimum 0).</p>
                                    </div>
                                    <div className="w-full md:w-32">
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                min="0"
                                                className="flex h-9 w-full rounded-md border border-emerald-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                                                placeholder="30"
                                                {...register('beepReminderDuration', { min: 0 })}
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-slate-400">sec</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Section 2: Global Timings (Hanya positif) --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <h2 className="font-semibold text-slate-900">Global Timings (Minutes)</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Pre-Adzan Duration"
                            description="How long standby screen appears before Adzan"
                            type="number"
                            min="0"
                            {...register('preAdzanDuration', { min: 0 })}
                            error={errors.preAdzanDuration && "Must be 0 or more"}
                        />
                        <Input
                            label="Adzan Duration"
                            description="Duration of Adzan display before Iqomah countdown"
                            type="number"
                            min="0"
                            {...register('adzanDuration', { min: 0 })}
                            error={errors.adzanDuration && "Must be 0 or more"}
                        />
                    </div>
                </div>

                {/* --- Section 3: Iqomah Timers (Hanya positif) --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-slate-500" />
                        <h2 className="font-semibold text-slate-900">Iqomah Countdown (Minutes)</h2>
                    </div>
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        <Input label="Subuh" type="number" min="0" {...register('iqomahDelaySubuh', { min: 0 })} />
                        <Input label="Dzuhur" type="number" min="0" {...register('iqomahDelayDzuhur', { min: 0 })} />
                        <Input label="Ashar" type="number" min="0" {...register('iqomahDelayAshar', { min: 0 })} />
                        <Input label="Maghrib" type="number" min="0" {...register('iqomahDelayMaghrib', { min: 0 })} />
                        <Input label="Isya" type="number" min="0" {...register('iqomahDelayIsya', { min: 0 })} />
                    </div>
                </div>

                {/* --- Section 4: Time Corrections (Boleh negatif) --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-slate-500" />
                        <h2 className="font-semibold text-slate-900">Time Corrections (Minutes)</h2>
                    </div>
                    <div className="p-6">
                         <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-2 rounded border border-slate-100 inline-block">
                            Use <strong>negative values</strong> to subtract minutes (e.g. -2). Used to match mosque clock.
                         </p>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            <Input label="Subuh" type="number" placeholder="0" {...register('adjSubuh')} />
                            <Input label="Terbit" type="number" placeholder="0" {...register('adjTerbit')} />
                            <Input label="Dhuha" type="number" placeholder="0" {...register('adjDhuha')} />
                            <Input label="Dzuhur" type="number" placeholder="0" {...register('adjDzuhur')} />
                            <Input label="Ashar" type="number" placeholder="0" {...register('adjAshar')} />
                            <Input label="Maghrib" type="number" placeholder="0" {...register('adjMaghrib')} />
                            <Input label="Isya" type="number" placeholder="0" {...register('adjIsya')} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <ActionButton 
                        type="submit" 
                        variant="primary"
                        isLoading={updateMutation.isPending}
                        disabled={!isDirty}
                        icon={<Save className="w-4 h-4" />}
                    >
                        Save Configuration
                    </ActionButton>
                </div>
            </form>
        </div>
    );
};