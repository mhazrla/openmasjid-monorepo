import { FastifyReply, FastifyRequest } from 'fastify';
import { MosqueService } from './mosque.service';
import { updateMosqueProfileSchema } from './mosque.interface';

export class MosqueController 
{
  constructor(private mosqueService: MosqueService) {}

  async getProfile(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const profile = await this.mosqueService.getProfile();
      
      return reply.code(200).send({
        success: true,
        data: profile
      });
    } 
    catch (error) 
    {
      console.error(error);
      
      return reply.code(500).send({ success: false, message: 'Internal Server Error' });
    }
  }

  async updateProfile(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const body = updateMosqueProfileSchema.parse(req.body);
      
      const updated = await this.mosqueService.updateProfile(body);
      
      return reply.code(200).send({
        success: true,
        data: updated,
        message: 'Profile updated successfully'
      });
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
}
