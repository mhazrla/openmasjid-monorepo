import { FastifyRequest, FastifyReply } from 'fastify';
import { RamadanService } from './ramadan.service';
import { 
  CreateRamadanConfigDto, 
  UpdateRamadanConfigDto, 
  UpdateRamadanScheduleDto,
  createRamadanConfigSchema,
  updateRamadanConfigSchema,
  updateRamadanScheduleSchema
} from './ramadan.interface';

export class RamadanController 
{
  constructor(private service: RamadanService) {}

  async getActive(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const data = await this.service.getActiveConfig();

      return reply.code(200).send({ success: true, data });
    } 
    catch (error) 
    {
      req.log.error(error);
      
      return reply.code(500).send({ success: false, message: 'Internal Server Error' });
    }
  }

  async init(req: FastifyRequest<{ Body: CreateRamadanConfigDto }>, reply: FastifyReply) 
  {
    try 
    {
      const validation = createRamadanConfigSchema.safeParse(req.body);
      
      if (!validation.success) 
      {
        return reply.code(400).send({ 
          success: false,
          message: 'Validation Error', 
          errors: validation.error.format() 
        });
      }

      const result = await this.service.initializeConfig(validation.data);

      return reply.code(201).send({ success: true, data: result, message: 'Ramadan config initialized' });
    } 
    catch (error) 
    {
      req.log.error(error);

      return reply.code(500).send({ success: false, message: 'Failed to initialize config' });
    }
  }

  async updateConfig(req: FastifyRequest<{ Params: { id: string }, Body: UpdateRamadanConfigDto }>, reply: FastifyReply) 
  {
    try 
    {
      const id = parseInt(req.params.id);

      if (isNaN(id)) 
      {
        return reply.code(400).send({ success: false, message: 'Invalid ID' });
      }

      const validation = updateRamadanConfigSchema.safeParse(req.body);

      if (!validation.success) 
      {
        return reply.code(400).send({ success: false, message: 'Validation Error', errors: validation.error.errors });
      }

      const result = await this.service.updateConfig(id, validation.data);
      
      if (!result) 
      {
        return reply.code(404).send({ success: false, message: 'Config not found' });
      }

      return reply.code(200).send({ success: true, data: result, message: 'Config updated' });
    } 
    catch (error) 
    {
      req.log.error(error);

      return reply.code(500).send({ success: false, message: 'Failed to update config' });
    }
  }

  async updateSchedule(req: FastifyRequest<{ Params: { id: string }, Body: Omit<UpdateRamadanScheduleDto, 'id'> }>, reply: FastifyReply) 
  {
    try 
    {
      const id = parseInt(req.params.id);

      if (isNaN(id)) 
      {
        return reply.code(400).send({ success: false, message: 'Invalid ID' });
      }

      const payload = { ...req.body, id };
      const validation = updateRamadanScheduleSchema.safeParse(payload);
      
      if (!validation.success) 
      {
        return reply.code(400).send({ success: false, message: 'Validation Error', errors: validation.error.errors });
      }

      const result = await this.service.updateSchedule(payload);

      if (!result) 
      {
        return reply.code(404).send({ success: false, message: 'Schedule not found' });
      }

      return reply.code(200).send({ success: true, data: result, message: 'Schedule updated' });
    } 
    catch (error) 
    {
      req.log.error(error);

      return reply.code(500).send({ success: false, message: 'Failed to update schedule' });
    }
  }
}
