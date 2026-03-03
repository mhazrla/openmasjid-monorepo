import { FastifyInstance } from 'fastify';
import { ArchiveRepository } from './archive.repository';
import { ArchiveService } from './archive.service';
import { ArchiveController } from './archive.controller';

const repo = new ArchiveRepository();
const service = new ArchiveService(repo);
const controller = new ArchiveController(service);

export async function archiveRoutes(app: FastifyInstance) 
{
  // Public routes
  app.get('/', async (request, reply) => 
  {
    return { status: 'success', message: 'Archive module is active' };
  });

  app.get('/albums', controller.getAllAlbums.bind(controller));
  app.get('/albums/:id/media', controller.getAlbumMedia.bind(controller));

  // Protected Routes
  app.register(async (protectedApp) => 
  {
    protectedApp.addHook('onRequest', app.authenticate);

    protectedApp.post('/albums', controller.createAlbum.bind(controller));
    protectedApp.patch('/albums/:id', controller.updateAlbum.bind(controller));
    protectedApp.post('/albums/:id/media', controller.addMedia.bind(controller));
    
    protectedApp.delete('/albums/:id', controller.deleteAlbum.bind(controller));
    protectedApp.delete('/media/:id', controller.deleteMedia.bind(controller));
  });
}
