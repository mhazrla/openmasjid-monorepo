
import { useState, useEffect, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { useActiveRamadan, useInitRamadan, useUpdateRamadanConfig, useUpdateRamadanSchedule } from '../../features/ramadan/hooks';
import { usePeople } from '../../features/people/hooks';
import type { 
    StatusBadgeProps, 
    UserSelectProps, 
    InitFormData, 
    ScheduleRowProps,
    MinimalInputProps 
} from '../../features/ramadan/types';
import { 
    Loader2, Moon, Save, Edit3, User, Coffee, Utensils, Droplets, Calendar, ChevronDown 
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ActionButton } from '../../components/ui/ActionButton';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { id as idLocale } from 'date-fns/locale';

const StatusBadge = memo(({ value, onChange, options = ['open', 'close'] }: StatusBadgeProps) => 
{
    const getStyles = (val: string) => 
    {
        switch (val) 
        {
            case 'open': return "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100";
            case 'close': return "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100";
            default: return "bg-slate-50 text-slate-600 border-slate-200";
        }
    };

    return (
        <div className="relative group/select">
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "appearance-none w-full text-[10px] font-bold uppercase tracking-wider py-1 pl-2 pr-6 rounded-md border cursor-pointer transition-all focus:ring-2 focus:ring-offset-1 outline-none",
                    getStyles(value),
                    "focus:ring-slate-200 uppercase"
                )}
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown className={cn("absolute right-1.5 top-1.5 w-3 h-3 pointer-events-none opacity-50", 
                 value === 'open' ? "text-emerald-600" : "text-rose-600" // Swapped Arrow Colors
            )} />
        </div>
    );
});

const MinimalInput = memo(({ className, type, ...props }: MinimalInputProps) => (
    <input 
        type={type}
        min={type === 'number' ? 0 : undefined}
        className={cn(
            "w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm text-slate-700 placeholder:text-slate-300 transition-all",
            "hover:bg-slate-50/80 hover:border-slate-200",
            "focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none",
            className
        )}
        {...props}
    />
));

const UserSelect = memo(({ value, onChange, options, placeholder = "Select..." }: UserSelectProps) => (
    <div className="relative group/user">
        <User className="absolute left-2 top-1.5 w-3.5 h-3.5 text-slate-400 group-focus-within/user:text-emerald-500 transition-colors pointer-events-none" />
        <select
            value={value}
            onChange={onChange}
            className="w-full pl-7 pr-8 py-1 bg-transparent border border-transparent hover:bg-slate-50 hover:border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded text-sm text-slate-700 appearance-none cursor-pointer outline-none transition-all"
        >
            <option value="" disabled className="text-slate-400">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-slate-300 pointer-events-none" />
    </div>
));

const InitRamadanForm = () => 
{
    const { mutate: initRamadan, isPending } = useInitRamadan();

    const { register, handleSubmit } = useForm<InitFormData>({
        defaultValues: 
        {
            hijriYear: new Date().getFullYear() - 579,
            gregorianYear: new Date().getFullYear(),
            startDate: format(new Date(), 'yyyy-MM-dd'),
            title: 'Lelang Program Ramadhan 1447H',
            subtitle: 'Konfirmasi Infaq: 0812-XXX-XXX (Pesan: INFAQ RAMADHAN)',
            footerNote: 'Mohon hadir 15 menit sebelum waktu Isya.',
            badalImamText: 'Badal Imam',
        }
    });

    const onSubmit = (data: InitFormData) => 
    {
        initRamadan({
            ...data,
            hijriYear: Number(data.hijriYear),
            gregorianYear: Number(data.gregorianYear),
        }, {
            onSuccess: () => toast.success("Ramadan config initialized!"),
            onError: () => toast.error("Failed to initialize.")
        });
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-slate-50/50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3">
                    <Moon className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Ramadan Period</h2>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                    Initialize a new Ramadan schedule configuration. This will generate a 30-day template automatically.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Hijri Year" type="number" min={0} {...register('hijriYear', { valueAsNumber: true })} />
                        <Input label="Gregorian Year" type="number" min={0} {...register('gregorianYear', { valueAsNumber: true })} />
                    </div>
                    <Input label="Start Date (1 Ramadan)" type="date" {...register('startDate', { required: true })} />
                    <Input label="Title" {...register('title')} placeholder="Lelang Program Ramadhan 1447H" />
                    <Input label="Subtitle" {...register('subtitle')} placeholder="Konfirmasi Infaq: 0812-XXX-XXX (Pesan: INFAQ RAMADHAN)" />
                    <Input label="Footer Note" {...register('footerNote')} placeholder="Running text footer..." />
                    <Input label="Badal Text" {...register('badalImamText')} placeholder="Default badal name..." />
                    
                    <ActionButton type="submit" isLoading={isPending} className="w-full justify-center mt-4 h-11 cursor-pointer" variant="primary">
                        Start Ramadan Period
                    </ActionButton>
                </form>
            </div>
        </div>
    );
};

