import { FastifyRequest, FastifyReply } from 'fastify';
import { FinanceService } from './finance.service';
import { 
    createTransactionSchema, 
    updateTransactionSchema, 
    getTransactionsQuerySchema 
} from './finance.interface';
import { sendError, sendSuccess } from '../../common/utils/response.formatter';
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export class FinanceController 
{
  constructor(private service: FinanceService) {}

  async getAllTransactions(request: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const query   = getTransactionsQuerySchema.parse(request.query);
      const result  = await this.service.getAllTransactions(query);
  
      return sendSuccess(reply, result);
    } 
    catch (error: any) 
    {
      if (error instanceof z.ZodError) 
      {
        return sendError(reply, 'Validation Error', 400, error.format());
      }

      return sendError(reply, 'Internal Server Error', 500);
    }
  }

  async getTransactionById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const { id } = idParamSchema.parse(request.params);
      const item  = await this.service.getTransactionById(id);
  
      if (!item) return sendError(reply, 'Transaction not found', 404);
  
      return sendSuccess(reply, item);
    }
    catch (error: any) 
    {
      if (error instanceof z.ZodError) 
      {
        return sendError(reply, 'Validation Error', 400, error.format());
      }

      return sendError(reply, 'Internal Server Error', 500);
    }
  }

  async createTransaction(request: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const data = createTransactionSchema.parse(request.body);
      const result = await this.service.createTransaction(data);
  
      return sendSuccess(reply, result, 'Transaction created', 201);
    }
    catch (error: any) 
    {
      if (error instanceof z.ZodError) 
      {
        return sendError(reply, 'Validation Error', 400, error.format());
      }
      
      return sendError(reply, 'Internal Server Error', 500);
    }
  }

  async updateTransaction(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const { id } = idParamSchema.parse(request.params);
      const data = updateTransactionSchema.parse(request.body);
      const result = await this.service.updateTransaction(id, data);
      if (!result) return sendError(reply, 'Transaction not found', 404);
  
      return sendSuccess(reply, result, 'Transaction updated');
    }
    catch (error: any) 
    {
      if (error instanceof z.ZodError) 
      {
        return sendError(reply, 'Validation Error', 400, error.format());
      }

      return sendError(reply, 'Internal Server Error', 500);
    }
  }

  async deleteTransaction(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const { id } = idParamSchema.parse(request.params);
      const result = await this.service.deleteTransaction(id);
      if (!result) return sendError(reply, 'Transaction not found', 404);
  
      return sendSuccess(reply, result, 'Transaction deleted successfully');
    }
    catch (error: any) 
    {
      if (error instanceof z.ZodError) 
      {
        return sendError(reply, 'Validation Error', 400, error.format());
      }

      return sendError(reply, 'Internal Server Error', 500);
    }
  }

  async getAccounts(request: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const accounts = await this.service.getAccounts();
      return sendSuccess(reply, accounts);
    }
    catch (error: any) 
    {
      return sendError(reply, 'Internal Server Error', 500);
    }
  }

  async getCategories(request: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const categories = await this.service.getCategories();
      return sendSuccess(reply, categories);
    }
    catch (error: any) 
    {
      return sendError(reply, 'Internal Server Error', 500);
    }
  }

  async getSuggestions(request: FastifyRequest<{ Querystring: { q?: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const suggestions = await this.service.getSuggestions(request.query.q);
      
      return sendSuccess(reply, suggestions);
    }
    catch (error: any) 
    {
      return sendError(reply, 'Internal Server Error', 500);
    }
  }

  async getSummary(request: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const summary = await this.service.getSummary();
      return sendSuccess(reply, summary);
    }
    catch (error: any) 
    {
      return sendError(reply, 'Internal Server Error', 500);
    }
  }
}
