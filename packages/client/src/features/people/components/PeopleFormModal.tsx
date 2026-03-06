import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreatePerson, useUpdatePerson } from '../hooks';
import type { PeopleFormModalProps, Person } from '../types';
import { ActionButton } from '../../../components/ui/ActionButton';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { handleFormError } from '../../../utils/form-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPersonSchema } from '../schema';

export const PeopleFormModal = ({ isOpen, onClose, editingPerson }: PeopleFormModalProps) => 
{
    const createMutation = useCreatePerson();
    const updateMutation = useUpdatePerson();

    const { register, handleSubmit, reset, setError, clearErrors, control, formState: { errors } } = useForm<Person>({
        resolver: zodResolver(createPersonSchema as any),
        defaultValues: {
            name: '',
            type: 'jamaah',
            phoneNumber: '',
            address: '',
            status: true
        }
    });

    const handleReset = () => 
    {
        clearErrors(); 
        
        if (editingPerson) 
        {
            // Cast 'status' to string (true/false) for radio button matching
            reset({
               ...editingPerson,
               status: String(editingPerson.status) as any 
            }); 
        } 
        else 
        {
            reset({ 
                name: '',
                type: 'jamaah',
                phoneNumber: '',
                address: '',
                status: 'true' as any // active by default
            });
        }
    };

    useEffect(() => 
    {
        if (isOpen) 
        {
            handleReset();
        }
    }, [isOpen, editingPerson]);


    const onSubmit = (data: Person) => 
    {
        const payload = 
        {
            ...data,
            status: String(data.status) === 'true'
        };

        const mutationOptions = 
        {
            onSuccess: onClose,
            onError: (err: any) => handleFormError(err, setError)
        };

        if (editingPerson) 
        {
            updateMutation.mutate({ ...payload, id: editingPerson.id }, mutationOptions);
        } 
        else 
        {
            createMutation.mutate(payload, mutationOptions);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={editingPerson ? 'Edit Person' : 'Add New Person'}
        >
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
                <Input 
                    label="Full Name"
                    required
                    {...register('name')} 
                    placeholder="e.g. Ahmad Fulan"
                    error={errors.name?.message as string} 
                    autoFocus
                />

                <div className="space-y-1.5">
                    <div className="relative">
                        <Controller
                            control={control}
                            name="type"
                            render={({ field: { value, onChange } }) => (
                                <Select
                                    label="Role Type"
                                    required
                                    options={[
                                        { value: 'jamaah', label: 'Jamaah' },
                                        { value: 'ustadz', label: 'Ustadz' },
                                        { value: 'pengurus', label: 'Staff (Pengurus)' }
                                    ]}
                                    value={value}
                                    onChange={onChange}
                                    error={errors.type?.message as string}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="Phone Number"
                        {...register('phoneNumber')} 
                        placeholder="0812..." 
                        error={errors.phoneNumber?.message as string}
                    />
                    <Input 
                        label="Address"
                        {...register('address')} 
                        placeholder="Street address..." 
                        error={errors.address?.message as string}
                    />
                </div>

                {/* Status Field */}
                {editingPerson && (
                    <div className="mt-2">
                        <label className="text-sm font-medium text-slate-700 block mb-2">Status</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent has-checked:border-emerald-200 has-checked:bg-emerald-50 transition-colors">
                                <input type="radio" value="true" {...register('status')} className="text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                                <span className="text-sm text-slate-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent has-checked:border-slate-300 has-checked:bg-slate-100 transition-colors">
                                <input type="radio" value="false" {...register('status')} className="text-slate-600 focus:ring-slate-500 cursor-pointer" />
                                <span className="text-sm text-slate-700">Archived (Inactive)</span>
                            </label>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 mt-6">
                    <ActionButton variant="secondary" onClick={handleReset} type="button" className="cursor-pointer">
                        Reset
                    </ActionButton>
                    <ActionButton variant="primary" type="submit" className="cursor-pointer" icon={null}>
                        Submit
                    </ActionButton>
                </div>
            </form>
        </Modal>
    );
};