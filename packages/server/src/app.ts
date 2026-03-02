import fastify from 'fastify';
import { appRoutes } from './routes';
import authPlugin from './plugins/auth';
import corePlugin from './plugins/core';
import frontendPlugin from './plugins/frontend';

export const buildApp = async () => 
{
  const isDev = process.env.NODE_ENV === 'development';
  
  const app = fastify({ 
    logger: isDev ? { transport: { target: 'pino-pretty' } } : true
  });

  // Troubleshooting: Log incoming requests
  app.addHook('onRequest', async (request, reply) => {
      const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
      console.log(`📥 [${request.method}] ${request.url} from ${ip}`);
  });

  // 1. Core Plugins (CORS, JWT, Multipart, Compress)
  await app.register(corePlugin);

  // 2. Auth Plugin
  await app.register(authPlugin);
  
  // 3. API Routes
  await app.register(appRoutes); 

  // 4. Frontend & Static Fallbacks
  await app.register(frontendPlugin);
  
  return app;
};