import { useForm } from 'react-hook-form';
import { useCreateShortlink, useUpdateShortlink } from '../hooks';
import type { CreateShortlinkRequests, ShortlinkFormModalProps, UpdateShortlinkRequests } from '../types';
import { ActionButton } from '../../../components/ui/ActionButton';
import { Input } from '../../../components/ui/Input';
import { FormItem } from '../../../components/ui/FormLayout';
import { Modal } from '../../../components/ui/Modal';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

import { handleFormError } from '../../../utils/form-error';

export const ShortlinkFormModal = ({ isOpen, onClose, editingShortlink }: ShortlinkFormModalProps) => 
{
    const createMutation = useCreateShortlink();
    const updateMutation = useUpdateShortlink();
    const { register, handleSubmit, reset, setError, setValue, clearErrors, formState: { errors } } = useForm<CreateShortlinkRequests>();

    const isEditing = !!editingShortlink;

    const handleReset = () => 
    {
        clearErrors();
        if (editingShortlink) 
        {
            setValue('slug', editingShortlink.slug);
            setValue('originalUrl', editingShortlink.originalUrl);
            setValue('description', editingShortlink.description || '');
        } 
        else 
        {
            reset({
                slug: '',
                originalUrl: '',
                description: ''
            });
        }
    };

    useEffect(() => 
    {
        if (isOpen) 
        {
            handleReset();
        }
    }, [isOpen, editingShortlink, reset, setValue]);

    const onSubmit = (data: CreateShortlinkRequests) => 
    {
        const payload = {
            ...data,
            slug: data.slug.toLowerCase()
        };

        if (isEditing && editingShortlink) 
        {
             const updatePayload: UpdateShortlinkRequests = {
                 id: editingShortlink.id,
                 ...payload
             };

             updateMutation.mutate(updatePayload, 
             {
                 onSuccess: () => 
                 {
                     toast.success('Shortlink updated successfully!');
                     onClose();
                 },
                 onError: (err) => 
                 {
                     handleFormError(err, setError);
                 }
             });
        }
        else 
        {
            createMutation.mutate(payload, 
            {
                onSuccess: () => 
                {
                    toast.success('Shortlink created successfully!');
                    onClose();
                },
                onError: (err) => 
                {
                    handleFormError(err, setError);
                }
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Shortlink" : "Add New Shortlink"}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormItem 
                    label="Slug" 
                    required 
                    error={errors.slug?.message} 
                    description="Short URL identifier."
                >
                    <Input
                        placeholder="e.g. infaq"
                        autoComplete="off"
                        {...register('slug', { 
                            required: 'Slug is required',
                            pattern: { value: /^[a-z0-9-]+$/, message: 'Only lowercase letters, numbers, and dashes.' }
                        })}
                    />
                </FormItem>

                <FormItem 
                    label="Original URL" 
                    required 
                    error={errors.originalUrl?.message}
                >
                    <Input
                        placeholder="https://..."
                        autoComplete="off"
                        {...register('originalUrl', { 
                            required: 'Original URL is required',
                            pattern: { value: /^https?:\/\/.+/, message: 'Must be a valid URL starting with http/https' }
                        })}
                    />
                </FormItem>

                <FormItem label="Description" className="space-y-1.5">
                    <textarea
                        className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        rows={3}
                        {...register('description')}
                    />
                </FormItem>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    <ActionButton variant="secondary" onClick={handleReset} type="button" className="cursor-pointer">
                        Reset
                    </ActionButton>
                    <ActionButton variant="primary" type="submit"  
                        icon={isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        className="cursor-pointer"
                    >
                        {isEditing ? 'Save Changes' : 'Create Shortlink'}
                    </ActionButton>
                </div>
            </form>
        </Modal>
    );
};