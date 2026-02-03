import { useForm } from 'react-hook-form';
import { useMosqueProfile, useUpdateMosqueProfile } from '../../features/mosque/hooks';
import type { UpdateMosqueProfileDto } from '../../features/mosque/types';
import { useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

// Reusable Styles (DRY Principle)
const INPUT_CLASS = "flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const TEXTAREA_CLASS = "flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const MosqueProfilePage = () => 
{
    const { data: profile, isLoading } = useMosqueProfile();
    const updateMutation = useUpdateMosqueProfile();
    
    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<UpdateMosqueProfileDto>();

    useEffect(() => 
    {
        if (profile) 
        {
            reset({
                name: profile.name,
                address: profile.address,
                bankAccountNumber: profile.bankAccountNumber || '',
            });
        }
    }, [profile, reset]);

    const onSubmit = (data: UpdateMosqueProfileDto) => 
    {
        updateMutation.mutate(data, 
        {
            onSuccess: () => 
            {
                toast.success("Profile successfully updated!");
                reset({ ...data });
            },
            onError: (err: any) => 
            {
                console.error("Save Error:", err);
                const errorMessage = err.response?.data?.message || err.message || "Failed to save data.";
                
                toast.error(errorMessage);
            }
        });
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

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Nama Masjid */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-700">Mosque Name</label>
                        <input
                            id="name"
                            type="text"
                            {...register('name', { required: 'Mosque name is required' })}
                            className={cn(INPUT_CLASS, errors.name && "border-red-500 focus:ring-red-500")}
                            placeholder="Example: Al-Ikhlas Mosque"
                        />
                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </div>

                    {/* Alamat */}
                    <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-medium text-slate-700">Full Address</label>
                        <textarea
                            id="address"
                            rows={3}
                            {...register('address', { required: 'Address is required' })}
                            className={cn(TEXTAREA_CLASS, errors.address && "border-red-500 focus:ring-red-500")}
                            placeholder="123 Main Street..."
                        />
                        {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
                    </div>

                    {/* No Rekening */}
                    <div className="space-y-2">
                        <label htmlFor="bank" className="text-sm font-medium text-slate-700">Bank Account / Donation Info (Optional)</label>
                        <input
                            id="bank"
                            type="text"
                            {...register('bankAccountNumber')}
                            className={INPUT_CLASS}
                            placeholder="BSI 12345678 a.n DKM..."
                        />
                        <p className="text-xs text-slate-500">Will be displayed on running text or donation info.</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                         <button
                            type="button"
                            onClick={() => reset()}
                            disabled={!isDirty || updateMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isDirty || updateMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {updateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
