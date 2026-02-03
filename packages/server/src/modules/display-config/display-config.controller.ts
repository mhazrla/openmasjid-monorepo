import { FastifyReply, FastifyRequest } from 'fastify';
import { DisplayConfigService } from './display-config.service';
import { updateDisplayConfigSchema } from './display-config.interface';

export class DisplayConfigController 
{
  constructor(private service: DisplayConfigService) {}

  async getConfig(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const config = await this.service.getConfig();
      
      return reply.send({ success: true, data: config });
    } 
    catch (error) 
    {
      console.error(error);
      
      return reply.code(500).send({ success: false, message: 'Internal Error' });
    }
  }

  async updateConfig(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const body = updateDisplayConfigSchema.parse(req.body);
      
      const updated = await this.service.updateConfig(body);
      return reply.send({ success: true, data: updated, message: 'Configuration updated' });
    } 
    catch (error: any) 
    {
      if (error.issues) 
      {
        return reply.code(400).send({ success: false, message: 'Validation Error', errors: error.issues });
      }

      console.error(error);
      return reply.code(500).send({ success: false, message: 'Internal Error' });
    }
  }
}
