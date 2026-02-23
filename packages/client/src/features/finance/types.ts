export interface CoaCategory 
{
  id: number;
  name: string;
  type: 'income' | 'expense';
}

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
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  categoryId: number;
  accountId: number;
  category?: CoaCategory;
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
  totalDebit: number;
  totalCredit: number;
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
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  categoryId: number;
  accountId: number;
}

export interface UpdateTransactionDto extends CreateTransactionDto {}
