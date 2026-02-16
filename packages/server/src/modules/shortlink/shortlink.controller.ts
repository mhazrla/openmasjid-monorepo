import { FastifyReply, FastifyRequest } from 'fastify';
import { ShortlinkService } from './shortlink.service';
import { createShortlinkSchema } from './shortlink.interface';
import { z } from 'zod';

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
    catch (error) 
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

      return reply.send({ success: true, data: result });
    } 
    catch (error: any) 
    {
        if (error.issues) 
        {
            return reply.code(400).send({ success: false, message: 'Validation Error', errors: error.issues });
        }

        console.error(error);
        return reply.code(500).send({ success: false, message: 'Internal Server Error' });
    }
  }

  async getAll(req: FastifyRequest, reply: FastifyReply) 
  {
      try 
      {
          const list = await this.service.getAll();
          return reply.send({ success: true, data: list });
      } 
      catch (error) 
      {
          console.error(error);
          return reply.code(500).send({ success: false, message: 'Internal Error' });
      }
  }

  async delete(req: FastifyRequest, reply: FastifyReply) 
  {
      try 
      {
          const params = z.object({ id: z.coerce.number() }).parse(req.params);
          await this.service.delete(params.id);
          return reply.send({ success: true, message: 'Deleted' });
      } 
      catch (error) 
      {
          console.error(error);
          return reply.code(500).send({ success: false, message: 'Internal Error' });
      }
  }
  
  async update(req: FastifyRequest, reply: FastifyReply) 
  {
      try 
      {
          const params = z.object({ id: z.coerce.number() }).parse(req.params);
          const body = createShortlinkSchema.partial().parse(req.body);
          
          const result = await this.service.update(params.id, body);
          return reply.send({ success: true, data: result });
      } 
      catch (error: any) 
      {
          if (error.issues) 
          {
              return reply.code(400).send({ success: false, message: 'Validation Error', errors: error.issues });
          }
          if (error.message === 'Slug already exists') 
          {
               return reply.code(409).send({ success: false, message: 'Slug already taken' });
          }

          console.error(error);
          
          return reply.code(500).send({ success: false, message: 'Internal Error' });
      }
  }
}
