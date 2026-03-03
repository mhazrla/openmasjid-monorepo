import { FastifyInstance } from 'fastify';
import { KajianRepository } from './kajian.repository';
import { KajianService } from './kajian.service';
import { KajianController } from './kajian.controller';

const repo       = new KajianRepository();
const service    = new KajianService(repo);
const controller = new KajianController(service); 

export async function kajianRoutes(app: FastifyInstance) 
{
  app.get('/', controller.getAll.bind(controller));
  app.get('/:id', controller.getById.bind(controller));

  app.register(async (protectedApp) => 
  {
    protectedApp.addHook('onRequest', app.authenticate);
    
    protectedApp.post('/', controller.create.bind(controller));
    protectedApp.patch('/:id', controller.update.bind(controller));
  });
}