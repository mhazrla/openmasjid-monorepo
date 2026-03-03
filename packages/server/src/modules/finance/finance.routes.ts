import { FastifyInstance } from 'fastify';
import { FinanceRepository } from './finance.repository';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';

const repo       = new FinanceRepository();
const service    = new FinanceService(repo);
const controller = new FinanceController(service); 

export async function financeRoutes(app: FastifyInstance) 
{
  app.get('/transactions', controller.getAllTransactions.bind(controller));
  app.get('/transactions/:id', controller.getTransactionById.bind(controller));
  
  app.register(async (protectedApp) => 
  {
    protectedApp.addHook('onRequest', app.authenticate);
    protectedApp.post('/transactions', controller.createTransaction.bind(controller));
    protectedApp.put('/transactions/:id', controller.updateTransaction.bind(controller));
    protectedApp.delete('/transactions/:id', controller.deleteTransaction.bind(controller));
  });
  
  app.get('/accounts', controller.getAccounts.bind(controller));
  app.get('/categories', controller.getCategories.bind(controller));
  app.get('/suggestions', controller.getSuggestions.bind(controller));
  app.get('/summary', controller.getSummary.bind(controller));
}
