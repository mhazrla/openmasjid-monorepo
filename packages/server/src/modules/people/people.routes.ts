import { FastifyInstance } from 'fastify';
import { PeopleRepository } from './people.repository';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';

// Dependency Injection Setup
const repo       = new PeopleRepository();
const service    = new PeopleService(repo);
const controller = new PeopleController(service);

export async function peopleRoutes(app: FastifyInstance) 
{
  app.get('/', controller.getAll.bind(controller));
  app.get('/:id', controller.getById.bind(controller));
  app.post('/', controller.create.bind(controller));
  app.patch('/:id', controller.update.bind(controller));
  app.delete('/:id', controller.delete.bind(controller));
}