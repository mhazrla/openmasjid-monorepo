import { FastifyInstance } from 'fastify';
import { MosqueRepository } from './mosque.repository';
import { MosqueService } from './mosque.service';
import { MosqueController } from './mosque.controller';

const repo        = new MosqueRepository();
const service     = new MosqueService(repo);
const controller  = new MosqueController(service);

export async function mosqueRoutes(app: FastifyInstance) 
{
  app.get('/', controller.get.bind(controller));
  app.patch('/', controller.update.bind(controller)); 
}
