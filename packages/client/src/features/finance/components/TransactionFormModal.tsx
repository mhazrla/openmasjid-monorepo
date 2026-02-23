import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
    useCreateTransaction, 
    useUpdateTransaction, 
    useCategories, 
    useAccounts,
    useSuggestions 
} from '../hooks';
import type { Transaction } from '../types';
import { ActionButton } from '../../../components/ui/ActionButton';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { handleFormError } from '../../../utils/form-error';

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
    const { data: categories = [] } = useCategories();

    const [descQuery, setDescQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const { data: suggestions = [] } = useSuggestions(descQuery);
    const suggestionRef = useRef<HTMLDivElement>(null);

    const { register, handleSubmit, reset, setValue, watch, setError, clearErrors, control, formState: { errors } } = useForm<Transaction>({
        defaultValues: {
            date: new Date().toISOString().slice(0, 16),
            type: 'debit',
            categoryId: '' as any,
            accountId: accounts.length > 0 ? accounts[0].id : ('' as any),
            amount: 0,
            description: ''
        }
    });

    const watchType = watch('type');
    const watchDesc = watch('description');

    useEffect(() => 
    {
        const delay = setTimeout(() => 
        {
            if (watchDesc !== descQuery) {
                setDescQuery(watchDesc || '');
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [watchDesc]);

    useEffect(() => 
    {
        const handleClickOutside = (event: MouseEvent) => 
        {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
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
               date: new Date(editingTx.date).toISOString().slice(0, 16),
            }); 
            setDescQuery(editingTx.description);
        } 
        else 
        {
            reset({ 
                date: new Date().toISOString().slice(0, 16),
                type: 'debit',
                categoryId: '' as any,
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
            categoryId: Number(data.categoryId),
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

    const targetCategoryType = watchType === 'debit' ? 'income' : 'expense';

    const filteredCategories = categories
        .filter(c => c.type === targetCategoryType)
        .map(c => ({ value: c.id.toString(), label: c.name }));

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
                        label={<span>Date <span className="text-red-500">*</span></span>}
                        {...register('date', { required: 'Date is required' })} 
                        error={errors.date?.message} 
                    />

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">
                            Transaction Type <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            control={control}
                            name="type"
                            render={({ field: { value, onChange } }) => (
                                <Select
                                    options={[
                                        { value: 'debit', label: 'Income' },
                                        { value: 'credit', label: 'Expense' }
                                    ]}
                                    value={value}
                                    onChange={(v) => 
                                    {
                                        onChange(v);
                                        setValue('categoryId', '' as any);
                                    }}
                                    error={errors.type?.message}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">
                            Category
                             <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            control={control}
                            name="categoryId"
                            rules={{ 
                                required: 'Please select a Category',
                                validate: val => Number(val) > 0 || 'Please select a Category' 
                            }}
                            render={({ field: { value, onChange } }) => (
                                <Select
                                    options={filteredCategories}
                                    value={value?.toString()}
                                    onChange={(v) => onChange(Number(v))}
                                    error={errors.categoryId?.message}
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">
                            Cash Account <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            control={control}
                            name="accountId"
                            rules={{ 
                                required: 'Please select an Account',
                                validate: val => Number(val) > 0 || 'Please select an Account' 
                            }}
                            render={({ field: { value, onChange } }) => (
                                <Select
                                    options={accountOptions}
                                    value={value?.toString()}
                                    onChange={(v) => onChange(Number(v))}
                                    error={errors.accountId?.message}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Controller
                        control={control}
                        name="amount"
                        rules={{
                            required: 'Amount is required',
                            min: { value: 100, message: 'Minimum Rp 100' }
                        }}
                        render={({ field: { value, onChange, onBlur } }) => 
                        {
                            const displayValue = value ? new Intl.NumberFormat('id-ID').format(value) : '';

                            return (
                                <Input
                                    type="text"
                                    label={<span>Amount (Rp) <span className="text-red-500">*</span></span>}
                                    placeholder="0"
                                    value={displayValue}
                                    onChange={(e) => 
                                    {
                                        const rawValue = e.target.value.replace(/\D/g, '');
                                        onChange(rawValue ? Number(rawValue) : 0);
                                    }}
                                    onBlur={onBlur}
                                    error={errors.amount?.message}
                                />
                            );
                        }}
                    />
                </div>

                <div className="relative" ref={suggestionRef}>
                    <Input 
                        label={<span>Description <span className="text-red-500">*</span></span>}
                        {...register('description', { required: 'Description is required' })} 
                        placeholder="e.g. Electricity bill, Donations..."
                        error={errors.description?.message} 
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
                    <ActionButton variant="primary" type="submit" isLoading={isSubmitting} className="cursor-pointer">
                        Submit
                    </ActionButton>
                </div>
            </form>
        </Modal>
    );
};
