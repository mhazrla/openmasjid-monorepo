import { FastifyReply, FastifyRequest } from 'fastify';
import { DisplayConfigService } from './display-config.service';
import { updateDisplayConfigSchema } from './display-config.interface';

export class DisplayConfigController 
{
  constructor(private service: DisplayConfigService) {}

  async get(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const config = await this.service.get();
      
      return reply.code(200).send({
        success: true,
        data: config
      });
    } 
    catch (error) 
    {
      console.error(error);
      
      return reply.code(500).send({ success: false, message: 'Internal Server Error' });
    }
  }

  async update(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const result = updateDisplayConfigSchema.safeParse(req.body);
      
      if (!result.success) 
      {
        return reply.code(400).send({
          success: false,
          message: 'Validation Error',
          errors: result.error.issues
        });
      }
      
      const updated = await this.service.update(result.data);
      
      return reply.code(200).send({
        success: true,
        data: updated,
        message: 'Display configuration updated successfully'
      });
    } 
    catch (error) 
    {
      console.error(error);
      
      return reply.code(500).send({ success: false, message: 'Internal Server Error' });
    }
  }
}