const ScheduleRow = memo(({ schedule, ustadzList }: ScheduleRowProps) => 
{
    const { mutate: updateSchedule, isPending } = useUpdateRamadanSchedule();
    const [isDirty, setIsDirty] = useState(false);
    
    // Local State
    const [formData, setFormData] = useState({
        tarawihImamId: schedule.tarawihImamId?.toString() || '',
        
        // Iftar Snack
        iftarSnackSource: schedule.iftarSnackSource || '',
        iftarSnackQty: schedule.iftarSnackQty || 0,
        iftarSnackStatus: schedule.iftarSnackStatus,

        // Iftar Meal / Kajian
        iftarSpeakerId: schedule.iftarSpeakerId?.toString() || '',
        iftarMealQty: schedule.iftarMealQty || 0,
        iftarMealStatus: schedule.iftarMealStatus,

        // Water
        waterTarawihQty: schedule.waterTarawihQty || 0,
        waterIftarQty: schedule.waterIftarQty || 0,
        waterItikafQty: schedule.waterItikafQty || 0,

        // Itikaf
        itikafStatus: schedule.itikafStatus,
        itikafQty: schedule.itikafQty || 0,
        
        // Charity
        charityQty: schedule.charityQty || 0,
        charityStatus: schedule.charityStatus,
    });

    // Optimized Handler
    const handleChange = useCallback((field: keyof typeof formData, value: any) => 
    {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    }, []);

    const handleSave = useCallback(() => 
    {
        updateSchedule({
            id: schedule.id,
            ...formData,
            tarawihImamId: formData.tarawihImamId ? Number(formData.tarawihImamId) : null,
            iftarSpeakerId: formData.iftarSpeakerId ? Number(formData.iftarSpeakerId) : null,
            iftarSnackQty: Number(formData.iftarSnackQty),
            iftarMealQty: Number(formData.iftarMealQty),
            waterTarawihQty: Number(formData.waterTarawihQty),
            waterIftarQty: Number(formData.waterIftarQty),
            waterItikafQty: Number(formData.waterItikafQty),
            charityQty: Number(formData.charityQty),
            itikafQty: Number(formData.itikafQty),
        }, {
            onSuccess: () => {
                toast.success(`Day ${schedule.ramadanDay} saved`);
                setIsDirty(false);
            },
            onError: () => toast.error("Failed to save")
        });
    }, [updateSchedule, schedule.id, schedule.ramadanDay, formData]);

    const dateObj = parseISO(schedule.date);

    return (
        <tr className={cn(
            "group transition-all duration-200 border-b border-slate-50 last:border-0",
             isDirty ? "bg-amber-50/30" : "hover:bg-slate-50/50"
        )}>
            {/* 1. Date */}
            <td className="pl-6 py-4 w-20">
                <div className="flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-700 leading-none mb-1 font-mono">{schedule.ramadanDay}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {format(dateObj, 'd MMM', { locale: idLocale })}
                    </span>
                </div>
            </td>

            {/* 2. Tarawih */}
            <td className="px-4 py-3 min-w-[200px]">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Moon className="w-3 h-3" /> Imam Tarawih
                    </span>
                    <UserSelect 
                        options={ustadzList} 
                        value={formData.tarawihImamId} 
                        onChange={(e) => handleChange('tarawihImamId', e.target.value)}
                        placeholder="Pilih Imam"
                    />
                </div>
            </td>

            {/* 3. Takjil (Snack) */}
            <td className="px-4 py-3 min-w-[220px]">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Coffee className="w-3 h-3" /> Takjil
                        </span>
                        <div className="w-20">
                            <StatusBadge 
                                value={formData.iftarSnackStatus} 
                                onChange={(v) => handleChange('iftarSnackStatus', v)} 
                                options={['open', 'close']}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <MinimalInput 
                            value={formData.iftarSnackSource || ''} 
                            onChange={(e) => handleChange('iftarSnackSource', e.target.value)} 
                            placeholder="Donatur..."
                            className="text-xs"
                        />
                         <div className="relative w-20 shrink-0">
                            <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 pointer-events-none">pcs</span>
                            <MinimalInput 
                                type="number" 
                                min={0}
                                value={formData.iftarSnackQty} 
                                onChange={(e) => handleChange('iftarSnackQty', Number(e.target.value))} 
                                className="text-center font-mono pr-6"
                            />
                        </div>
                    </div>
                </div>
            </td>

            {/* 4. Ifthor & Kajian */}
            <td className="px-4 py-3 min-w-[240px]">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Utensils className="w-3 h-3" /> Ifthor
                        </span>
                        <div className="w-24">
                            <StatusBadge 
                                value={formData.iftarMealStatus} 
                                onChange={(v) => handleChange('iftarMealStatus', v)} 
                                options={['open', 'close']}
                            />
                        </div>
                    </div>
                    
                    <UserSelect 
                        options={ustadzList} 
                        value={formData.iftarSpeakerId} 
                        onChange={(e) => handleChange('iftarSpeakerId', e.target.value)}
                        placeholder="Pilih Pemateri"
                    />

                     <div className="relative w-full">
                        <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 pointer-events-none uppercase tracking-wider">Porsi:</span>
                        <MinimalInput 
                            type="number" 
                            min={0}
                            value={formData.iftarMealQty} 
                            onChange={(e) => handleChange('iftarMealQty', Number(e.target.value))} 
                            className="pl-12 text-center font-mono"
                        />
                    </div>
                </div>
            </td>

            {/* 5. Air Mineral */}
            <td className="px-4 py-3 min-w-[180px]">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Droplets className="w-3 h-3" /> Air Mineral (Dus)
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                         <div className="text-center space-y-1">
                            <span className="text-[9px] text-slate-400 uppercase">Tarawih</span>
                            <MinimalInput type="number" min={0} className="text-center px-0 font-mono" value={formData.waterTarawihQty} onChange={(e) => handleChange('waterTarawihQty', Number(e.target.value))} />
                         </div>
                         <div className="text-center space-y-1">
                            <span className="text-[9px] text-slate-400 uppercase">Iftar</span>
                             <MinimalInput type="number" min={0} className="text-center px-0 font-mono" value={formData.waterIftarQty} onChange={(e) => handleChange('waterIftarQty', Number(e.target.value))} />
                         </div>
                         <div className="text-center space-y-1">
                            <span className="text-[9px] text-slate-400 uppercase">Itikaf</span>
                             <MinimalInput type="number" min={0} className="text-center px-0 font-mono" value={formData.waterItikafQty} onChange={(e) => handleChange('waterItikafQty', Number(e.target.value))} />
                         </div>
                    </div>
                </div>
            </td>

            {/* 6. Itikaf & Charity */}
            <td className="px-4 py-3 min-w-[160px]">
                <div className="space-y-3">
                    {/* ITIKAF SECTION */}
                     <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Itikaf</span>
                        <div className="w-20">
                            <StatusBadge value={formData.itikafStatus} onChange={(v) => handleChange('itikafStatus', v)} options={['open', 'close']} />
                        </div>
                    </div>
                    {/* Itikaf Qty */}
                    <div className="relative">
                        <span className="absolute right-2 top-1 text-[9px] text-slate-400 pointer-events-none">paket</span>
                        <MinimalInput 
                            type="number" 
                            min={0}
                            className="text-right pr-8 font-mono h-6 text-xs" 
                            value={formData.itikafQty} 
                            onChange={(e) => handleChange('itikafQty', Number(e.target.value))} 
                        />
                    </div>

                    <div className="w-full border-t border-slate-100 my-1"></div>

                    {/* CHARITY SECTION */}
                    <div className="space-y-1">
                         <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">Santunan</span>
                            <div className="w-20">
                                <StatusBadge value={formData.charityStatus} onChange={(v) => handleChange('charityStatus', v)} options={['open', 'close']} />
                            </div>
                        </div>
                        <div className="relative">
                            <span className="absolute right-2 top-1 text-[9px] text-slate-400 pointer-events-none">paket</span>
                            <MinimalInput 
                                type="number" 
                                min={0}
                                className="text-right pr-8 font-mono h-6 text-xs" 
                                value={formData.charityQty} 
                                onChange={(e) => handleChange('charityQty', Number(e.target.value))} 
                            />
                        </div>
                    </div>
                </div>
            </td>

            {/* Action */}
            <td className="px-4 py-3 text-center align-middle w-16">
                <div className={cn(
                    "transition-all duration-300 transform",
                    isDirty 
                        ? "opacity-100 translate-x-0 scale-100" 
                        : "opacity-0 translate-x-4 scale-90 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto"
                )}>
                    <button 
                        onClick={handleSave} 
                        disabled={isPending}
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer",
                            isDirty 
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md animate-pulse-slow" 
                                : "bg-white text-slate-400 border border-slate-200 hover:text-emerald-600 hover:border-emerald-200"
                        )}
                        title="Save Changes"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                    </button>
                    {isDirty && <div className="text-[9px] font-bold text-amber-600 mt-1 uppercase tracking-wider">Unsaved</div>}
                </div>
            </td>
        </tr>
    );
}, (prev, next) => {
    return prev.schedule.id === next.schedule.id; 
});


