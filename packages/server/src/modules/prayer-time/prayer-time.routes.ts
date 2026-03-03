import { FastifyInstance } from 'fastify';
import { PrayerTimeRepository } from './prayer-time.repository';
import { PrayerTimeService } from './prayer-time.service';
import { PrayerTimeController } from './prayer-time.controller';
import { DisplayConfigRepository } from '../display-config/display-config.repository';

const prayerRepo  = new PrayerTimeRepository();
const configRepo  = new DisplayConfigRepository();
const service     = new PrayerTimeService(prayerRepo, configRepo);
const controller  = new PrayerTimeController(service);

export async function prayerTimeRoutes(app: FastifyInstance) 
{
  app.get('/', controller.getTimes.bind(controller));

  app.register(async (protectedApp) => 
  {
    protectedApp.addHook('onRequest', app.authenticate);
    protectedApp.post('/sync', controller.syncTimes.bind(controller));
  });
}
