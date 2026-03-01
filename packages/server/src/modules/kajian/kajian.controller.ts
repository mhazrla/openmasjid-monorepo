import { FastifyRequest, FastifyReply } from 'fastify';
import { KajianService } from './kajian.service';
import { createKajianSchema, updateKajianSchema, getKajianQuerySchema, fileValidationSchema, KajianFilter } from './kajian.interface';
import util from 'util';
import { pipeline } from 'stream';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileExists } from '../../plugins/fileChecker';
import { sendError, sendSuccess } from '../../common/utils/response.formatter';

const pump = util.promisify(pipeline);

export class KajianController 
{
  constructor(private service: KajianService) {}

  private async handleFileUpload(part: any): Promise<string> 
  {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'posters');
    
    const fileCheck = fileValidationSchema.safeParse({ mimetype: part.mimetype });
    
    const mimeToExt: Record<string, string> = 
    {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp'
    };

    if (!fileCheck.success || !mimeToExt[part.mimetype]) 
    {
        part.file.resume();
        throw new Error('Invalid file type. Only JPG, PNG, WEBP allowed.');
    }

    if (!(await fileExists(uploadDir))) 
    {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const ext = mimeToExt[part.mimetype];
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await pump(part.file, createWriteStream(filepath));

    return `/public/uploads/posters/${filename}`;
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
    let uploadedPath: string | undefined; 

    try 
    {
      const parts = req.parts();
      const body: Record<string, any> = {};

      for await (const part of parts) 
      {
        if (part.type === 'file') 
        {
          if (part.fieldname === 'file' || part.fieldname === 'poster') 
          {
             uploadedPath = await this.handleFileUpload(part);
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
        if (uploadedPath && await fileExists(path.join(process.cwd(), uploadedPath))) 
        {
          await fs.unlink(path.join(process.cwd(), uploadedPath));
        }

        return sendError(reply, 'Validation Error', 400, validation.error.format());
      }

      const result = await this.service.create(validation.data, uploadedPath);
      return sendSuccess(reply, result, 'Event created', 201);

    } 
    catch (error: any) 
    {
      req.log.error(error);
      if (uploadedPath) 
      { 
        try 
        { 
          const fullPath = path.join(process.cwd(), uploadedPath);
          if (await fileExists(fullPath)) await fs.unlink(fullPath); 
        } 
        catch {}
      }
      
      const status = error.message.includes('Invalid file') ? 400 : 500;
      return sendError(reply, error.message || 'Internal Error', status);
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(reply, 'Invalid ID', 400);

    let uploadedPath: string | undefined;

    try 
    {
      const parts = req.parts();
      const body: Record<string, any> = {};

      for await (const part of parts) 
      {
        if (part.type === 'file') 
        {
           uploadedPath = await this.handleFileUpload(part);
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
        if (uploadedPath) 
        {
           const fullPath = path.join(process.cwd(), uploadedPath);
           if (await fileExists(fullPath)) await fs.unlink(fullPath);
        }

        return sendError(reply, 'Validation Error', 400, validation.error.format());
      }

      const result = await this.service.update(id, validation.data, uploadedPath);
      if (!result) return sendError(reply, 'Event not found', 404);

      return sendSuccess(reply, result, 'Event updated');

    } 
    catch (error: any) 
    {
      if (uploadedPath) 
      {
         try 
         {
            const fullPath = path.join(process.cwd(), uploadedPath);
            if (await fileExists(fullPath)) await fs.unlink(fullPath);
         }
        catch {}
      }

      req.log.error(error);
      return sendError(reply, 'Internal Server Error');
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(reply, 'Invalid ID', 400);

    const result = await this.service.delete(id);

    if (!result) return sendError(reply, 'Event not found', 404);

    return sendSuccess(reply, result, 'Event deleted successfully');
  }
}
