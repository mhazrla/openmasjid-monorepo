import { FastifyReply, FastifyRequest } from 'fastify';
import { ShortlinkService } from './shortlink.service';
import { createShortlinkSchema, getShortlinksQuerySchema, ShortlinkFilter } from './shortlink.interface';
import { z } from 'zod';
import { sendError, sendSuccess } from '../../common/utils/response.formatter';

export class ShortlinkController 
{
  constructor(private service: ShortlinkService) {}

  async handleRedirect(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const paramsSchema = z.object({ slug: z.string() });
      const { slug } = paramsSchema.parse(req.params);
      
      const url = await this.service.processRedirect(slug);
      return reply.redirect(url);
    } 
    catch (error: any) 
    {
      return reply.code(404).send('Shortlink Not Found');
    }
  }

  async create(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const body = createShortlinkSchema.parse(req.body);
      const result = await this.service.createShortlink(body);
      return sendSuccess(reply, result, 'Shortlink created', 201);
    } 
    catch (error: any) 
    {
        if (error.issues) return sendError(reply, 'Validation Error', 400, error.issues);
        req.log.error(error);
        return sendError(reply, 'Internal Server Error');
    }
  }

  async getAll(req: FastifyRequest, reply: FastifyReply) 
  {
      try 
      {
          const queryValidation = getShortlinksQuerySchema.safeParse(req.query);
          if (!queryValidation.success) return sendError(reply, 'Invalid query params', 400, queryValidation.error.format());

          const filters = queryValidation.data as ShortlinkFilter;
          const data = await this.service.getAll(filters);

          return sendSuccess(reply, data, 'Shortlinks fetched successfully', 200, {
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

  async delete(req: FastifyRequest, reply: FastifyReply) 
  {
      try 
      {
          const params = z.object({ id: z.coerce.number() }).parse(req.params);
          await this.service.delete(params.id);
          return sendSuccess(reply, null, 'Deleted');
      } 
      catch (error) 
      {
          req.log.error(error);
          return sendError(reply, 'Internal Server Error');
      }
  }
  
  async update(req: FastifyRequest, reply: FastifyReply) 
  {
      try 
      {
          const params = z.object({ id: z.coerce.number() }).parse(req.params);
          const body = createShortlinkSchema.partial().parse(req.body);
          
          const result = await this.service.update(params.id, body);
          return sendSuccess(reply, result, 'Shortlink updated');
      } 
      catch (error: any) 
      {
          if (error.issues) return sendError(reply, 'Validation Error', 400, error.issues);
          if (error.message === 'Slug already exists') return sendError(reply, 'Slug already taken', 409);

          req.log.error(error);
          return sendError(reply, 'Internal Server Error');
      }
  }
}
