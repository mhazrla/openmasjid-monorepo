import fastify from 'fastify';
import cors from '@fastify/cors';
import { appRoutes } from './routes';
import authPlugin from './plugins/auth';
import path from 'path';

export const buildApp = async () => 
{
  const isDev = process.env.NODE_ENV === 'development';
  
  const app = fastify({ 
    logger: isDev ? 
    {
       transport: { target: 'pino-pretty' }
    } : true
  });

  const corsOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : ['http://localhost:5173']; 

  await app.register(cors, 
  { 
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });

  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) 
  {
      console.error('FATAL: JWT_SECRET environment variable is not defined.');
      process.exit(1);
  }

  // Plugins
  await app.register(import('@fastify/multipart'), 
  {
    limits: 
    {
      fileSize: 2 * 1024 * 1024,
    }
  });
  
  await app.register(import('@fastify/static'), 
  {
    root: path.join(process.cwd(), 'public'),
    prefix: '/public/',
    list: false, // Disable directory listing
  });

  await app.register(import('@fastify/jwt'), 
  {
    secret: jwtSecret,
    sign: { expiresIn: '1d' } 
  });

  await app.register(authPlugin);
  await app.register(appRoutes); 
  
  return app;
};
