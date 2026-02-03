import fastify from 'fastify';
import cors from '@fastify/cors';
import { appRoutes } from './routes';

export const buildApp = async () => 
{
  const app = fastify({ 
    // logger: {
    //   transport: {
    //     target: 'pino-pretty'
    //   }
    // } 
    logger: false
  });

  // 1. Plugins
  await app.register(cors, 
    { 
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    });

  // 2. Global Routes
  await app.register(appRoutes);

  return app;
};
