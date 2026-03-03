import { FastifyInstance } from 'fastify';
import { uploadController } from './upload.controller';

export async function uploadRoutes(app: FastifyInstance) 
{
    app.register(async (protectedApp) => 
    {
        protectedApp.addHook('onRequest', protectedApp.authenticate);
        protectedApp.post('/upload', uploadController.uploadFile);
    });
}