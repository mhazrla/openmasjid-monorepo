import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ActionButton } from '../../../components/ui/ActionButton';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Upload, X } from 'lucide-react';
import { cn, getImageUrl } from '../../../lib/utils';
import { useLoadingStore } from '../../../store/useLoadingStore';
import { useCreateAlbum, useUpdateAlbum } from '../hooks';
import type { ArchiveFormModalProps, ArchiveFormValues, CreateArchiveAlbumRequest } from '../types';

export const ArchiveFormModal = ({ isOpen, onClose, album }: ArchiveFormModalProps) => 
{
    const { mutate: createAlbum } = useCreateAlbum();
    const { mutate: updateAlbum } = useUpdateAlbum();

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isRemovingCover, setIsRemovingCover] = useState(false);

    const { register, handleSubmit, reset, clearErrors, formState: { errors } } = useForm<ArchiveFormValues>();

    const handleReset = () => 
    {
        clearErrors();
        setIsRemovingCover(false);
        if (album) 
        {
            reset({
                title: album.title,
                description: album.description || '',
                category: album.category || 'Lainnya',
                eventDate: album.eventDate ? new Date(album.eventDate).toISOString().split('T')[0] : '',
                isFeatured: album.isFeatured ? 'true' : 'false',
            });
            setPreviewUrl(album.coverImageUrl ? getImageUrl(album.coverImageUrl) : null);
        } 
        else 
        {
            reset({
                title: '',
                description: '',
                category: 'Lainnya',
                eventDate: '',
                isFeatured: 'false',
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
    }, [isOpen, album]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    {
        const file = e.target.files?.[0];
        if (file) 
        {
            const objectUrl = URL.createObjectURL(file);
            if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(objectUrl);
        }
    };

    const handleRemoveCover = (e: React.MouseEvent) => 
    {
        e.preventDefault();
        e.stopPropagation(); 
        if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setIsRemovingCover(true);
    };

    const onSubmit = (data: ArchiveFormValues) => 
    {
        submitWithUpload(data);
    };

    const submitWithUpload = async (data: ArchiveFormValues) => 
    {
         let finalCoverImageUrl: string | null | undefined = album?.coverImageUrl;
         
         if (data.coverImage && data.coverImage.length > 0) 
         {
             const formData = new FormData();
             formData.append('file', data.coverImage[0]);
             
             try 
             {
                 useLoadingStore.getState().showLoading('Uploading cover image...');
                 const { api } = await import('../../../lib/axios');
                 const uploadRes = await api.post<{ data: { url: string } }>('/upload', formData);
                 finalCoverImageUrl = uploadRes.data.data.url;
             } 
             catch (err) 
             {
                 useLoadingStore.getState().hideLoading();
                 console.error('Failed to upload cover', err);
                 return;
             }
         }
         else if (isRemovingCover)
         {
             finalCoverImageUrl = null;
         }

         const payload: Partial<CreateArchiveAlbumRequest> = {
             title: data.title,
             description: data.description || undefined,
             category: data.category || undefined,
             eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
             isFeatured: data.isFeatured === 'true',
             coverImageUrl: finalCoverImageUrl === null ? null : (finalCoverImageUrl || undefined)
         };

         if (album) 
         {
             updateAlbum({ id: album.id, payload }, { onSuccess: () => onClose() });
         } 
         else 
         {
             createAlbum(payload as CreateArchiveAlbumRequest, { onSuccess: () => onClose() });
         }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={album ? "Edit Album Information" : "Add New Album"} className="max-w-4xl">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: Inputs */}
                <div className="lg:col-span-8 space-y-5">
                    <Input 
                        label={<span>Album Title <span className="text-red-500">*</span></span>}
                        {...register('title', { required: 'Title is required' })} 
                        placeholder="e.g. Idul Fitri 1445 H"
                        error={errors.title?.message}
                        autoFocus
                    />
                    
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">Description</label>
                        <textarea
                            {...register('description')}
                            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 resize-none"
                            rows={3}
                            placeholder="Optional album description..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">Category</label>
                        <select
                            {...register('category')}
                            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        >
                            <option value="Kajian">Kajian</option>
                            <option value="Ramadhan">Ramadhan</option>
                            <option value="Sosial">Sosial</option>
                            <option value="Jumat">Jumat</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input 
                            label={<span>Event Date</span>}
                            type="date" 
                            {...register('eventDate')} 
                            error={errors.eventDate?.message}
                        />

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 block">Featured Album</label>
                            <div className="flex items-center gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent has-checked:border-emerald-200 has-checked:bg-emerald-50 transition-colors">
                                    <input type="radio" value="true" {...register('isFeatured')} className="text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                                    <span className="text-sm text-slate-700">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent has-checked:border-slate-300 has-checked:bg-slate-100 transition-colors">
                                    <input type="radio" value="false" {...register('isFeatured')} className="text-slate-600 focus:ring-slate-500 cursor-pointer" />
                                    <span className="text-sm text-slate-700">No</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Cover Image */}
                <div className="lg:col-span-4 flex flex-col">
                    <label className="text-sm font-medium text-slate-700 block mb-2">Cover Image</label>
                    <div className={cn(
                        "border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative cursor-pointer group flex flex-col items-center justify-center h-full min-h-[200px]",
                        previewUrl ? "border-emerald-300 bg-emerald-50/30" : ""
                    )}>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                            {...register('coverImage', { onChange: handleFileChange })}
                        />
                        {previewUrl ? (
                            <div className="relative w-full group">
                                <img src={previewUrl} alt="Preview" className="w-full rounded shadow-sm object-cover aspect-video" />
                                <button 
                                    type="button" 
                                    onClick={handleRemoveCover}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none z-20"
                                    title="Remove Cover"
                                >
                                    <X size={16} />
                                </button>
                                <p className="mt-2 text-xs text-emerald-600 font-medium select-none">Click to change cover</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                <Upload className="w-10 h-10 mb-2" />
                                <span className="text-sm font-medium">Upload Cover</span>
                                <span className="text-xs text-slate-400 mt-1">Rec: Landscape</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="lg:col-span-12 flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                    <ActionButton variant="secondary" onClick={handleReset} type="button" className="cursor-pointer">
                        Reset
                    </ActionButton>
                    <ActionButton variant="primary" type="submit" icon={null} className="cursor-pointer">
                        {album ? 'Save Changes' : 'Create Album'}
                    </ActionButton>
                </div>
            </form>
        </Modal>
    );
};
