import { useQuery } from '@tanstack/react-query';
import type { FinanceSummary, TransactionsResponse } from '../types/finance.types';

let baseURL = '/api/';
if (import.meta.env.PROD && import.meta.env.VITE_API_URL) 
{
    const apiUrl = import.meta.env.VITE_API_URL as string;
    baseURL = apiUrl.endsWith('/api/') ? apiUrl : apiUrl.replace(/\/$/, '') + '/api/';
}

const fetchFinanceSummary = async (): Promise<FinanceSummary> => 
{
    const response = await fetch(`${baseURL}finance/summary`);
    if (!response.ok) throw new Error('Failed to fetch finance summary');
    const { data } = await response.json();
    return data;
};

const fetchRecentTransactions = async (limit: number = 30): Promise<TransactionsResponse> => 
{
    const response = await fetch(`${baseURL}finance/transactions?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch recent transactions');
    const { data } = await response.json();

    return {
        data: data.data || [],
        summary: data.summary || { totalIncome: 0, totalExpense: 0 },
        pagination: data.pagination || { total: 0, page: 1, limit, totalPages: 1 }
    };
};

export const useFinanceSummary = () => 
{
    return useQuery({
        queryKey: ['financeSummary'],
        queryFn: fetchFinanceSummary,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};

export const useRecentTransactions = (limit: number = 10) => 
{
    return useQuery({
        queryKey: ['recentTransactions', limit],
        queryFn: () => fetchRecentTransactions(limit),
        staleTime: 1000 * 60 * 5,
    });
};
