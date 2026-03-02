import fp from 'fastify-plugin';
import path from 'path';
import fs from 'fs';

export default fp(async (app) => 
{
    const isDev = process.env.NODE_ENV === 'development';

    await app.register(import('@fastify/static'), 
    {
      root: path.join(process.cwd(), 'public'),
      prefix: '/public/',
      list: false,
      decorateReply: false
    });

    const adminDistPath = path.resolve(__dirname, '../../../client/dist');
    const tvDistPath = path.resolve(__dirname, '../../../display-tv');
    const webDistPath = path.resolve(__dirname, '../../../public-web/dist');
    
    // 1. Admin Dashboard
    if (fs.existsSync(adminDistPath)) 
    {
      await app.register(import('@fastify/static'), 
      {
        root: adminDistPath,
        prefix: '/admin/',
        wildcard: false,
        decorateReply: true 
      });
    } 
    else 
    {
      if (!isDev) console.warn(`⚠️ Warning: Admin Frontend build not found at ${adminDistPath}`);
    }

    // 2. Display TV
    if (fs.existsSync(tvDistPath))
    {
      await app.register(import('@fastify/static'), 
      {
        root: tvDistPath,
        prefix: '/tv/',
        wildcard: false,
        decorateReply: false
      });
    }

    // 3. Public Web (Root)
    if (fs.existsSync(webDistPath))
    {
      await app.register(import('@fastify/static'), 
      {
        root: webDistPath,
        prefix: '/',
        wildcard: false,
        decorateReply: false // Prevent collision
      });
    }

    // Global Not Found Handler
    app.setNotFoundHandler((req, reply) => 
    {
      if (req.raw.url && req.raw.url.startsWith('/api')) 
      {
        reply.status(404).send({ error: 'API Endpoint not found', url: req.raw.url });
      } 
      else if (req.raw.url && req.raw.url.startsWith('/admin') && fs.existsSync(adminDistPath)) 
      {
        reply.sendFile('index.html', adminDistPath);
      }
      else if (req.raw.url && req.raw.url.startsWith('/tv') && fs.existsSync(tvDistPath)) 
      {
        reply.sendFile('index.html', tvDistPath);
      }
      else if (fs.existsSync(webDistPath)) 
      {
        reply.sendFile('index.html', webDistPath);
      }
      else
      {
        reply.status(404).send('Not Found');
      }
    });
});
