
import { FastifyRequest, FastifyReply } from 'fastify';
import { HadisService } from './hadis.service';

export class HadisController 
{
    constructor(private service: HadisService) {}

    async getDisplay(req: FastifyRequest, reply: FastifyReply) 
    {
        try 
        {
            const data = await this.service.getDisplayHadith();
            
            if (!data) 
            {
                return reply.code(404).send({ message: 'No Hadith available' });
            }

            return reply.code(200).send({ data });
        } 
        catch (error) 
        {
            req.log.error(error);
            
            return reply.code(500).send({ message: 'Internal Server Error' });
        }
    }
}
