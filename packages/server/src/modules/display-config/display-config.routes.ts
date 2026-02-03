import { FastifyInstance } from 'fastify';
import { DisplayConfigRepository } from './display-config.repository';
import { DisplayConfigService } from './display-config.service';
import { DisplayConfigController } from './display-config.controller';

const repo        = new DisplayConfigRepository();
const service     = new DisplayConfigService(repo);
const controller  = new DisplayConfigController(service);

export async function displayConfigRoutes(app: FastifyInstance) 
{
  app.get('/', controller.getConfig.bind(controller));
  app.patch('/', controller.updateConfig.bind(controller));
}
