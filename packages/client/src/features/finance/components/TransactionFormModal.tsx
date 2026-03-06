import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
    useCreateTransaction, 
    useUpdateTransaction, 
    useAccounts,
    useSuggestions 
} from '../hooks';
import type { Transaction } from '../types';
import { ActionButton } from '../../../components/ui/ActionButton';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { handleFormError } from '../../../utils/form-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransactionSchema } from '../schema';

const getLocalDatetimeString = (dateStr?: string | Date) => 
{
    const date = dateStr ? new Date(dateStr) : new Date();
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export interface TransactionFormModalProps 
{
    isOpen: boolean;
    onClose: () => void;
    editingTx: Transaction | null;
}

export const TransactionFormModal = ({ isOpen, onClose, editingTx }: TransactionFormModalProps) => 
{
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();
    const { data: accounts = [] } = useAccounts();

    const [descQuery, setDescQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const { data: suggestions = [] } = useSuggestions(descQuery);
    const suggestionRef = useRef<HTMLDivElement>(null);

    const { register, handleSubmit, reset, setValue, watch, setError, clearErrors, control, formState: { errors } } = useForm<Transaction>({
        resolver: zodResolver(createTransactionSchema as any),
        defaultValues: {
            date: getLocalDatetimeString(),
            type: 'income',
            fundCategory: 'operasional',
            accountId: accounts.length > 0 ? accounts[0].id : ('' as any),
            amount: 0,
            description: ''
        }
    });

    const watchDesc = watch('description');

    useEffect(() => 
    {
        const delay = setTimeout(() => 
        {
            if (watchDesc !== descQuery) 
            {
                setDescQuery(watchDesc || '');
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [watchDesc]);

    useEffect(() => 
    {
        const handleClickOutside = (event: MouseEvent) => 
        {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) 
            {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleReset = () => 
    {
        clearErrors(); 
        
        if (editingTx) 
        {
            reset({
               ...editingTx,
               date: getLocalDatetimeString(editingTx.date),
            }); 
            setDescQuery(editingTx.description);
        } 
        else 
        {
            reset({ 
                date: getLocalDatetimeString(),
                type: 'income',
                fundCategory: 'operasional',
                accountId: accounts.length > 0 ? accounts[0].id : ('' as any),
                amount: 0,
                description: ''
            });
            setDescQuery('');
        }
    };

    useEffect(() => 
    {
        if (isOpen) 
        {
            handleReset();
        }
    }, [isOpen, editingTx, accounts]);

    const onSubmit = (data: Transaction) => 
    {
        const payload = 
        {
            date: new Date(data.date).toISOString(),
            type: data.type,
            amount: Number(data.amount),
            description: data.description,
            fundCategory: data.fundCategory,
            accountId: Number(data.accountId)
        };

        const mutationOptions = 
        {
            onSuccess: onClose,
            onError: (err: any) => handleFormError(err, setError)
        };

        if (editingTx) 
        {
            updateMutation.mutate({ ...payload, id: editingTx.id }, mutationOptions);
        } 
        else 
        {
            createMutation.mutate(payload, mutationOptions);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const accountOptions = accounts
        .map(a => ({ value: a.id.toString(), label: a.name }));

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={editingTx ? 'Edit Transaction' : 'Add Transaction'}
        >
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        type="datetime-local"
                        label="Date"
                        required
                        {...register('date')} 
                        error={errors.date?.message as string} 
                    />

                    <div className="space-y-1.5">
                        <Controller
                            control={control}
                            name="type"
                            render={({ field: { value, onChange } }) => (
                                <Select
                                    label="Transaction Type"
                                    required
                                    options={[
                                        { value: 'income', label: 'Income' },
                                        { value: 'expense', label: 'Expense' }
                                    ]}
                                    value={value}
                                    onChange={(v) => onChange(v)}
                                    error={errors.type?.message as string}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Controller
                            control={control}
                            name="fundCategory"
                            render={({ field: { value, onChange } }) => (
                                <Select
                                    label="Fund Category"
                                    required
                                    options={[
                                        { value: 'operasional', label: 'Operasional Masjid' },
                                        { value: 'yatim', label: 'Yatim & Dhuafa' },
                                        { value: 'pembangunan', label: 'Pembangunan' },
                                        { value: 'ramadhan', label: 'Program Khusus / Ramadhan' }
                                    ]}
                                    value={value}
                                    onChange={(v) => onChange(v as any)}
                                    error={errors.fundCategory?.message as string}
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Controller
                            control={control}
                            name="accountId"
                            render={({ field: { value, onChange } }) => (
                                <Select
                                    label="Cash Account"
                                    required
                                    options={accountOptions}
                                    value={value?.toString()}
                                    onChange={(v) => onChange(Number(v))}
                                    error={errors.accountId?.message as string}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Controller
                        control={control}
                        name="amount"
                        render={({ field: { value, onChange, onBlur } }) => 
                        {
                            const displayValue = value ? new Intl.NumberFormat('id-ID').format(value) : '';

                            return (
                                <Input
                                    type="text"
                                    label="Amount (Rp)"
                                    required
                                    placeholder="0"
                                    value={displayValue}
                                    onChange={(e) => 
                                    {
                                        const rawValue = e.target.value.replace(/\D/g, '');
                                        onChange(rawValue ? Number(rawValue) : 0);
                                    }}
                                    onBlur={onBlur}
                                    error={errors.amount?.message as string}
                                />
                            );
                        }}
                    />
                </div>

                <div className="relative" ref={suggestionRef}>
                    <Input 
                        label="Description"
                        required
                        {...register('description')} 
                        placeholder="e.g. Electricity bill, Donations..."
                        error={errors.description?.message as string} 
                        autoComplete="off"
                        onFocus={() => setShowSuggestions(true)}
                    />
                    
                    {/* Autocomplete Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-slate-200 max-h-48 overflow-auto">
                            <ul className="py-1">
                                {suggestions.map((suggestion, idx) => (
                                    <li 
                                        key={idx}
                                        className="px-3 py-2 hover:bg-emerald-50 cursor-pointer text-sm text-slate-700"
                                        onClick={() => 
                                        {
                                            setValue('description', suggestion);
                                            setDescQuery(suggestion);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <ActionButton variant="secondary" onClick={handleReset} type="button" className="cursor-pointer">
                        Reset
                    </ActionButton>
                    <ActionButton variant="primary" type="submit" disabled={isSubmitting} className="cursor-pointer">
                        Submit
                    </ActionButton>
                </div>
            </form>
        </Modal>
    );
};
