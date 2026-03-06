import { FastifyReply, FastifyRequest } from 'fastify';
import { PrayerTimeService } from './prayer-time.service';
import { z } from 'zod';
import { sendError, sendSuccess } from '../../common/utils/response.formatter';

export class PrayerTimeController 
{
  constructor(private service: PrayerTimeService) {}

  async getTimes(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const querySchema = z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(() => new Date().toISOString().split('T')[0])
      });

      const { date } = querySchema.parse(req.query);
      const data = await this.service.getTimesForDate(date);

      if (!data) 
      {
        return sendError(reply, 'Data not found', 404);
      }

      return sendSuccess(reply, data);
    } 
    catch (error) 
    {
      req.log.error(error);
      return sendError(reply, 'Internal Server Error');
    }
  }

  async syncTimes(req: FastifyRequest, reply: FastifyReply)
  {
    try 
    {
      const bodySchema = z.object({
        month: z.coerce.number().min(1).max(12),
        year: z.coerce.number().min(2020).max(2030),
        cityId: z.string()
      });
      
      const { month, year, cityId } = bodySchema.parse(req.body);
      const result = await this.service.syncFromExternalApi(cityId, year.toString(), month.toString());

      return sendSuccess(reply, { count: result.length }, 'Sync successful');
    } 
    catch (error) 
    {
       req.log.error(error);
       return sendError(reply, 'Sync failed');
    }
  }
}
