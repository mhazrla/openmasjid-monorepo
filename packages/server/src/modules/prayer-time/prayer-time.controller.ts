import { FastifyReply, FastifyRequest } from 'fastify';
import { PrayerTimeService } from './prayer-time.service';
import { z } from 'zod';

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
        return reply.code(404).send({ success: false, message: 'Data not found' });
      }

      return reply.send({ success: true, data });
    } 
    catch (error) 
    {
      console.error(error);

      return reply.code(500).send({ success: false, message: 'Internal Error' });
    }
  }

  async syncTimes(req: FastifyRequest, reply: FastifyReply) {
    try 
    {
      const bodySchema = z.object({
        month: z.string().regex(/^\d{2}$/),
        year: z.string().regex(/^\d{4}$/),
        cityId: z.string()
      });
      
      const { month, year, cityId } = bodySchema.parse(req.body);
      const result = await this.service.syncFromExternalApi(cityId, year, month);

      return reply.send({ success: true, count: result.length, message: 'Sync successful' });
    } 
    catch (error) 
    {
       console.error(error);
       
       return reply.code(500).send({ success: false, message: 'Sync failed' });
    }
  }
}
