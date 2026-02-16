
import { FastifyRequest, FastifyReply } from 'fastify';
import { PeopleService } from './people.service';
import { createPersonSchema, updatePersonSchema, getPeopleQuerySchema } from './people.interface';

export class PeopleController 
{
  constructor(private service: PeopleService) {}

  async getAll(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const queryValidation = getPeopleQuerySchema.safeParse(req.query);
      
      if (!queryValidation.success) 
      {
          return reply.code(400).send({ message: 'Invalid query params' });
      }

      let typeFilter = queryValidation.data.type;

      if (typeFilter === 'all') 
      {
          typeFilter = undefined;
      }

      let statusFilter: boolean | undefined;

      if (queryValidation.data.status === 'active') statusFilter = true;
      else if (queryValidation.data.status === 'inactive') statusFilter = false;
      else statusFilter = undefined;

      const filters = {
        type: typeFilter as string,
        status: statusFilter,
        search: queryValidation.data.search,
      };

      const data = await this.service.getAllPeople(filters);

      return reply.code(200).send({ data });
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.code(500).send({ message: 'Internal Server Error' });
    }
  }

  async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return reply.code(400).send({ message: 'Invalid ID' });

      const data = await this.service.getPersonById(id);
      
      if (!data) return reply.code(404).send({ message: 'Person not found' });

      return reply.code(200).send({ data });
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.code(500).send({ message: 'Internal Server Error' });
    }
  }

  async create(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const validation = createPersonSchema.safeParse(req.body);
      
      if (!validation.success) 
      {
        return reply.code(400).send({ 
          message: 'Validation Error', 
          errors: validation.error.format() 
        });
      }

      const result = await this.service.createPerson(validation.data);
      return reply.code(201).send({ data: result, message: 'Person created' });
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.code(500).send({ message: 'Failed to create person' });
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return reply.code(400).send({ message: 'Invalid ID' });

      const validation = updatePersonSchema.safeParse(req.body);

      if (!validation.success) 
      {
        return reply.code(400).send({ message: 'Validation Error', errors: validation.error.errors });
      }

      const result = await this.service.updatePerson(id, validation.data);
      
      if (!result) return reply.code(404).send({ message: 'Person not found' });

      return reply.code(200).send({ data: result, message: 'Person updated' });
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.code(500).send({ message: 'Failed to update person' });
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return reply.code(400).send({ message: 'Invalid ID' });

      const result = await this.service.deletePerson(id);
      
      if (!result) return reply.code(404).send({ message: 'Person not found' });

      return reply.code(200).send({ 
          message: 'Person deactivated successfully', 
          data: result 
      });
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.code(500).send({ message: 'Failed to deactivate person' });
    }
  }
}
