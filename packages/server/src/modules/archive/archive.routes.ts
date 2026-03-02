import { FastifyInstance } from 'fastify';

export async function archiveRoutes(app: FastifyInstance) 
{
  app.get('/', async (request, reply) => 
  {
    return { status: 'success', message: 'Archive module is active' };
  });

  app.get('/albums', async (request, reply) => 
  {
    return { data: [] };
  });

  app.get('/media', async (request, reply) => 
  {
    return { data: [] };
  });
}
