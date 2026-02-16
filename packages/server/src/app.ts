import fastify from 'fastify';
import cors from '@fastify/cors';
import { appRoutes } from './routes';
import authPlugin from './plugins/auth';
import path from 'path';
import fs from 'fs';

export const buildApp = async () => 
{
  const isDev = process.env.NODE_ENV === 'development';
  
  const app = fastify({ 
    logger: isDev ? { transport: { target: 'pino-pretty' } } : true
  });

  const corsOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

  await app.register(cors, 
  { 
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
      console.error('FATAL: JWT_SECRET environment variable is not defined.');
      process.exit(1);
  }

  // --- Plugins ---
  await app.register(import('@fastify/multipart'), 
  {
    limits: { fileSize: 2 * 1024 * 1024 }
  });
  
  await app.register(import('@fastify/static'), 
  {
    root: path.join(process.cwd(), 'public'),
    prefix: '/public/',
    list: false,
    decorateReply: false
  });

  const frontendDistPath = path.resolve(__dirname, '../../client/dist');
  
  if (fs.existsSync(frontendDistPath)) 
  {
    await app.register(import('@fastify/static'), 
    {
      root: frontendDistPath,
      prefix: '/',
      wildcard: false,
      decorateReply: true
    });

    app.setNotFoundHandler((req, reply) => 
    {
      if (req.raw.url && req.raw.url.startsWith('/api')) 
      {
        reply.status(404).send({ error: 'Endpoint API tidak ditemukan', url: req.raw.url });
      } 
      else 
      {
        reply.sendFile('index.html', frontendDistPath);
      }
    });
  } 
  else 
  {
    if (!isDev) console.warn(`⚠️ Warning: Frontend build not found at ${frontendDistPath}`);
  }

  await app.register(import('@fastify/jwt'), 
  {
    secret: jwtSecret,
    sign: { expiresIn: '1d' } 
  });

  await app.register(authPlugin);
  
  await app.register(appRoutes); 
  
  return app;
};