import { useForm, Controller } from 'react-hook-form';
import { useDisplayConfig, useUpdateDisplayConfig } from '../../features/display-config/hooks';
import type { UpdateDisplayConfigDto } from '../../features/display-config/types';
import { type City, CITIES } from '../../constants/prayer';
import { useEffect, useState } from 'react';
import { Loader2, Save, Settings, LocateFixed, Type, Volume2, Clock, BellRing, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { calculateDistance } from '../../lib/geo';
import { ActionButton } from '../../components/ui/ActionButton';
import { cn } from '../../lib/utils';
import { useBeep } from '../../hooks/use-beep';
import { useLoadingStore } from '../../store/useLoadingStore';
import { handleFormError } from '../../utils/form-error';

const CITY_OPTIONS = CITIES.map(c => ({ value: c.id, label: c.name }));

const FONT_OPTIONS = [
    { value: 'sans', label: 'Inter (Modern Sans)' },
    { value: 'serif', label: 'Playfair (Elegant Serif)' },
    { value: 'mono', label: 'JetBrains (Monospace)' },
];

export const DisplayConfigPage = () => 
{
    const { data: config, isPending: isConfigLoading } = useDisplayConfig();
    const updateMutation = useUpdateDisplayConfig();
    
    useEffect(() => 
    {
        if (isConfigLoading) {
            useLoadingStore.getState().showLoading('Loading display configuration...');
        } else {
            useLoadingStore.getState().hideLoading();
        }
    }, [isConfigLoading]);
    const [isLocating, setIsLocating]   = useState(false);
    const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isDirty }, setError } = useForm<UpdateDisplayConfigDto>();
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
                shalatDurationSubuh: config.shalatDurationSubuh ?? 10,
                shalatDurationDzuhur: config.shalatDurationDzuhur ?? 10,
                shalatDurationAshar: config.shalatDurationAshar ?? 10,
                shalatDurationMaghrib: config.shalatDurationMaghrib ?? 10,
                shalatDurationIsya: config.shalatDurationIsya ?? 10,

                // Toggles
                enablePreAdzan: config.enablePreAdzan ?? true,
                enableAdzan: config.enableAdzan ?? true,
                enableIqomah: config.enableIqomah ?? true,
                enableShalat: config.enableShalat ?? true,
                
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
                hijriAdj: config.hijriAdj ?? 0,

                // Theme
                themeColor: config.themeColor || '#10b981',
                accentColor: config.accentColor || '#fbbf24',
                labelColor: config.labelColor || '#cbd5e1',
                fontFamily: config.fontFamily || 'sans',
                baseFontSize: config.baseFontSize ?? 100,
                clockFontSize: config.clockFontSize ?? 100,
                labelFontSize: config.labelFontSize ?? 100,
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
            (position) => 
            {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                
                let nearestCity: City | null = null;
                let minDistance = Infinity;

                CITIES.forEach(city => 
                {
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
            (error) => 
            {
                console.error("Geolocation Error:", error);
                setIsLocating(false);
                toast.error("Failed to detect location. Please try again.");
            }
        );
    };

    const onSubmit = async (data: UpdateDisplayConfigDto) => 
    {
        try 
        {
            const payload: UpdateDisplayConfigDto = {
                ...data,
                // Number casting safety
                preAdzanDuration: Number(data.preAdzanDuration),
                adzanDuration: Number(data.adzanDuration),
                shalatDurationSubuh: Number(data.shalatDurationSubuh),
                shalatDurationDzuhur: Number(data.shalatDurationDzuhur),
                shalatDurationAshar: Number(data.shalatDurationAshar),
                shalatDurationMaghrib: Number(data.shalatDurationMaghrib),
                shalatDurationIsya: Number(data.shalatDurationIsya),
                
                enablePreAdzan: Boolean(data.enablePreAdzan),
                enableAdzan: Boolean(data.enableAdzan),
                enableIqomah: Boolean(data.enableIqomah),
                enableShalat: Boolean(data.enableShalat),
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
                hijriAdj: Number(data.hijriAdj),
                
                enableBeep: Boolean(data.enableBeep),
                runningText: data.runningText,

                themeColor: data.themeColor,
                accentColor: data.accentColor,
                labelColor: data.labelColor,
                fontFamily: data.fontFamily,
                baseFontSize: Number(data.baseFontSize),
                clockFontSize: Number(data.clockFontSize),
                labelFontSize: Number(data.labelFontSize),
            };

            await updateMutation.mutateAsync(payload);
            toast.success('Configuration updated successfully!');
            reset(payload);
        } 
        catch (err: any) 
        {
            console.error(err);
            handleFormError(err, setError);
        }
    };

    if (isConfigLoading) 
    {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    // Live preview values
    const watchThemeColor = watch('themeColor', '#10b981');
    const watchAccentColor = watch('accentColor', '#fbbf24');
    const watchLabelColor = watch('labelColor', '#cbd5e1');
    const watchFontFamily = watch('fontFamily', 'sans');
    const watchBaseFontSize = watch('baseFontSize', 100);
    const watchClockFontSize = watch('clockFontSize', 100);
    const watchLabelFontSize = watch('labelFontSize', 100);

    const getPreviewFontFamily = () => 
    {
        if (watchFontFamily === 'serif') return '"Playfair Display", Georgia, serif';
        if (watchFontFamily === 'mono') return 'monospace';
        return 'Inter, ui-sans-serif, system-ui, sans-serif';
    };

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
                                    icon={<LocateFixed className="w-3 h-3"/>}
                                    className="px-3 py-1 text-xs h-auto"
                                >
                                    Auto Detect
                                </ActionButton>
                            </div>
                            <Controller
                                control={control}
                                name="cityId"
                                rules={{ required: 'City is required' }}
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        options={CITY_OPTIONS}
                                        value={value}
                                        onChange={onChange}
                                        error={errors.cityId?.message}
                                        searchable
                                        placeholder="Select City"
                                    />
                                )}
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

                {/* --- Section 2: Display Modes & Timings --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <h2 className="font-semibold text-slate-900">Display Modes & Timings</h2>
                    </div>
                    <div className="p-0 divide-y divide-slate-100">
                        {/* 1. Pre-Adzan */}
                        <div className="p-4 flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <Controller
                                        control={control}
                                        name="enablePreAdzan"
                                        render={({ field: { value, onChange } }) => (
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
                                                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        )}
                                    />
                                    <span className="font-medium text-slate-900">Pre-Adzan</span>
                                </div>
                                <p className="text-xs text-slate-500 pl-12">Countdown to Adzan.</p>
                            </div>
                            <div className="w-24">
                                <Input 
                                    type="number" 
                                    min="0" 
                                    className="h-8 text-sm"
                                    placeholder="Min"
                                    {...register('preAdzanDuration', { min: 0 })}
                                />
                            </div>
                        </div>

                        {/* 2. Adzan */}
                        <div className="p-4 flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <Controller
                                        control={control}
                                        name="enableAdzan"
                                        render={({ field: { value, onChange } }) => (
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
                                                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        )}
                                    />
                                    <span className="font-medium text-slate-900">Adzan</span>
                                </div>
                                <p className="text-xs text-slate-500 pl-12">"Adzan Berkumandang" screen.</p>
                            </div>
                            <div className="w-24">
                                <Input 
                                    type="number" 
                                    min="0" 
                                    className="h-8 text-sm"
                                    placeholder="Min"
                                    {...register('adzanDuration', { min: 0 })}
                                />
                            </div>
                        </div>

                        {/* 3. Iqomah */}
                        <div className="p-4 flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <Controller
                                        control={control}
                                        name="enableIqomah"
                                        render={({ field: { value, onChange } }) => (
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
                                                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        )}
                                    />
                                    <span className="font-medium text-slate-900">Iqomah</span>
                                </div>
                                <p className="text-xs text-slate-500 pl-12">Countdown to Shalat. (Durations set below)</p>
                            </div>
                             <div className="w-24 opacity-50 text-xs text-center flex items-center justify-center">
                                See Below
                            </div>
                        </div>

                        {/* 4. Shalat */}
                        <div className="p-4 flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <Controller
                                        control={control}
                                        name="enableShalat"
                                        render={({ field: { value, onChange } }) => (
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
                                                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        )}
                                    />
                                    <span className="font-medium text-slate-900">Shalat Mode</span>
                                </div>
                                <p className="text-xs text-slate-500 pl-12">"Luruskan Shaf" screen / dark screen.</p>
                            </div>
                            <div className="w-24 opacity-50 text-xs text-center flex items-center justify-center">
                                See Below
                            </div>
                        </div>
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

                {/* --- Section 3.5: Shalat Duration (Hanya positif) --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-slate-500" />
                        <h2 className="font-semibold text-slate-900">Shalat Duration (Minutes)</h2>
                    </div>
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        <Input label="Subuh" type="number" min="1" {...register('shalatDurationSubuh', { min: 1 })} />
                        <Input label="Dzuhur" type="number" min="1" {...register('shalatDurationDzuhur', { min: 1 })} />
                        <Input label="Ashar" type="number" min="1" {...register('shalatDurationAshar', { min: 1 })} />
                        <Input label="Maghrib" type="number" min="1" {...register('shalatDurationMaghrib', { min: 1 })} />
                        <Input label="Isya" type="number" min="1" {...register('shalatDurationIsya', { min: 1 })} />
                    </div>
                </div>

                {/* --- Section 4: Time Corrections (Boleh negatif) --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-slate-500" />
                        <h2 className="font-semibold text-slate-900">Time & Date Corrections</h2>
                    </div>
                    <div className="p-6">
                         <div className="mb-2">
                             <h3 className="text-sm font-semibold text-slate-900 mb-2">Prayer Times (Minutes)</h3>
                             <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded border border-slate-100 inline-block">
                                Use <strong>negative values</strong> to subtract minutes (e.g. -2). Used to match mosque clock.
                             </p>
                         </div>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            <Input label="Subuh" type="number" placeholder="0" {...register('adjSubuh')} />
                            <Input label="Terbit" type="number" placeholder="0" {...register('adjTerbit')} />
                            <Input label="Dhuha" type="number" placeholder="0" {...register('adjDhuha')} />
                            <Input label="Dzuhur" type="number" placeholder="0" {...register('adjDzuhur')} />
                            <Input label="Ashar" type="number" placeholder="0" {...register('adjAshar')} />
                            <Input label="Maghrib" type="number" placeholder="0" {...register('adjMaghrib')} />
                            <Input label="Isya" type="number" placeholder="0" {...register('adjIsya')} />
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-100">
                             <h3 className="text-sm font-semibold text-slate-900 mb-2">Hijri Date (Days)</h3>
                             <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded border border-slate-100 inline-block">
                                Adjust the Hijri date for the calendar. Use <strong>-1</strong> or <strong>+1</strong> to fix inaccuracies.
                             </p>
                             <div className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-40">
                                <Input label="Offset" type="number" placeholder="0" {...register('hijriAdj')} />
                             </div>
                        </div>
                    </div>
                </div>

                {/* --- Section 5: Custom Theme --- */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-slate-500" />
                        <h2 className="font-semibold text-slate-900">Custom Theme & Branding</h2>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Form Inputs */}
                        <div className="space-y-6">
                            <Controller
                                control={control}
                                name="fontFamily"
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        label="Font Family"
                                        options={FONT_OPTIONS}
                                        value={value}
                                        onChange={onChange}
                                    />
                                )}
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">Primary Color (Containers, Borders)</label>
                                <div className="flex items-center gap-3">
                                    <Controller
                                        control={control}
                                        name="themeColor"
                                        render={({ field: { value, onChange } }) => (
                                            <>
                                                <input 
                                                    type="color" 
                                                    value={value || '#10b981'}
                                                    onChange={onChange}
                                                    className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                                />
                                                <Input 
                                                    type="text" 
                                                    value={value || ''}
                                                    onChange={onChange}
                                                    className="h-10 flex-1 uppercase font-mono text-sm"
                                                    placeholder="#10b981"
                                                />
                                            </>
                                        )}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">Accent Color (Highlight Texts)</label>
                                <div className="flex items-center gap-3">
                                    <Controller
                                        control={control}
                                        name="accentColor"
                                        render={({ field: { value, onChange } }) => (
                                            <>
                                                <input 
                                                    type="color" 
                                                    value={value || '#fbbf24'}
                                                    onChange={onChange}
                                                    className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                                />
                                                <Input 
                                                    type="text" 
                                                    value={value || ''}
                                                    onChange={onChange}
                                                    className="h-10 flex-1 uppercase font-mono text-sm"
                                                    placeholder="#fbbf24"
                                                />
                                            </>
                                        )}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">Label Color (Small Texts & Meta)</label>
                                <div className="flex items-center gap-3">
                                    <Controller
                                        control={control}
                                        name="labelColor"
                                        render={({ field: { value, onChange } }) => (
                                            <>
                                                <input 
                                                    type="color" 
                                                    value={value || '#cbd5e1'}
                                                    onChange={onChange}
                                                    className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                                />
                                                <Input 
                                                    type="text" 
                                                    value={value || ''}
                                                    onChange={onChange}
                                                    className="h-10 flex-1 uppercase font-mono text-sm"
                                                    placeholder="#cbd5e1"
                                                />
                                            </>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex justify-between text-sm font-medium text-slate-900">
                                    <span>Global Font Size (Zoom)</span>
                                    <span className="text-emerald-600 font-bold">{watchBaseFontSize}%</span>
                                </label>
                                <input 
                                    type="range" min="50" max="150" step="5"
                                    className="w-full accent-emerald-500"
                                    {...register('baseFontSize', { valueAsNumber: true })}
                                />
                                <p className="text-xs text-slate-500">Controls the proportion of texts across all widgets.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="flex justify-between text-sm font-medium text-slate-900">
                                    <span>Meta & Small Text Size</span>
                                    <span className="font-bold text-emerald-600">{watchLabelFontSize || 100}%</span>
                                </label>
                                <Controller
                                    control={control}
                                    name="labelFontSize"
                                    render={({ field: { value, onChange } }) => (
                                        <div className="flex flex-col gap-1">
                                            <input 
                                                type="range" 
                                                min="50" max="200" step="5"
                                                value={value || 100}
                                                onChange={(e) => onChange({ target: { value: Number(e.target.value), valueAsNumber: true } })}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                            <p className="text-xs text-slate-500">Controls the proportion of secondary text sizes.</p>
                                        </div>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex justify-between text-sm font-medium text-slate-900">
                                    <span>Main Clock Size</span>
                                    <span className="text-emerald-600 font-bold">{watchClockFontSize}%</span>
                                </label>
                                <input 
                                    type="range" min="50" max="200" step="5"
                                    className="w-full accent-emerald-500"
                                    {...register('clockFontSize', { valueAsNumber: true })}
                                />
                                <p className="text-xs text-slate-500">Controls the size of the large digital clock.</p>
                            </div>
                        </div>

                        {/* --- Live Preview Box (REVISED FOR TOTAL SCALING REACTIVITY) --- */}
<div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-200 relative flex flex-col shadow-inner min-h-[500px]">
    <div className="bg-slate-900 p-2 text-center border-b border-white/5 shrink-0 z-20">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Live Preview (Real-time Scaling)</span>
    </div>
    
    <div className="flex-1 relative overflow-hidden bg-[#0a0f0b]">
        {/* Background Gradients Glow - Reactive to Theme Color */}
        <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-20" 
            style={{ backgroundColor: watchThemeColor }}
        />

        {/* CONTAINER UTAMA YANG DI-SCALE SECARA GLOBAL */}
        <div 
            className="absolute inset-0 flex flex-col items-center justify-start p-8 origin-top transition-transform duration-200"
            style={{ 
                fontFamily: getPreviewFontFamily(),
                // Rumus: Mengubah persentase (50-150) menjadi skala decimal (0.5 - 1.5)
                transform: `scale(${(watchBaseFontSize || 100) / 100})`
            }}
        >
            {/* 1. Integrated Floating Pill Clock Preview */}
            <div className="relative z-20 flex items-center justify-center gap-4 px-6 py-3 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl origin-center mb-8">
                {/* Mosque Identity Part */}
                <div className="flex items-center gap-3 pr-4 border-r border-white/20">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center p-1 border border-white/10">
                        <div className="w-full h-full rounded-lg flex items-center justify-center opacity-40" style={{ backgroundColor: watchThemeColor }}>
                            <span className="font-bold text-[0.6rem]" style={{ color: watchThemeColor }}>LOGO</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[0.8rem] font-black uppercase whitespace-nowrap leading-none text-white">NAMA MASJID ANDA</span>
                        <span className="text-[0.4rem] font-bold uppercase tracking-widest opacity-80" style={{ color: watchThemeColor }}>Alamat Masjid...</span>
                    </div>
                </div>
                
                {/* Clock Part - Reactive to Main Clock Size Slider */}
                <div 
                    className="flex items-baseline font-black leading-none" 
                    style={{ 
                        fontSize: `calc(1.8rem * ${(watchClockFontSize || 100) / 100})`,
                        color: watchThemeColor 
                    }}
                >
                    12:34<span className="text-[0.6em] ml-1 opacity-80" style={{ color: watchThemeColor }}>:56</span>
                </div>

                {/* Hijri/Date Part */}
                <div className="flex flex-col border-l border-white/20 pl-4 leading-tight">
                    <span className="text-[0.6rem] font-bold text-slate-200 whitespace-nowrap">Jumat, 27 Feb 2026</span>
                    <span className="text-[0.6rem] font-black uppercase" style={{ color: watchThemeColor }}>10 Ramadhan 1447 H</span>
                </div>
            </div>

            {/* 2. Scaled Widget Preview (Simulating the Giant Ramadan Row) */}
            <div 
                className="w-full max-w-md bg-black/40 backdrop-blur-md rounded-[2rem] border border-white/5 p-6 shadow-2xl flex flex-col gap-4"
                style={{ borderColor: `${watchThemeColor}20` }}
            >
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <div 
                        className="w-12 h-12 rounded-2xl bg-[#0d160f] border-2 flex items-center justify-center"
                        style={{ borderColor: watchThemeColor }}
                    >
                        <span className="font-mono font-black text-[1.8rem]" style={{ color: 'white' }}>1</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[0.5rem] font-black uppercase tracking-widest" style={{ color: watchLabelColor }}>Contoh Widget</span>
                        <span className="text-[1.2rem] font-black text-white leading-none uppercase">Paket Buka Puasa</span>
                    </div>
                </div>

                {/* Auction Badge Simulation - Meta Text Size Linked Here */}
                <div 
                    className="w-full py-4 px-4 bg-[#0d160f] border-2 rounded-[1.5rem] flex flex-col items-center"
                    style={{ borderColor: `${watchThemeColor}30` }}
                >
                    <span 
                        className="font-black tracking-[0.2em] mb-1" 
                        style={{ 
                            color: watchAccentColor,
                            fontSize: `calc(0.6rem * ${(watchLabelFontSize || 100) / 100})` 
                        }}
                    >
                        ❌ OPEN
                    </span>
                    <div className="font-mono text-[2.2rem] font-black leading-none mb-2 text-white">
                        59 <span style={{ color: watchLabelColor, fontSize: '0.5em' }}>/ 100</span>
                    </div>
                    <div 
                        className="bg-rose-600 text-white px-4 py-1.5 rounded-lg font-black uppercase tracking-tighter animate-pulse shadow-lg shadow-rose-900/40"
                        style={{ fontSize: `calc(0.8rem * ${(watchLabelFontSize || 100) / 100})` }}
                    >
                        KURANG: 41
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Bottom Marquee Simulation (Tetap di bawah, tidak ikut scale zoom) */}
        <div 
            className="absolute bottom-0 left-0 w-full h-8 flex items-center overflow-hidden transition-colors z-20"
            style={{ backgroundColor: watchThemeColor }}
        >
            <div className="text-black text-[0.6rem] font-black uppercase tracking-widest px-4 whitespace-nowrap opacity-80">
                {watch('runningText') || "TEXT RUNNING AKAN MUNCUL DI SINI SECARA BERJALAN..."}
            </div>
        </div>
    </div>
</div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <ActionButton 
                        type="submit" 
                        variant="primary"
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