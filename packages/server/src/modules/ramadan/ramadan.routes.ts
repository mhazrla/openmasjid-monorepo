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

  app.register(async (protectedApp) => 
  {
    protectedApp.addHook('onRequest', app.authenticate);
    protectedApp.post('/init', controller.init.bind(controller));
    protectedApp.patch('/config/:id', controller.updateConfig.bind(controller));
    protectedApp.patch('/schedule/:id', controller.updateSchedule.bind(controller));
  });
}