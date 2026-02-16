import { FastifyReply, FastifyRequest } from 'fastify';
import { MosqueService } from './mosque.service';
import { updateMosqueProfileSchema } from './mosque.interface';

export class MosqueController 
{
  constructor(private mosqueService: MosqueService) {}

  async get(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const profile = await this.mosqueService.get();
      
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

  async update(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const result = updateMosqueProfileSchema.safeParse(req.body);

      if (!result.success) 
      {
        return reply.code(400).send({
          success: false,
          message: 'Validation Error',
          errors: result.error.issues
        });
      }
      
      const updated = await this.mosqueService.update(result.data);
      
      return reply.code(200).send({
        success: true,
        data: updated,
        message: 'Profile updated successfully'
      });
    } 
    catch (error: any) 
    {
      console.error(error);
      
      return reply.code(500).send({ success: false, message: 'Internal Server Error' });
    }
  }
}
