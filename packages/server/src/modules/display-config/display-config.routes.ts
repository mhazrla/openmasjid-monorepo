import { FastifyInstance } from 'fastify';
import { DisplayConfigRepository } from './display-config.repository';
import { DisplayConfigService } from './display-config.service';
import { DisplayConfigController } from './display-config.controller';
import { PrayerTimeService } from '../prayer-time/prayer-time.service';
import { PrayerTimeRepository } from '../prayer-time/prayer-time.repository';

const configRepo    = new DisplayConfigRepository();
const prayerRepo    = new PrayerTimeRepository();
const prayerService = new PrayerTimeService(prayerRepo, configRepo);
const service       = new DisplayConfigService(configRepo, prayerService);
const controller    = new DisplayConfigController(service);

export async function displayConfigRoutes(app: FastifyInstance) 
{
  app.get('/', controller.get.bind(controller));
  app.patch('/', controller.update.bind(controller));
}
