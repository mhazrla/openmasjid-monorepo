import { FastifyInstance } from 'fastify';
import { RamadanRepository } from './ramadan.repository';
import { RamadanService } from './ramadan.service';
import { RamadanController } from './ramadan.controller';

const repo       = new RamadanRepository();
const service    = new RamadanService(repo); 
const controller = new RamadanController(service);

export async function ramadanRoutes(app: FastifyInstance) 
{
  app.get('/', controller.getActive.bind(controller));
  app.post('/init', controller.init.bind(controller));
  app.patch('/config/:id', controller.updateConfig.bind(controller));
  app.patch('/schedule/:id', controller.updateSchedule.bind(controller));
}