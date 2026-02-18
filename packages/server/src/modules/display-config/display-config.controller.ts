import { FastifyReply, FastifyRequest } from 'fastify';
import { DisplayConfigService } from './display-config.service';
import { updateDisplayConfigSchema } from './display-config.interface';
import { sendError, sendSuccess } from '../../common/utils/response.formatter';

export class DisplayConfigController 
{
  constructor(private service: DisplayConfigService) {}

  async get(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const config = await this.service.get();
      return sendSuccess(reply, config, 'Display configuration fetched');
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
      const result = updateDisplayConfigSchema.safeParse(req.body);
      
      if (!result.success) 
      {
        return sendError(reply, 'Validation Error', 400, result.error.issues);
      }
      
      const updated = await this.service.update(result.data);
      return sendSuccess(reply, updated, 'Display configuration updated successfully');
    } 
    catch (error) 
    {
      req.log.error(error);
      return sendError(reply, 'Internal Server Error');
    }
  }
}
