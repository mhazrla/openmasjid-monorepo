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

  // CORS: Allow everything for troubleshooting
  await app.register(cors, 
  { 
    origin: true, // Reflects the request origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
    // allowedHeaders: ['Content-Type', 'Authorization'],
    // credentials: true
  });

  // Troubleshooting: Log incoming requests
  app.addHook('onRequest', async (request, reply) => {
      const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
      console.log(`📥 [${request.method}] ${request.url} from ${ip}`);
  });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
      console.error('FATAL: JWT_SECRET environment variable is not defined.');
      process.exit(1);
  }

  // --- Plugins ---
  await app.register(import('@fastify/compress'), { global: true });

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
        reply.status(404).send({ error: 'API Endpoint not found', url: req.raw.url });
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