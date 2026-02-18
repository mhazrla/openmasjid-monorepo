import { FastifyReply, FastifyRequest } from 'fastify';
import { MosqueService } from './mosque.service';
import { updateMosqueProfileSchema } from './mosque.interface';
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
      const result = updateMosqueProfileSchema.safeParse(req.body);

      if (!result.success) 
      {
        return sendError(reply, 'Validation Error', 400, result.error.issues);
      }
      
      const updated = await this.mosqueService.update(result.data);
      return sendSuccess(reply, updated, 'Profile updated successfully');
    } 
    catch (error) 
    {
      req.log.error(error);
      return sendError(reply, 'Internal Server Error');
    }
  }
}