// --- MAIN PAGE ---
export const RamadanPage = () => {
    const { data: activeConfig, isLoading } = useActiveRamadan();
    const { data: people } = usePeople();
    const { register: registerGlobal, handleSubmit: submitGlobal, reset: resetGlobal } = useForm();
    const { mutate: updateConfig, isPending: isUpdatingConfig } = useUpdateRamadanConfig();

    useEffect(() => {
        if (activeConfig) {
            resetGlobal({
                title: activeConfig.title,
                subtitle: activeConfig.subtitle,
                footerNote: activeConfig.footerNote,
                badalImamText: activeConfig.badalImamText,
            });
        }
    }, [activeConfig, resetGlobal]);

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>;
    if (!activeConfig) return <InitRamadanForm />;

    const ustadzList = people?.filter(p => p.type === 'ustadz' || p.type === 'pengurus').map(p => ({ value: p.id.toString(), label: p.name })) || [];

    return (
        <div className="max-w-[1600px] mx-auto pb-20 relative">
            {/* 1. HERO HEADER */}
            <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 mb-10 overflow-hidden shadow-2xl text-white">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                            <Moon className="w-10 h-10 text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest">
                                    Active Period
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
                                    {activeConfig.gregorianYear} M
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-1 font-serif">
                                Ramadan {activeConfig.hijriYear} <span className="text-emerald-400 font-sans">Hijriah</span>
                            </h1>
                            <p className="text-slate-400 text-lg font-light">
                                Manage Schedules, Key Performance, and Operational Logistics.
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats / Global Config */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 w-full md:w-auto min-w-[320px]">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Edit3 className="w-3 h-3" /> Global Configuration
                        </h3>
                        <form 
                            className="space-y-3"
                            onSubmit={submitGlobal((data: any) => updateConfig({ id: activeConfig.id, ...data }, { onSuccess: () => toast.success("Settings saved") }))}
                        >
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 uppercase font-semibold">Event Title</label>
                                <input 
                                    {...registerGlobal('title')}
                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-serif tracking-wide"
                                    placeholder="e.g. Lelang Program Ramadhan"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 uppercase font-semibold">Subtitle / Contact Info</label>
                                <input 
                                    {...registerGlobal('subtitle')}
                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="e.g. Konfirmasi Infaq: 0812-XXX-XXX (Pesan: INFAQ RAMADHAN)"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 uppercase font-semibold">Footer Running Text</label>
                                <input 
                                    {...registerGlobal('footerNote')}
                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="Enter footer text..."
                                />
                            </div>
                            <div className="flex items-end gap-3">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Badal Default</label>
                                    <input 
                                        {...registerGlobal('badalImamText')}
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 outline-none transition-all"
                                        placeholder="Ustadz Fulan"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isUpdatingConfig}
                                    className="h-[38px] px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer"
                                >
                                    {isUpdatingConfig ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* 2. TABLE CARD */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                             <Calendar className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Monthly Schedule</h2>
                            <p className="text-xs text-slate-500">Manage 30 days of Tarawih, Iftar, and Itikaf logistics.</p>
                        </div>
                    </div>
                    {/* LEGEND UPDATED: Green = Open, Red = Closed */}
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Open</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full border border-rose-100">
                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Closed</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[500px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 backdrop-blur sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Day</th>
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tarawih Lead</th>
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Takjil (Snack)</th>
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Ifthor & Kajian</th>
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Supplies (Air)</th>
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Program</th>
                                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {activeConfig.schedules?.map((schedule) => (
                                <ScheduleRow 
                                    key={schedule.id} 
                                    schedule={schedule} 
                                    ustadzList={ustadzList} 
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};