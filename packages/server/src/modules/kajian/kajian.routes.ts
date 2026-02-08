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
  app.post('/', controller.create.bind(controller));
  app.patch('/:id', controller.update.bind(controller));
  app.delete('/:id', controller.delete.bind(controller));
}