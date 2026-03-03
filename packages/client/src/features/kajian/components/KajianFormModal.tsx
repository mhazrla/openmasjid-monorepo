import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { useCreateKajian, useUpdateKajian } from '../hooks'; 
import { usePeople } from '../../people/hooks'; 
import { ActionButton } from '../../../components/ui/ActionButton';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { Upload, X } from 'lucide-react';
import { cn, getImageUrl } from '../../../lib/utils';
import { type KajianFormValues, type KajianFormModalProps, DAYS } from '../types';
import { format } from 'date-fns';
import { handleFormError } from '../../../utils/form-error';

export const KajianFormModal = ({ isOpen, onClose, editingKajian }: KajianFormModalProps) => 
{
    const { data: people = [] } = usePeople({ limit: 0 });
    const { mutate: createKajian } = useCreateKajian();
    const { mutate: updateKajian } = useUpdateKajian(); 
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPosterRemoved, setIsPosterRemoved] = useState(false); // New State

    const { register, handleSubmit, reset, control, setError, clearErrors, formState: { errors } } = useForm<KajianFormValues>();

    const selectedType = useWatch({ control, name: 'type' });
    const selectedTimeMode = useWatch({ control, name: 'timeMode' });

    const handleReset = () => 
    {
        clearErrors();
        setIsPosterRemoved(false);
        
        const formatDate = (dateStr: string | undefined | null) => 
        {
            if (!dateStr) return format(new Date(), "yyyy-MM-dd'T'HH:mm");
            try 
            {
                return format(new Date(dateStr), "yyyy-MM-dd'T'HH:mm");
            } 
            catch (e) 
            {
                return format(new Date(), "yyyy-MM-dd'T'HH:mm");
            }
        };

        if (editingKajian) 
        {
            reset({
                title: editingKajian.title,
                speakerId: String(editingKajian.speakerId),
                type: editingKajian.type,
                status: String(editingKajian.status) as any, 
                date: formatDate(editingKajian.date),
                dayOfWeek: String(editingKajian.dayOfWeek ?? '1'),
                time: editingKajian.time ?? '20:00',
                timeMode: editingKajian.timeMode || 'manual',
                badaSholat: editingKajian.badaSholat || 'maghrib',
            });
            setPreviewUrl(editingKajian.posterUrl ? getImageUrl(editingKajian.posterUrl) : null);
        } 
        else 
        {
            reset({
                title: '',
                speakerId: '',
                date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                type: 'kajian_tematik',
                dayOfWeek: '1',
                time: '20:00',
                timeMode: 'manual',
                badaSholat: 'maghrib',
                status: 'true' as any
            });
            setPreviewUrl(null);
        }
    };

    useEffect(() => 
    {
        if (isOpen) 
        {
            handleReset();
        }
    }, [isOpen, editingKajian]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    {
        const file = e.target.files?.[0];
        if (file) 
        {
            setIsPosterRemoved(false);
            const objectUrl = URL.createObjectURL(file);
            
            const img = new Image();
            img.onload = () => 
            {
                if (img.height > img.width) 
                {
                    setError('poster', 
                    { 
                        type: 'manual', 
                        message: 'Poster must be landscape (width >= height)' 
                    });
                    if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    
                    e.target.value = ''; 
                    URL.revokeObjectURL(objectUrl); 
                } 
                else 
                {
                    clearErrors('poster');
                    if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(objectUrl);
                }
            };
            img.src = objectUrl;
        }
    };

    const handleRemovePoster = (e: React.MouseEvent) => 
    {
        e.preventDefault();
        e.stopPropagation(); 
        if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setIsPosterRemoved(true);
    };

    const onSubmit = (data: KajianFormValues) => 
    {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('speakerId', data.speakerId);
        formData.append('type', data.type);
        formData.append('status', String(data.status));
        
        if (data.type === 'kajian_rutin') 
        {
            formData.append('dayOfWeek', data.dayOfWeek || '1');
        } 
        else 
        {
            formData.append('date', new Date(data.date).toISOString());
        }

        // Time mode (snake_case for backend)
        formData.append('time_mode', data.timeMode || 'manual');
        if (data.timeMode === 'bada_sholat') 
        {
            formData.append('bada_sholat', data.badaSholat || 'maghrib');
        } 
        else 
        {
            formData.append('time', data.time || '00:00');
        }

        if (data.poster && data.poster.length > 0) 
        {
            formData.append('file', data.poster[0]);
        }
        else if (isPosterRemoved) 
        {
            formData.append('posterUrl', 'null'); 
        }

        const mutationOptions = 
        {
            onSuccess: () => 
            {
                onClose();
            },
            onError: (error: any) => handleFormError(error, setError)
        };

        if (editingKajian) 
        {
            updateKajian({ id: editingKajian.id, data: formData }, mutationOptions);
        } 
        else 
        {
            createKajian(formData, mutationOptions);
        }
    };

    const speakerOptions = useMemo(() => 
    {
        if (!people) return [];
        return people
            .filter((p: any) => p.type === 'ustadz' || p.type === 'pengurus' || p.type === 'jamaah')
            .map((p: any) => ({ value: String(p.id), label: p.name }));
    }, [people]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingKajian ? "Edit Event" : "Add New Event"} className="max-w-5xl">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: Inputs */}
                <div className="lg:col-span-8 space-y-5">
                    <Input 
                        label={<span>Title <span className="text-red-500">*</span></span>}
                        {...register('title', { required: 'Title is required' })} 
                        placeholder="e.g. Weekly Study"
                        error={errors.title?.message}
                        autoFocus
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 block">
                                Speaker <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                control={control}
                                name="speakerId"
                                rules={{ required: 'Speaker is required' }}
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        options={speakerOptions}
                                        value={value}
                                        onChange={onChange}
                                        error={errors.speakerId?.message}
                                        placeholder="-- Select Speaker --"
                                        searchable
                                    />
                                )}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 block">
                                Event Type <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                control={control}
                                name="type"
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        options={[
                                            { value: 'kajian_tematik', label: 'Thematic Study' },
                                            { value: 'kajian_rutin', label: 'Recurring Study' },
                                            { value: 'tabligh_akbar', label: 'Grand Gathering' }
                                        ]}
                                        value={value}
                                        onChange={onChange}
                                        error={errors.type?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        {selectedType === 'kajian_rutin' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 block">
                                        Day <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        control={control}
                                        name="dayOfWeek"
                                        rules={{ required: 'Day is required' }}
                                        render={({ field: { value, onChange } }) => (
                                            <Select
                                                options={DAYS}
                                                value={value}
                                                onChange={onChange}
                                                error={errors.dayOfWeek?.message}
                                            />
                                        )}
                                    />
                                </div>
                                <Input 
                                    label={<span>Date & Time (Optional)</span>}
                                    type="datetime-local" 
                                    {...register('date')} 
                                    error={errors.date?.message}
                                />
                            </div>
                        ) : (
                            <Input 
                                label={<span>Date & Time <span className="text-red-500">*</span></span>}
                                type="datetime-local" 
                                {...register('date', { required: 'Date is required' })} 
                                error={errors.date?.message}
                            />
                        )}
                    </div>

                    {/* Time Mode Section */}
                    <div className="space-y-3 pt-2">
                        <label className="text-sm font-medium text-slate-700 block">Waktu Kajian <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer p-2 px-4 rounded-lg hover:bg-slate-50 border border-transparent has-[:checked]:border-emerald-200 has-[:checked]:bg-emerald-50 transition-colors">
                                <input type="radio" value="manual" {...register('timeMode')} className="text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                                <span className="text-sm text-slate-700">Waktu Manual</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-2 px-4 rounded-lg hover:bg-slate-50 border border-transparent has-[:checked]:border-amber-200 has-[:checked]:bg-amber-50 transition-colors">
                                <input type="radio" value="bada_sholat" {...register('timeMode')} className="text-amber-600 focus:ring-amber-500 cursor-pointer" />
                                <span className="text-sm text-slate-700">Ba'da Sholat</span>
                            </label>
                        </div>
                        {selectedTimeMode === 'bada_sholat' ? (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 block">Setelah Sholat</label>
                                <Controller
                                    control={control}
                                    name="badaSholat"
                                    rules={{ required: selectedTimeMode === 'bada_sholat' ? 'Pilih waktu sholat' : false }}
                                    render={({ field: { value, onChange } }) => (
                                        <Select
                                            options={[
                                                { value: 'subuh', label: 'Subuh' },
                                                { value: 'dzuhur', label: 'Dzuhur' },
                                                { value: 'ashar', label: 'Ashar' },
                                                { value: 'maghrib', label: 'Maghrib' },
                                                { value: 'isya', label: 'Isya' },
                                            ]}
                                            value={value}
                                            onChange={onChange}
                                            error={errors.badaSholat?.message}
                                        />
                                    )}
                                />
                            </div>
                        ) : (
                            <Input 
                                label={<span>Jam <span className="text-red-500">*</span></span>}
                                type="time" 
                                {...register('time')} 
                                error={errors.time?.message}
                            />
                        )}
                    </div>

                    {editingKajian && (
                        <div className="mt-2">
                            <label className="text-sm font-medium text-slate-700 block mb-2">Status</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent has-[:checked]:border-emerald-200 has-[:checked]:bg-emerald-50 transition-colors">
                                    <input type="radio" value="true" {...register('status')} className="text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                                    <span className="text-sm text-slate-700">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent has-[:checked]:border-slate-300 has-[:checked]:bg-slate-100 transition-colors">
                                    <input type="radio" value="false" {...register('status')} className="text-slate-600 focus:ring-slate-500 cursor-pointer" />
                                    <span className="text-sm text-slate-700">Archived (Inactive)</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Poster */}
                <div className="lg:col-span-4 flex flex-col">
                    <label className="text-sm font-medium text-slate-700 block mb-2">Poster (Landscape)</label>
                    <div className={cn(
                        "border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative cursor-pointer group flex flex-col items-center justify-center h-full min-h-[200px]",
                        previewUrl ? "border-emerald-300 bg-emerald-50/30" : ""
                    )}>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                            {...register('poster', { onChange: handleFileChange })}
                        />
                        {previewUrl ? (
                            <div className="relative w-full group">
                                <img src={previewUrl} alt="Preview" className="w-full rounded shadow-sm object-contain max-h-[300px]" />
                                <button 
                                    type="button" 
                                    onClick={handleRemovePoster}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none z-20"
                                    title="Remove Poster"
                                >
                                    <X size={16} />
                                </button>
                                <p className="mt-2 text-xs text-emerald-600 font-medium select-none">Click to change image</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                <Upload className="w-10 h-10 mb-2" />
                                <span className="text-sm font-medium">Upload Poster</span>
                                <span className="text-xs text-slate-400 mt-1">Rec: 1920x1080px</span>
                            </div>
                        )}
                    </div>
                    {errors.poster && <p className="text-xs text-red-500 mt-1">{errors.poster.message}</p>}
                </div>

                {/* FOOTER */}
                <div className="lg:col-span-12 flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                    <ActionButton variant="secondary" onClick={handleReset} type="button" className="cursor-pointer">
                        Reset
                    </ActionButton>
                    <ActionButton variant="primary" type="submit" icon={null} className="cursor-pointer">
                        {editingKajian ? 'Save Changes' : 'Create Event'}
                    </ActionButton>
                </div>
            </form>
        </Modal>
    );
};