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
import type { FinanceSummaryData } from '../display/types';
import { useLoadingStore } from '../../store/useLoadingStore';

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
        onMutate: () => useLoadingStore.getState().showLoading('Adding transaction...'),
        onSettled: () => useLoadingStore.getState().hideLoading(),
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
        onMutate: () => useLoadingStore.getState().showLoading('Updating transaction...'),
        onSettled: () => useLoadingStore.getState().hideLoading(),
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
        onMutate: () => useLoadingStore.getState().showLoading('Deleting transaction...'),
        onSettled: () => useLoadingStore.getState().hideLoading(),
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
    const query = useQuery({
        queryKey: ['finance_summary'],
        queryFn: async () => 
        {
            const { data } = await api.get<{ data: FinanceSummaryData }>('/finance/summary');
            return data.data || data;
        },
        refetchInterval: options?.refetchInterval,
        staleTime: 1000 * 60 * 5,
    });

    return {
        data: query.data || null,
        isPending: query.isPending
    };
};
