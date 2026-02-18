import { FastifyRequest, FastifyReply } from 'fastify';
import { HadisService } from './hadis.service';
import { sendError, sendSuccess } from '../../common/utils/response.formatter';

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
                return sendError(reply, 'No Hadith available', 404);
            }

            return sendSuccess(reply, data);
        } 
        catch (error) 
        {
            req.log.error(error);
            return sendError(reply, 'Internal Server Error');
        }
    }
}
