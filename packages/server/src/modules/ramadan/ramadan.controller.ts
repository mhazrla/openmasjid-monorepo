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
import { sendError, sendSuccess } from '../../common/utils/response.formatter';

export class RamadanController 
{
  constructor(private service: RamadanService) {}

  async getActive(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const data = await this.service.getActiveConfig();
      return sendSuccess(reply, data, 'Active ramadan config fetched');
    } 
    catch (error) 
    {
      req.log.error(error);
      return sendError(reply, 'Internal Server Error');
    }
  }

  async init(req: FastifyRequest<{ Body: CreateRamadanConfigDto }>, reply: FastifyReply) 
  {
    try 
    {
      const validation = createRamadanConfigSchema.safeParse(req.body);
      
      if (!validation.success) 
      {
        return sendError(reply, 'Validation Error', 400, validation.error.format());
      }

      const result = await this.service.initializeConfig(validation.data);
      return sendSuccess(reply, result, 'Ramadan config initialized', 201);
    } 
    catch (error) 
    {
      req.log.error(error);
      return sendError(reply, 'Failed to initialize config');
    }
  }

  async updateConfig(req: FastifyRequest<{ Params: { id: string }, Body: UpdateRamadanConfigDto }>, reply: FastifyReply) 
  {
    try 
    {
      const id = parseInt(req.params.id);

      if (isNaN(id)) 
      {
        return sendError(reply, 'Invalid ID', 400);
      }

      const validation = updateRamadanConfigSchema.safeParse(req.body);

      if (!validation.success) 
      {
        return sendError(reply, 'Validation Error', 400, validation.error.errors);
      }

      const result = await this.service.updateConfig(id, validation.data);
      
      if (!result) 
      {
        return sendError(reply, 'Config not found', 404);
      }

      return sendSuccess(reply, result, 'Config updated');
    } 
    catch (error) 
    {
      req.log.error(error);
      return sendError(reply, 'Failed to update config');
    }
  }

  async updateSchedule(req: FastifyRequest<{ Params: { id: string }, Body: Omit<UpdateRamadanScheduleDto, 'id'> }>, reply: FastifyReply) 
  {
    try 
    {
      const id = parseInt(req.params.id);

      if (isNaN(id)) 
      {
        return sendError(reply, 'Invalid ID', 400);
      }

      const payload = { ...req.body, id };
      const validation = updateRamadanScheduleSchema.safeParse(payload);
      
      if (!validation.success) 
      {
        return sendError(reply, 'Validation Error', 400, validation.error.errors);
      }

      const result = await this.service.updateSchedule(payload);

      if (!result) 
      {
        return sendError(reply, 'Schedule not found', 404);
      }

      return sendSuccess(reply, result, 'Schedule updated');
    } 
    catch (error) 
    {
      req.log.error(error);
      return sendError(reply, 'Failed to update schedule');
    }
  }
}
