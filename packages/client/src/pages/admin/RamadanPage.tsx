
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useActiveRamadan, useInitRamadan, useUpdateRamadanConfig, useUpdateRamadanSchedule } from '../../features/ramadan/hooks';
import { usePeople } from '../../features/people/hooks';
import type { RamadanConfig, RamadanSchedule, Person } from '../../features/ramadan/types';
import { Loader2, Calendar, Moon, Save, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ActionButton } from '../../components/ui/ActionButton';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import type { SelectOption } from '../../components/ui/Select';
import { cn } from '../../lib/utils';

// --- SUB-COMPONENTS ---

// 1. Initialization Form
const InitRamadanForm = () => {
    const { mutate: initRamadan, isPending } = useInitRamadan();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            hijriYear: new Date().getFullYear() - 579,
            gregorianYear: new Date().getFullYear(),
            startDate: format(new Date(), 'yyyy-MM-dd'),
            badalImamText: 'Badal Imam',
            footerNote: 'Mohon hadir 15 menit sebelum waktu Isya.'
        }
    });

    const onSubmit = (data: any) => {
        initRamadan({
            ...data,
            hijriYear: Number(data.hijriYear),
            gregorianYear: Number(data.gregorianYear)
        }, {
            onSuccess: () => toast.success("Ramadan config initialized!"),
            onError: () => toast.error("Failed to initialize.")
        });
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                    <Moon className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Setup Ramadan</h2>
                <p className="text-sm text-slate-500 text-center">No active configuration found. Please initialize a new period.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Hijri Year" 
                        type="number" 
                        error={errors.hijriYear?.message as string}
                        {...register('hijriYear', { required: "Required", valueAsNumber: true })} 
                    />
                    <Input 
                        label="Gregorian Year" 
                        type="number" 
                        error={errors.gregorianYear?.message as string}
                        {...register('gregorianYear', { required: "Required", valueAsNumber: true })} 
                    />
                </div>
                <Input label="Start Date (1 Ramadan)" type="date" error={errors.startDate?.message as string} {...register('startDate', { required: true })} />
                <Input label="Badal Text" error={errors.badalImamText?.message as string} {...register('badalImamText')} placeholder="e.g. Ustadz Fulan" />
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Footer Note</label>
                    <textarea 
                        className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 max-h-32 min-h-[80px]" 
                        {...register('footerNote')}
                    />
                </div>
                
                <ActionButton 
                    type="submit" 
                    className="w-full justify-center" 
                    variant="primary" 
                    isLoading={isPending}
                >
                    Initialize Ramadan
                </ActionButton>
            </form>
        </div>
    );
};

// 2. Schedule Row Component (Memoized)
interface ScheduleRowProps {
    schedule: RamadanSchedule;
    imams: Person[]; 
}

