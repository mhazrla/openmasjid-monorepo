import { api } from '../../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { 
    TransactionResponse, 
    GetTransactionsQuery, 
    CreateTransactionDto, 
    UpdateTransactionDto, 
    Account, 
    CoaCategory 
} from './types';

export const useTransactions = (params?: GetTransactionsQuery) => 
{
    return useQuery({
        queryKey: ['transactions', params], 
        queryFn: async () => 
        {
            const queryParams = new URLSearchParams();
            if (params?.startDate) queryParams.append('startDate', params.startDate);
            if (params?.endDate) queryParams.append('endDate', params.endDate);
            if (params?.accountId) queryParams.append('accountId', params.accountId.toString());
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            
            const { data } = await api.get<{ data: TransactionResponse }>('/finance/transactions', { params: queryParams });
            return data.data || data;
        },
        staleTime: 1000 * 60 * 1, // 1 minute
        placeholderData: (previousData) => previousData, 
        refetchInterval: params?.refetchInterval,
    });
};

export const useAccounts = (options?: { refetchInterval?: number }) => 
{
    return useQuery({
        queryKey: ['finance_accounts'], 
        queryFn: async () => 
        {
            const { data } = await api.get<{ data: Account[] }>('/finance/accounts');
            return data.data || data;
        },
        staleTime: 1000 * 60 * 5, 
        refetchInterval: options?.refetchInterval,
    });
};

export const useCategories = () => 
{
    return useQuery({
        queryKey: ['finance_categories'], 
        queryFn: async () => 
        {
            const { data } = await api.get<{ data: CoaCategory[] }>('/finance/categories');
            return data.data || data;
        },
        staleTime: 1000 * 60 * 30, // Rarely changes
    });
};

export const useSuggestions = (queryStr: string) => 
{
    return useQuery({
        queryKey: ['finance_suggestions', queryStr], 
        queryFn: async () => 
        {
            if (!queryStr) return [];
            const { data } = await api.get<{ data: string[] }>('/finance/suggestions', { params: { q: queryStr } });
            return data.data || data;
        },
        enabled: queryStr.length > 0,
        staleTime: 1000 * 60 * 5,
    });
};

export const useCreateTransaction = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newData: CreateTransactionDto) => 
        {
            const { data } = await api.post('/finance/transactions', newData);
            return data.data || data;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['finance_accounts'] });
            toast.success('Transaction added successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to add transaction');
        }
    });
};

export const useUpdateTransaction = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: UpdateTransactionDto & { id: number }) => 
        {
            const { data: response } = await api.put(`/finance/transactions/${id}`, data);
            return response.data || response;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['finance_accounts'] });
            toast.success('Transaction updated successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to update transaction');
        }
    });
};

export const useDeleteTransaction = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => 
        {
            await api.delete(`/finance/transactions/${id}`);
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['finance_accounts'] });
            toast.success('Transaction deleted successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to delete transaction');
        }
    });
};

export const useFinanceSummaryData = (options?: { refetchInterval?: number }) => 
{
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: accounts, isLoading: accountsLoading } = useAccounts({ refetchInterval: options?.refetchInterval });
    const { data: transactionsData, isLoading: txLoading } = useTransactions({ 
        startDate, 
        endDate, 
        limit: 5,
        refetchInterval: options?.refetchInterval 
    });

    const isPending = accountsLoading || txLoading;

    if (isPending || !accounts || !transactionsData) return { data: null, isPending };

    const totalAssets = accounts.reduce((acc, account) => acc + account.balance, 0);
    const totalIncome = transactionsData.summary?.totalDebit || 0;
    const totalExpense = transactionsData.summary?.totalCredit || 0;

    return {
        data: 
        {
            totalAssets,
            totalIncome,
            totalExpense,
            recentTransactions: transactionsData.data.map(tx => ({
                id: tx.id,
                date: tx.date,
                description: tx.description,
                amount: tx.amount,
                type: tx.type
            }))
        },
        isPending: false
    };
};
