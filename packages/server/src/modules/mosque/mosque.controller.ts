import { FastifyReply, FastifyRequest } from 'fastify';
import { MosqueService } from './mosque.service';
import { sendError, sendSuccess } from '../../common/utils/response.formatter';

export class MosqueController 
{
  constructor(private mosqueService: MosqueService) {}

  async get(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const profile = await this.mosqueService.get();
      return sendSuccess(reply, profile, 'Profile fetched successfully');
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
      const updated = await this.mosqueService.updateProfileWithMultipart(req);
      return sendSuccess(reply, updated, 'Profile updated successfully');
    } 
    catch (error: any) 
    {
      req.log.error(error);
      const status = error.message.includes('Validation') || error.message.includes('Invalid') ? 400 : 500;
      return sendError(reply, error.message || 'Internal Server Error', status);
    }
  }
}