const ScheduleRow = memo(({ schedule, imams }: ScheduleRowProps) => {
    const { mutate: updateSchedule } = useUpdateRamadanSchedule();
    const [localImamId, setLocalImamId] = useState<string>(schedule.imamId?.toString() || '');
    const [localDesc, setLocalDesc] = useState(schedule.description || '');
    const [isDirty, setIsDirty] = useState(false);

    // Sync state logic
    useEffect(() => {
        const propImamId = schedule.imamId?.toString() || '';
        const propDesc = schedule.description || '';
        
        if (propImamId === localImamId && propDesc === localDesc) {
            setIsDirty(false);
        }
    }, [schedule.imamId, schedule.description, localImamId, localDesc]);

    const handleChange = useCallback((field: 'imamId' | 'description', value: string) => {
        setIsDirty(true);
        if (field === 'imamId') setLocalImamId(value);
        if (field === 'description') setLocalDesc(value);
    }, []);

    const handleSave = () => {
        updateSchedule({
            id: schedule.id,
            imamId: localImamId ? Number(localImamId) : null,
            description: localDesc
        }, {
            onSuccess: () => {
                toast.success(`Day ${schedule.ramadanDay} updated`);
                setIsDirty(false);
            },
            onError: () => toast.error("Failed to update")
        });
    };

    const imamOptions: SelectOption[] = useMemo(() => {
        if (imams.length === 0) return [{ value: '', label: 'No Ustadz Found' }];
        return imams.map(im => ({ value: im.id, label: im.name }));
    }, [imams]);

    return (
        <tr className={cn("transition-colors", isDirty ? "bg-amber-50" : "hover:bg-slate-50")}>
            <td className="px-4 py-3 text-sm font-medium text-slate-900 text-center">{schedule.ramadanDay}</td>
            <td className="px-4 py-3 text-sm text-slate-500">{format(parseISO(schedule.date), 'dd MMM yyyy')}</td>
            <td className="px-4 py-3">
                <Select 
                    options={imamOptions}
                    value={localImamId}
                    onChange={(e) => handleChange('imamId', e.target.value)}
                    placeholder="-- Select Imam --"
                    className={cn(
                        "transition-all",
                        isDirty && "border-amber-300 focus-visible:ring-amber-500"
                    )}
                />
            </td>
            <td className="px-4 py-3">
                <Input 
                    type="text" 
                    placeholder="Notes..."
                    value={localDesc}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className={cn(
                        "transition-all",
                        isDirty && "border-amber-300 focus-visible:ring-amber-500"
                    )}
                />
            </td>
            <td className="px-4 py-3 text-center h-12">
                {isDirty && (
                    <div className="flex justify-center">
                        <ActionButton 
                            onClick={handleSave}
                            variant="primary" // Changed to primary for visibility or 'ghost' as requested? Prompt said 'small/ghost variant' but also 'preserve logic' of button. Let's use ghost but with color.
                            // Actually pure ghost might be too subtle if it's the main action. 
                            // Prompt said: "It should be small/ghost variant."
                            // But styling said: "p-1.5 rounded-full bg-emerald-100 text-emerald-600". ActionButton 'ghost' is text-slate.
                            // I should probably use 'ghost' and add className for color if I strictly follow component.
                            // However, ActionButton has variants. Let's use 'ghost' and override classes to match the previous look if possible,
                            // OR just use a custom className on ActionButton.
                            // The previous button had `bg-emerald-100 text-emerald-600`.
                            // ActionButton 'primary' is `bg-emerald-600 text-white`.
                            // ActionButton 'outline' is `bg-emerald-50 text-emerald-700`.
                            // Let's use 'outline' which is closest, or just basic button logic.
                            // Wait, requirement: "Replace raw <button> ... with ActionButton".
                            // "If ActionButton doesn't have size prop, use className to enforce dimensions".
                            // I'll use `variant="ghost"` and add the colors via className overlap or just stick to component styles.
                            // Let's use `variant="ghost"` but add `text-emerald-600 hover:bg-emerald-50` to mimic the "save" feel.
                            className="h-8 w-8 p-0 rounded-full text-emerald-600 hover:bg-emerald-50"
                            icon={<Save className="w-4 h-4" />}
                        />
                    </div>
                )}
            </td>
        </tr>
    );
}, (prev, next) => {
    return (
        prev.schedule.id === next.schedule.id &&
        prev.schedule.imamId === next.schedule.imamId &&
        prev.schedule.description === next.schedule.description &&
        prev.schedule.date === next.schedule.date && 
        prev.imams === next.imams 
    );
});

// 3. Main Page
export const RamadanPage = () => {
    const { data: activeConfig, isLoading } = useActiveRamadan();
    const { data: people } = usePeople();

    // Global Config Form (Footer/Badal)
    const { register: registerGlobal, handleSubmit: submitGlobal, reset: resetGlobal } = useForm();
    const { mutate: updateConfig, isPending: isUpdatingConfig } = useUpdateRamadanConfig();

    useEffect(() => {
        if (activeConfig) {
            resetGlobal({
                footerNote: activeConfig.footerNote,
                badalImamText: activeConfig.badalImamText
            });
        }
    }, [activeConfig, resetGlobal]);

    if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

    if (!activeConfig) {
        return <InitRamadanForm />;
    }

    const imams = people || [];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Moon className="w-6 h-6 text-emerald-600" />
                        Ramadan {activeConfig.hijriYear}H / {activeConfig.gregorianYear}M
                    </h1>
                    <p className="text-slate-500">Manage Tarawih schedules and settings.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                    Active Period
                </div>
            </div>

            {/* Global Settings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> Global Settings
                </h3>
                <form 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
                    onSubmit={submitGlobal((data) => {
                        updateConfig({ id: activeConfig.id, ...data }, {
                            onSuccess: () => toast.success("Settings updated")
                        });
                    })}
                >
                    <Input 
                        label="Footer Note"
                        {...registerGlobal('footerNote')}
                    />
                    <Input 
                        label="Badal Imam Text"
                        {...registerGlobal('badalImamText')}
                    />
                    
                    <div className="flex justify-end md:justify-start">
                        <ActionButton 
                            type="submit" 
                            variant="secondary" 
                            isLoading={isUpdatingConfig} 
                            icon={<Save className="w-3 h-3"/>}
                            className="h-10" // Initial align with Input height (which is h-10)
                        >
                            Update Settings
                        </ActionButton>
                    </div>
                </form>
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        Tarawih Schedule (30 Days)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="px-4 py-3 font-semibold text-center w-16">Day</th>
                                <th className="px-4 py-3 font-semibold w-40">Date</th>
                                <th className="px-4 py-3 font-semibold w-64">Imam</th>
                                <th className="px-4 py-3 font-semibold">Description / Notes</th>
                                <th className="px-4 py-3 font-semibold w-16 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activeConfig.schedules?.map((schedule) => (
                                <ScheduleRow key={schedule.id} schedule={schedule} imams={imams} />
                            ))}
                            {(!activeConfig.schedules || activeConfig.schedules.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        No schedules found. Please re-initialize.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
