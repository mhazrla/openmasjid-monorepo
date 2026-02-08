
import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useKajianEvents, useCreateKajian, useDeleteKajian, KajianEvent } from '../../features/kajian/hooks';
import { usePeople } from '../../features/people/hooks';
import { ActionButton } from '../../components/ui/ActionButton';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Trash2, Plus, Calendar as CalIcon, Upload, ImageIcon, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const KajianManager = () => {
    const { data: events, isLoading } = useKajianEvents();
    const { data: people } = usePeople(); // Fetch all people (ustadz needed)
    const { mutate: createKajian, isPending: isCreating } = useCreateKajian();
    const { mutate: deleteKajian } = useDeleteKajian();

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            speakerId: '',
            date: format(new Date(), 'yyyy-MM-ddTHH:mm'), // DateTimeLocal format
            type: 'tematik',
            poster: null as FileList | null
        }
    });

    const onSubmit = (data: any) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('speakerId', data.speakerId); // Backend expects number, but string parser handles it or frontend ensures
        formData.append('date', new Date(data.date).toISOString());
        formData.append('type', data.type);
        
        if (data.poster && data.poster.length > 0) {
            formData.append('file', data.poster[0]); // Backend looks for 'file' field type
        }

        createKajian(formData, {
            onSuccess: () => {
                toast.success('Event Created!');
                reset();
                setPreviewUrl(null);
            },
            onError: () => toast.error('Failed to create event')
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure?')) {
            deleteKajian(id, { onSuccess: () => toast.success('Deleted') });
        }
    }

    const speakerOptions = useMemo(() => {
        if (!people) return [];
        // Filter or keep logic. Ideally backend filters, but simple list is fine.
        return people.map(p => ({ value: p.id, label: p.name }));
    }, [people]);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Kajian Manager</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-emerald-600" /> New Event
                        </h2>
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input label="Title" {...register('title', { required: true })} placeholder="e.g. Kajian Rutin" />
                            
                            <Select 
                                label="Speaker"
                                options={speakerOptions}
                                {...register('speakerId', { required: true })}
                            >
                                <option value="">-- Select Speaker --</option>
                            </Select>

                            <Input 
                                label="Date & Time" 
                                type="datetime-local" 
                                {...register('date', { required: true })} 
                            />

                            <Select 
                                label="Type"
                                options={[
                                    { value: 'subuh', label: 'Kajian Subuh' },
                                    { value: 'tematik', label: 'Kajian Tematik' },
                                    { value: 'tabligh_akbar', label: 'Tabligh Akbar' }
                                ]}
                                {...register('type')}
                            />

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Poster Image</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        {...register('poster', { onChange: handleFileChange })}
                                    />
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded shadow-sm" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400">
                                            <Upload className="w-8 h-8 mb-2" />
                                            <span className="text-xs">Click to upload poster</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ActionButton 
                                type="submit" 
                                isLoading={isCreating} 
                                className="w-full justify-center"
                                variant="primary"
                            >
                                Create Event
                            </ActionButton>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                         <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900">Upcoming Events</h3>
                        </div>
                        <div className="overflow-auto max-h-[600px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3">Poster</th>
                                        <th className="px-4 py-3">Event Details</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr><td colSpan={4} className="p-8 text-center">Loading...</td></tr>
                                    ) : events?.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-400">No events found.</td></tr>
                                    ) : (
                                        events?.map((ev) => (
                                            <tr key={ev.id} className="hover:bg-slate-50 group">
                                                <td className="px-4 py-3 w-24">
                                                    {ev.posterUrl ? (
                                                        <img src={`${import.meta.env.VITE_API_URL}${ev.posterUrl}`} alt="Poster" className="w-16 h-16 object-cover rounded-md border border-slate-200" />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center text-slate-300">
                                                            <ImageIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-slate-900 text-base">{ev.title}</div>
                                                    <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                                                        <User className="w-3.5 h-3.5" />
                                                        {ev.speaker?.name || 'Unknown Speaker'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium mt-1">
                                                        <CalIcon className="w-3.5 h-3.5" />
                                                        {format(new Date(ev.date), 'dd MMM yyyy, HH:mm')}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase">
                                                        {ev.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button 
                                                        onClick={() => handleDelete(ev.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
