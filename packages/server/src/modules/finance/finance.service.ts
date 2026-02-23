import { FinanceRepository } from './finance.repository';
import { CreateTransactionDto, UpdateTransactionDto, GetTransactionsQueryDto } from './finance.interface';

export class FinanceService 
{
  constructor(private readonly repository: FinanceRepository) {}

  async getAllTransactions(query: GetTransactionsQueryDto) 
  {
    return this.repository.findAll(query);
  }

  async getTransactionById(id: number) 
  {
    return this.repository.findById(id);
  }

  async createTransaction(data: CreateTransactionDto) 
  {
    return this.repository.create(data);
  }

  async updateTransaction(id: number, data: UpdateTransactionDto) 
  {
    return this.repository.update(id, data);
  }

  async deleteTransaction(id: number) 
  {
    return this.repository.delete(id);
  }

  async getAccounts() 
  {
      return this.repository.getAccounts();
  }

  async getCategories() 
  {
      return this.repository.getCategories();
  }

  async getSuggestions(query?: string) 
  {
      return this.repository.getSuggestions(query);
  }
}
