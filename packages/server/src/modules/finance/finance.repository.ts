import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../db'; 
import { transactions, accounts } from '../../db/schema';
import { GetTransactionsQueryDto, CreateTransactionDto, UpdateTransactionDto } from './finance.interface';

export class FinanceRepository 
{
  async findAll(filters: GetTransactionsQueryDto) 
  {
    const conditions = [];

    if (filters.accountId) 
    {
        conditions.push(eq(transactions.accountId, filters.accountId));
    }
    
    if (filters.startDate) 
    {
        conditions.push(gte(transactions.date, new Date(filters.startDate)));
    }
    if (filters.endDate) 
    {
        conditions.push(lte(transactions.date, new Date(filters.endDate)));
    }

    const limit = filters.limit || 100;
    const offset = (filters.page && filters.page > 0) ? (filters.page - 1) * limit : 0;

    const rows = await db.query.transactions.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: 
        {
            account: true,
        },
        orderBy: [desc(transactions.date), desc(transactions.createdAt)],
        limit,
        offset,
    });

    let totalIncome = 0;
    let totalExpense = 0;

    const summaryRows = await db.select({
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`.mapWith(Number)
    })
    .from(transactions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(transactions.type);

    for (const row of summaryRows) 
    {
        if (row.type === 'income') totalIncome = row.total;
        if (row.type === 'expense') totalExpense = row.total;
    }

    const [{ count }] = await db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(transactions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
        data: rows,
        summary: { totalIncome, totalExpense },
        pagination: {
            total: count,
            page: filters.page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    };
  }

  async findById(id: number) 
  {
    return await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
      with: { account: true }
    });
  }

  async create(data: CreateTransactionDto) 
  {
    return await db.transaction(async (tx: any) => 
    {
      const [newTx] = await tx.insert(transactions)
        .values({
            ...data,
            date: new Date(data.date),
            createdAt: new Date(),
            updatedAt: new Date()
        })
        .returning();

      const modifier = data.type === 'income' ? data.amount : -data.amount;
      
      await tx.update(accounts)
        .set({ balance: sql`balance + ${modifier}`, updatedAt: new Date() })
        .where(eq(accounts.id, data.accountId));

      return newTx;
    });
  }

  async update(id: number, data: UpdateTransactionDto) 
  {
    return await db.transaction(async (tx: any) => 
    {
      const oldTx = await tx.query.transactions.findFirst({
          where: eq(transactions.id, id)
      });

      if (!oldTx) throw new Error('Transaction not found');

      const oldModifier = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
      await tx.update(accounts)
        .set({ balance: sql`balance + ${oldModifier}` })
        .where(eq(accounts.id, oldTx.accountId));

      const newModifier = data.type === 'income' ? data.amount : -data.amount;
      await tx.update(accounts)
        .set({ balance: sql`balance + ${newModifier}`, updatedAt: new Date() })
        .where(eq(accounts.id, data.accountId));

      const [updated] = await tx.update(transactions)
        .set({
            ...data,
            date: new Date(data.date),
            updatedAt: new Date()
        })
        .where(eq(transactions.id, id))
        .returning();

      return updated;
    });
  }

  async delete(id: number) 
  {
    return await db.transaction(async (tx: any) => 
    {
      const oldTx = await tx.query.transactions.findFirst({
        where: eq(transactions.id, id)
      });

      if (!oldTx) return null;

      const oldModifier = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
      await tx.update(accounts)
        .set({ balance: sql`balance + ${oldModifier}`, updatedAt: new Date() })
        .where(eq(accounts.id, oldTx.accountId));

      const [deleted] = await tx.delete(transactions)
        .where(eq(transactions.id, id))
        .returning();

      return deleted;
    });
  }

  async getAccounts() 
  {
      return await db.query.accounts.findMany();
  }

  async getCategories() 
  {
    return [
      { id: 'operasional', name: 'Operasional Masjid', type: 'expense' },
      { id: 'yatim', name: 'Yatim & Dhuafa', type: 'expense' },
      { id: 'pembangunan', name: 'Pembangunan', type: 'expense' },
      { id: 'ramadhan', name: 'Program Khusus / Ramadhan', type: 'expense' },
      { id: 'operasional', name: 'Operasional Masjid', type: 'income' },
      { id: 'yatim', name: 'Yatim & Dhuafa', type: 'income' },
      { id: 'pembangunan', name: 'Pembangunan', type: 'income' },
      { id: 'ramadhan', name: 'Program Khusus / Ramadhan', type: 'income' },
    ];
  }

  async getSuggestions(query: string = '') 
  {
    let condition = undefined;
    if (query && query.length > 0) 
    {
      condition = sql`description ILIKE ${'%' + query + '%'}`;
    }

    const rows = await db.select({
        description: transactions.description,
        count: sql<number>`count(*)`.mapWith(Number)
    })
    .from(transactions)
    .where(condition)
    .groupBy(transactions.description)
    .orderBy(desc(sql`count(*)`))
    .limit(10);
    
    return rows.map((r: { description: string }) => r.description);
  }

  async getSummary() 
  {
    const accountsData = await db.query.accounts.findMany();
    const totalAssets = accountsData.reduce((sum: number, acc: any) => sum + acc.balance, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    const summaryRows = await db.select({
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`.mapWith(Number)
    })
    .from(transactions)
    .where(gte(transactions.date, startOfMonth))
    .groupBy(transactions.type);

    for (const row of summaryRows) 
    {
        if (row.type === 'income') monthlyIncome = row.total;
        if (row.type === 'expense') monthlyExpense = row.total;
    }

    const fundIncomeRows = await db.select({
      fundCategory: transactions.fundCategory,
      total: sql<number>`sum(${transactions.amount})`.mapWith(Number)
    })
    .from(transactions)
    .where(eq(transactions.type, 'income'))
    .groupBy(transactions.fundCategory);

    const fundExpenseRows = await db.select({
      fundCategory: transactions.fundCategory,
      total: sql<number>`sum(${transactions.amount})`.mapWith(Number)
    })
    .from(transactions)
    .where(eq(transactions.type, 'expense'))
    .groupBy(transactions.fundCategory);

    const fundBalances: Record<string, number> = 
    {
        operasional: 0,
        yatim: 0,
        pembangunan: 0,
        ramadhan: 0
    };

    for (const row of fundIncomeRows) 
    {
        if (row.fundCategory && row.fundCategory in fundBalances) 
        {
             fundBalances[row.fundCategory] += row.total;
        }
    }
    for (const row of fundExpenseRows) 
    {
        if (row.fundCategory && row.fundCategory in fundBalances) 
        {
             fundBalances[row.fundCategory] -= row.total;
        }
    }

    // Identify account balances
    const accountBalances = accountsData.reduce((acc: Record<string, number>, account: any) => {
        const idMap: Record<number, string> = { 1: 'bsi', 2: 'cash' };
        const key = idMap[account.id] || account.name;
        acc[key] = account.balance;
        return acc;
    }, {} as Record<string, number>);

    const [latestTx] = await db.select({ date: transactions.date, updatedAt: transactions.updatedAt })
      .from(transactions)
      .orderBy(desc(transactions.date), desc(transactions.updatedAt))
      .limit(1);

    return {
        totalBalance: totalAssets,
        monthlyIncome,
        monthlyExpense,
        fundBalances,
        accountBalances,
        lastUpdated: latestTx ? (latestTx.updatedAt || latestTx.date) : null
    };
  }
}
