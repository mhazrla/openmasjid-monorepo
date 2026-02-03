import fastify from 'fastify';
import cors from '@fastify/cors';
import { appRoutes } from './routes';

export const buildApp = async () => 
{
  const app = fastify({ 
    logger: {
      transport: {
        target: 'pino-pretty'
      }
    } 
    // logger: true
  });

  // 1. Plugins
  await app.register(cors, { origin: '*' });

  // 2. Global Routes
  await app.register(appRoutes);

  return app;
};
