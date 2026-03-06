import { useForm, Controller } from 'react-hook-form';
import { useMosqueProfile, useUpdateMosqueProfile } from '../../features/mosque/hooks';
import type { UpdateMosqueProfileDto } from '../../features/mosque/types';
import { useEffect, useState } from 'react';
import { useLoadingStore } from '../../store/useLoadingStore';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { ActionButton } from '../../components/ui/ActionButton';
import { handleFormError } from '../../utils/form-error';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { FormItem } from '../../components/ui/FormLayout';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateMosqueProfileSchema } from '../../features/mosque/schema';

export const MosqueProfilePage = () => 
{
    const { data: profile, isLoading } = useMosqueProfile();
    const updateMutation = useUpdateMosqueProfile();
    
    const [logoFile, setLogoFile]       = useState<File | null>(null);
    const [qrisFile, setQrisFile]       = useState<File | null>(null);

    const { register, control, handleSubmit, reset, setError, formState: { errors, isDirty } } = useForm<UpdateMosqueProfileDto>({
        resolver: zodResolver(updateMosqueProfileSchema as any)
    });

    useEffect(() => 
    {
        if (isLoading) 
        {
            useLoadingStore.getState().showLoading('Loading profile...');
        } 
        else 
        {
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
            const formData = new FormData();
            
            formData.append('name', data.name || '');
            formData.append('address', data.address || '');
            formData.append('bankName', data.bankName || '');
            formData.append('bankAccountName', data.bankAccountName || '');
            formData.append('bankAccountNumber', data.bankAccountNumber || '');
            
            // Handle logo
            if (logoFile) 
            {
                formData.append('logoFile', logoFile);
            }
            else if (logoFile === null && data.logoUrl === '') 
            {
               formData.append('logoUrl', '');
            }

            // Handle qris
            if (qrisFile) 
            {
                formData.append('qrisFile', qrisFile);
            }
            else if (qrisFile === null && data.qrisUrl === '') 
            {
               formData.append('qrisUrl', '');
            }

            await updateMutation.mutateAsync(formData as any);
            
            toast.success("Profile successfully updated!");
            
            setLogoFile(null);
            setQrisFile(null);
            
            reset(data);

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
        return null;
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
                                    {...register('name')}
                                />
                            </FormItem>

                            <Textarea
                                id="address"
                                label="Full Address"
                                required
                                error={errors.address?.message}
                                rows={3}
                                {...register('address')}
                                placeholder="123 Main Street..."
                            />
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
                                            onChange={(file) => 
                                            {
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
                                            onChange={(file) => 
                                            {
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
