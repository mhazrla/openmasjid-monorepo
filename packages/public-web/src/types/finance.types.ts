
export interface FinanceSummary 
{
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    fundBalances: {
        operasional: number;
        yatim: number;
        pembangunan: number;
        ramadhan: number;
    };
    accountBalances: {
        bsi?: number;
        cash?: number;
        [key: string]: number | undefined;
    };
    lastUpdated: string | null;
}

export interface Transaction 
{
    id: number;
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    fundCategory: string;
    accountId: number;
    referenceImage?: string;
    account?: {
        id: number;
        name: string;
        type: string;
    };
}

export interface TransactionsResponse 
{
    data: Transaction[];
    summary: { totalIncome: number; totalExpense: number };
    pagination: { total: number; page: number; limit: number; totalPages: number; };
}
