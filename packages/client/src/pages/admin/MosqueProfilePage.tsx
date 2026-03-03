import { useForm, Controller } from 'react-hook-form';
import { useMosqueProfile, useUpdateMosqueProfile } from '../../features/mosque/hooks';
import type { UpdateMosqueProfileDto } from '../../features/mosque/types';
import { useEffect, useState } from 'react';
import { useLoadingStore } from '../../store/useLoadingStore';
import { Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { ActionButton } from '../../components/ui/ActionButton';
import { handleFormError } from '../../utils/form-error';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { FormItem } from '../../components/ui/FormLayout';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/axios';

const uploadFile = async (file: File): Promise<string> => 
{
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{ data: { url: string } }>('/upload', formData);

    return data.data.url;
};

export const MosqueProfilePage = () => 
{
    const { data: profile, isLoading } = useMosqueProfile();
    const updateMutation = useUpdateMosqueProfile();
    
    const [logoFile, setLogoFile]       = useState<File | null>(null);
    const [qrisFile, setQrisFile]       = useState<File | null>(null);

    const { register, control, handleSubmit, reset, setError, formState: { errors, isDirty } } = useForm<UpdateMosqueProfileDto>();

    useEffect(() => 
    {
        if (isLoading) {
            useLoadingStore.getState().showLoading('Loading profile...');
        } else {
            useLoadingStore.getState().hideLoading();
        }

        if (profile) 
        {
            reset({
                name: profile.name,
                address: profile.address,
                bankName: profile.bankName || '',
                bankAccountName: profile.bankAccountName || '',
                bankAccountNumber: profile.bankAccountNumber || '',
                logoUrl: profile.logoUrl || '',
                qrisUrl: profile.qrisUrl || '',
            });
        }
    }, [profile, reset, isLoading]);

    const onSubmit = async (data: UpdateMosqueProfileDto) => 
    {
        useLoadingStore.getState().showLoading('Saving profile...');
        try {
            let finalLogoUrl: string | null | undefined = data.logoUrl;
            let finalQrisUrl: string | null | undefined = data.qrisUrl;

            if (logoFile) 
            {
                finalLogoUrl = await uploadFile(logoFile);
            }
            else if (logoFile === null && data.logoUrl === '') 
            {
               finalLogoUrl = null;
            }

            if (qrisFile) 
            {
                finalQrisUrl = await uploadFile(qrisFile);
            }
            else if (qrisFile === null && data.qrisUrl === '') 
            {
               finalQrisUrl = null;
            }

            const payload = 
            {
                ...data,
                logoUrl: finalLogoUrl,
                qrisUrl: finalQrisUrl,
            };

            await updateMutation.mutateAsync(payload);
            
            toast.success("Profile successfully updated!");
            
            setLogoFile(null);
            setQrisFile(null);
            
            reset(payload);

        } 
        catch (err: any) 
        {
            console.error(err);
            handleFormError(err, setError);
        } 
        finally 
        {
            useLoadingStore.getState().hideLoading();
        }
    };

    if (isLoading) 
    {
        return null; // hide behind overlay
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mosque Profile</h1>
                    <p className="text-slate-500">Basic information about your mosque.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
                            <FormItem 
                                label="Mosque Name" 
                                required 
                                error={errors.name?.message}
                            >
                                <Input
                                    id="name"
                                    placeholder="Example: Al-Ikhlas Mosque"
                                    {...register('name', { required: 'Mosque name is required' })}
                                />
                            </FormItem>

                            <FormItem 
                                label="Full Address" 
                                required 
                                error={errors.address?.message}
                            >
                                <textarea
                                    id="address"
                                    rows={3}
                                    {...register('address', { required: 'Address is required' })}
                                    className={cn(
                                        "flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                        "resize-none"
                                    )}
                                    placeholder="123 Main Street..."
                                />
                            </FormItem>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
                             <h3 className="text-lg font-medium text-slate-900">Bank Information</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormItem error={errors.bankName?.message}>
                                    <Input
                                        id="bankName"
                                        placeholder="Bank Name (e.g. BSI, BCA)"
                                        {...register('bankName')}
                                    />
                                </FormItem>
                                <FormItem error={errors.bankAccountName?.message}>
                                    <Input
                                        id="bankAccountName"
                                        placeholder="Account Name (Optional)"
                                        {...register('bankAccountName')}
                                    />
                                </FormItem>
                                <div className="md:col-span-2">
                                     <FormItem error={errors.bankAccountNumber?.message}>
                                         <Input
                                            id="bankAccountNumber"
                                            placeholder="Account Number (e.g. 12345678)"
                                            {...register('bankAccountNumber')}
                                        />
                                     </FormItem>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Images */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
                             <h3 className="text-lg font-medium text-slate-900">Branding & Qris</h3>
                             <FormItem error={errors.logoUrl?.message}>
                                <Controller
                                    control={control}
                                    name="logoUrl"
                                    render={({ field }) => (
                                        <ImageUpload 
                                            label="Mosque Logo"
                                            value={logoFile || field.value} 
                                            onChange={(file) => {
                                                setLogoFile(file);
                                                if (file) 
                                                {
                                                    field.onChange(field.value);
                                                } 
                                                else 
                                                {
                                                    field.onChange('');
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </FormItem>

                             <FormItem error={errors.qrisUrl?.message}>
                                <Controller
                                    control={control}
                                    name="qrisUrl" 
                                    render={({ field }) => (
                                        <ImageUpload 
                                            label="QRIS Code"
                                            value={qrisFile || field.value}
                                            onChange={(file) => {
                                                setQrisFile(file);
                                                if (file) 
                                                {
                                                    field.onChange(field.value);
                                                } 
                                                else 
                                                {
                                                    field.onChange('');
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                      <ActionButton 
                        variant="secondary" 
                        onClick={() => 
                        {
                            reset();
                            setLogoFile(null);
                            setQrisFile(null);
                        }} 
                        type="button"
                        disabled={(!isDirty && !logoFile && !qrisFile)}
                    >
                        Reset
                    </ActionButton>
                    
                    <ActionButton 
                        variant="primary" 
                        icon={<Save className="w-4 h-4" />} 
                        type="submit"
                        disabled={!isDirty && !logoFile && !qrisFile}
                    >
                        Save Changes
                    </ActionButton>
                </div>
            </form>
        </div>
    );
};
