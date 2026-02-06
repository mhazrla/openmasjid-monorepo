import { useForm, Controller } from 'react-hook-form';
import { useMosqueProfile, useUpdateMosqueProfile } from '../../features/mosque/hooks';
import type { UpdateMosqueProfileDto } from '../../features/mosque/types';
import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { ActionButton } from '../../components/ui/ActionButton';
import { handleFormError } from '../../utils/form-error';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { FormItem, FormSection } from '../../components/ui/FormLayout';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/axios';

const uploadFile = async (file: File): Promise<string> => 
{
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{ url: string }>('/upload', formData, 
    {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.url;
};

export const MosqueProfilePage = () => 
{
    const { data: profile, isLoading } = useMosqueProfile();
    const updateMutation = useUpdateMosqueProfile();
    
    const [logoFile, setLogoFile]       = useState<File | null>(null);
    const [qrisFile, setQrisFile]       = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { register, control, handleSubmit, reset, setError, formState: { errors, isDirty } } = useForm<UpdateMosqueProfileDto>();

    useEffect(() => 
    {
        if (profile) 
        {
            reset({
                name: profile.name,
                address: profile.address,
                bankAccountNumber: profile.bankAccountNumber || '',
                logoUrl: profile.logoUrl || '',
                qrisUrl: profile.qrisUrl || '',
            });
        }
    }, [profile, reset]);

    const onSubmit = async (data: UpdateMosqueProfileDto) => 
    {
        setIsUploading(true);
        try {
            let finalLogoUrl = data.logoUrl;
            let finalQrisUrl = data.qrisUrl;

            if (logoFile) 
            {
                finalLogoUrl = await uploadFile(logoFile);
            }
            else if (logoFile === null && data.logoUrl === '') 
            {
               finalLogoUrl = '';
            }

            if (qrisFile) 
            {
                finalQrisUrl = await uploadFile(qrisFile);
            }
            else if (qrisFile === null && data.qrisUrl === '') 
            {
               finalQrisUrl = '';
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
            setIsUploading(false);
        }
    };

    if (isLoading) 
    {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mosque Profile</h1>
                    <p className="text-slate-500">Basic information about your mosque.</p>
                </div>
            </div>

            <FormSection>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <FormItem 
                        label="Bank Account / Donation Info (Optional)" 
                        description="Will be displayed on running text or donation info."
                    >
                        <Input
                            id="bank"
                            placeholder="BSI 12345678 a.n DKM..."
                            {...register('bankAccountNumber')}
                        />
                    </FormItem>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                         <ActionButton 
                            variant="secondary" 
                            onClick={() => 
                            {
                                reset();
                                setLogoFile(null);
                                setQrisFile(null);
                            }} 
                            type="button"
                            disabled={(!isDirty && !logoFile && !qrisFile) || isUploading}
                        >
                            Cancel
                        </ActionButton>
                        
                        <ActionButton 
                            variant="primary" 
                            icon={<Save className="w-4 h-4" />} 
                            isLoading={isUploading || updateMutation.isPending} 
                            type="submit"
                            disabled={!isDirty && !logoFile && !qrisFile}
                        >
                            {isUploading ? 'Uploading...' : 'Save Changes'}
                        </ActionButton>
                    </div>
                </form>
            </FormSection>
        </div>
    );
};
