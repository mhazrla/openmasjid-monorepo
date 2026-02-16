
import { FastifyInstance } from 'fastify';
import { HadisController } from './hadis.controller';
import { HadisService } from './hadis.service';
import { HadisRepository } from './hadis.repository';

const repository    = new HadisRepository();
const service       = new HadisService(repository);
const controller    = new HadisController(service);

export async function hadisRoutes(app: FastifyInstance) 
{
    app.get('/display', controller.getDisplay.bind(controller));
}
