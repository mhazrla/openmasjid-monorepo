export interface Account 
{
  id: number;
  name: string;
  balance: number;
  isActive: boolean;
}

export interface Transaction 
{
  id: number;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  fundCategory: 'operasional' | 'yatim' | 'pembangunan' | 'ramadhan';
  accountId: number;
  account?: Account;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetTransactionsQuery 
{
  startDate?: string;
  endDate?: string;
  accountId?: number;
  page?: number;
  limit?: number;
  refetchInterval?: number;
}

export interface TransactionSummary 
{
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  fundBalances?: Record<string, number>;
  accountBalances?: Record<string, number>;
  lastUpdated?: string;
}

export interface TransactionResponse 
{
  data: Transaction[];
  summary: TransactionSummary;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTransactionDto 
{
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  fundCategory: 'operasional' | 'yatim' | 'pembangunan' | 'ramadhan';
  accountId: number;
}

export interface UpdateTransactionDto extends CreateTransactionDto {}