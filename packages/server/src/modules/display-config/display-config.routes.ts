import { FastifyInstance } from 'fastify';
import { DisplayConfigRepository } from './display-config.repository';
import { DisplayConfigService } from './display-config.service';
import { DisplayConfigController } from './display-config.controller';
import { PrayerTimeService } from '../prayer-time/prayer-time.service';
import { PrayerTimeRepository } from '../prayer-time/prayer-time.repository';

// Dependency Injection
const configRepo    = new DisplayConfigRepository();
const prayerRepo    = new PrayerTimeRepository();

// PrayerTimeService needs (PrayerRepo, ConfigRepo)
const prayerService = new PrayerTimeService(prayerRepo, configRepo);

// DisplayConfigService needs (ConfigRepo, PrayerTimeService)
const service       = new DisplayConfigService(configRepo, prayerService);
const controller    = new DisplayConfigController(service);

export async function displayConfigRoutes(app: FastifyInstance) 
{
  app.get('/', controller.getConfig.bind(controller));
  app.patch('/', controller.updateConfig.bind(controller));
}
