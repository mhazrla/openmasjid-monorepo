import { FastifyInstance } from 'fastify';
import { ShortlinkRepository } from './shortlink.repository';
import { ShortlinkService } from './shortlink.service';
import { ShortlinkController } from './shortlink.controller';

const repo          = new ShortlinkRepository();
const service       = new ShortlinkService(repo);
const controller    = new ShortlinkController(service);

export async function shortlinkApiRoutes(app: FastifyInstance) 
{
    app.get('/', controller.getAll.bind(controller));
    app.post('/', controller.create.bind(controller));
    app.delete('/:id', controller.delete.bind(controller));
}

export async function shortlinkRedirectRoutes(app: FastifyInstance) 
{
    app.get('/:slug', controller.handleRedirect.bind(controller));
}
