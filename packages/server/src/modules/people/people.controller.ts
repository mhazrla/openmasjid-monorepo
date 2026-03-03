import { FastifyRequest, FastifyReply } from 'fastify';
import { PeopleService } from './people.service';
import { createPersonSchema, updatePersonSchema, getPeopleQuerySchema, PeopleFilter } from './people.interface';
import { sendError, sendSuccess } from '../../common/utils/response.formatter';

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
          return sendError(reply, 'Invalid query params', 400, queryValidation.error.format());
      }

      const filters = queryValidation.data as PeopleFilter;
      const data = await this.service.getAllPeople(filters);

      return sendSuccess(reply, data, 'Data fetched successfully', 200, {
        page: filters.page || 1,
        limit: filters.limit || 10
      });
    } 
    catch (error) 
    {
      req.log.error(error);
      return sendError(reply, 'Internal Server Error');
    }
  }

  async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return sendError(reply, 'Invalid ID', 400);

      const data = await this.service.getPersonById(id);
      
      if (!data) return sendError(reply, 'Person not found', 404);

      return sendSuccess(reply, data);
    } 
    catch (error) 
    {
      req.log.error(error);
      return sendError(reply, 'Internal Server Error');
    }
  }

  async create(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const validation = createPersonSchema.safeParse(req.body);
      
      if (!validation.success) 
      {
        return sendError(reply, 'Validation Error', 400, validation.error.format());
      }

      const result = await this.service.createPerson(validation.data);
      return sendSuccess(reply, result, 'Person created', 201);
    } 
    catch (error) 
    {
      req.log.error(error);
      return sendError(reply, 'Failed to create person');
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return sendError(reply, 'Invalid ID', 400);

      const validation = updatePersonSchema.safeParse(req.body);

      if (!validation.success) 
      {
        return sendError(reply, 'Validation Error', 400, validation.error.errors);
      }

      const result = await this.service.updatePerson(id, validation.data);
      
      if (!result) return sendError(reply, 'Person not found', 404);

      return sendSuccess(reply, result, 'Person updated');
    } 
    catch (error) 
    {
      req.log.error(error);
      return sendError(reply, 'Failed to update person');
    }
  }
}
