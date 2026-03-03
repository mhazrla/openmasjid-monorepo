import { FastifyRequest, FastifyReply } from 'fastify';
import { KajianService } from './kajian.service';
import { createKajianSchema, updateKajianSchema, getKajianQuerySchema, fileValidationSchema, KajianFilter } from './kajian.interface';
import { randomUUID } from 'crypto';
import { cloudinaryService } from '../upload/cloudinary.service';
import { sendError, sendSuccess } from '../../common/utils/response.formatter';

export class KajianController 
{
  constructor(private service: KajianService) {}

  private async handleFileUpload(fileStream: NodeJS.ReadableStream, mimetype: string): Promise<string> 
  {
    const fileCheck = fileValidationSchema.safeParse({ mimetype });
    
    const mimeToExt: Record<string, string> = 
    {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp'
    };

    if (!fileCheck.success || !mimeToExt[mimetype]) 
    {
        throw new Error('Invalid file type. Only JPG, PNG, WEBP allowed.');
    }

    return await cloudinaryService.uploadFromStream(fileStream, 'posters');
  }

  async getAll(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const queryValidation = getKajianQuerySchema.safeParse(req.query);
      
      if (!queryValidation.success) 
      {
          return reply.code(400).send({ message: 'Invalid query params' });
      }

      const filters = queryValidation.data as KajianFilter;
      
      const data = await this.service.getAll(filters);
      
      return sendSuccess(reply, data, 'Data fetched successfully', 200, 
      {
        page: filters.page || 1,
        limit: filters.limit || 10,
      });
    } 
    catch (error) 
    {
      req.log.error(error);

      return sendError(reply, 'Internal Server Error');
    }
  }

  async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(reply, 'Invalid ID', 400);

    const data = await this.service.getById(id);
    if (!data) return sendError(reply, 'Event not found', 404);
    
    return sendSuccess(reply, data);
  }

  async create(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const parts = req.parts();
      let uploadedPath: string | undefined;
      const body: Record<string, any> = {};

      for await (const part of parts) 
      {
        if (part.type === 'file') 
        {
          if (part.fieldname === 'file' || part.fieldname === 'poster') 
          {
             // Instead of using toBuffer, we pipe directly to Cloudinary
             uploadedPath = await this.handleFileUpload(part.file, part.mimetype);
          } 
          else 
          {
             part.file.resume();
          }
        } 
         else 
         {
           const { fieldname, value } = part;
           
           // Snake_case to camelCase mapping
           const fieldMap: Record<string, string> = { time_mode: 'timeMode', bada_sholat: 'badaSholat' };
           const key = fieldMap[fieldname] || fieldname;

           if (['speakerId', 'dayOfWeek'].includes(key)) 
           {
              body[key] = value ? parseInt(value as string) : null;
           } 
           else if (key === 'status') 
           {
              body[key] = value === 'true' || value === 'active';
           } 
           else if (fieldname === 'isActive') 
           {
              body['status'] = value === 'true';
           } 
           else if (key === 'date' && !value) 
           {
              body[key] = null;
           } 
           else 
           {
              body[key] = value;
           }
         }
      }

      const validation = createKajianSchema.safeParse(body);

      if (!validation.success) 
      {
        return sendError(reply, 'Validation Error', 400, validation.error.format());
      }

      const result = await this.service.create(validation.data, uploadedPath);
      return sendSuccess(reply, result, 'Event created', 201);

    } 
    catch (error: any) 
    {
      req.log.error(error);
      
      const status = error.message.includes('Invalid file') ? 400 : 500;
      return sendError(reply, error.message || 'Internal Error', status);
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(reply, 'Invalid ID', 400);

    try 
    {
      const parts = req.parts();
      let uploadedPath: string | undefined;
      const body: Record<string, any> = {};

      for await (const part of parts) 
      {
        if (part.type === 'file') 
        {
           if (part.fieldname === 'file' || part.fieldname === 'poster') 
           {
              uploadedPath = await this.handleFileUpload(part.file, part.mimetype);
           } 
           else 
           {
              part.file.resume();
           }
        } 
        else 
        {
           const fieldMap: Record<string, string> = { time_mode: 'timeMode', bada_sholat: 'badaSholat' };
           const key = fieldMap[part.fieldname] || part.fieldname;
           body[key] = part.value;
        }
      }

      const validation = updateKajianSchema.safeParse(body);

      if (!validation.success) 
      {
        return sendError(reply, 'Validation Error', 400, validation.error.format());
      }

      const result = await this.service.update(id, validation.data, uploadedPath);
      if (!result) return sendError(reply, 'Event not found', 404);

      return sendSuccess(reply, result, 'Event updated');

    } 
    catch (error: any) 
    {
      req.log.error(error);
      return sendError(reply, 'Internal Server Error');
    }
  }
}
