import { FastifyRequest, FastifyReply } from 'fastify';
import { KajianService } from './kajian.service';
import { createKajianSchema, updateKajianSchema, getKajianQuerySchema, fileValidationSchema } from './kajian.interface';
import util from 'util';
import { pipeline } from 'stream';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

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

    if (!fs.existsSync(uploadDir)) 
    {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = mimeToExt[part.mimetype];
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await pump(part.file, fs.createWriteStream(filepath));
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

      let typeFilter = queryValidation.data.type;

      if (typeFilter === 'all') 
      {
          typeFilter = undefined;
      }

      const statusFilter = queryValidation.data.status === 'inactive' ? false : (queryValidation.data.status === 'active' ? true : undefined);

      const filters = 
      {
        type: typeFilter,
        upcoming: (req.query as any).upcoming,
        search: queryValidation.data.search,
        status: statusFilter,
      };
      
      const data = await this.service.getAll(filters);
      
      return reply.code(200).send({ data });
    } 
    catch (error) 
    {
      req.log.error(error);
      
      return reply.code(500).send({ message: 'Internal Server Error' });
    }
  }

  async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return reply.code(400).send({ message: 'Invalid ID' });

    const data = await this.service.getById(id);
    if (!data) return reply.code(404).send({ message: 'Event not found' });
    
    return reply.code(200).send({ data });
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
          
          if (['speakerId', 'dayOfWeek'].includes(fieldname)) 
          {
             body[fieldname] = value ? parseInt(value as string) : null;
          } 
          else if (fieldname === 'status') 
          {
             body[fieldname] = value === 'true' || value === 'active';
          }
          else if (fieldname === 'isActive') 
          {
             body['status'] = value === 'true';
          }
          else if (fieldname === 'date' && !value) 
          {
             body[fieldname] = null;
          }
          else 
          {
             body[fieldname] = value;
          }
        }
      }

      const validation = createKajianSchema.safeParse(body);

      if (!validation.success) 
      {
        if (uploadedPath && fs.existsSync(path.join(process.cwd(), uploadedPath))) 
        {
            fs.unlinkSync(path.join(process.cwd(), uploadedPath));
        }
        return reply.code(400).send({ 
          message: 'Validation Error', 
          errors: validation.error.format() 
        });
      }

      const result = await this.service.create(validation.data, uploadedPath);
      return reply.code(201).send({ data: result, message: 'Event created' });

    } catch (error: any) 
    {
      req.log.error(error);
      if (uploadedPath) 
      {
          try 
          { 
            fs.unlinkSync(path.join(process.cwd(), uploadedPath)); 
          } 
          catch {}
      }
      
      const status = error.message.includes('Invalid file') ? 400 : 500;
      return reply.code(status).send({ message: error.message || 'Internal Error' });
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return reply.code(400).send({ message: 'Invalid ID' });

    let uploadedPath: string | undefined;

    try {
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
           body[part.fieldname] = part.value;
        }
      }

      const validation = updateKajianSchema.safeParse(body);

      if (!validation.success) 
      {
        if (uploadedPath) fs.unlinkSync(path.join(process.cwd(), uploadedPath));
        return reply.code(400).send({ message: 'Validation Error', errors: validation.error.format() });
      }

      const result = await this.service.update(id, validation.data, uploadedPath);
      if (!result) return reply.code(404).send({ message: 'Event not found' });

      return reply.code(200).send({ data: result, message: 'Event updated' });

    } 
    catch (error: any) 
    {
      if (uploadedPath) try { fs.unlinkSync(path.join(process.cwd(), uploadedPath)); } catch {}
      req.log.error(error);

      return reply.code(500).send({ message: 'Internal Server Error' });
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return reply.code(400).send({ message: 'Invalid ID' });

    const existing = await this.service.getById(id);
    if (!existing) return reply.code(404).send({ message: 'Event not found' });

    const result = await this.service.delete(id);

    if (existing.posterUrl) 
    {
      try 
      {
        const filePath = path.join(process.cwd(), existing.posterUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } 
      catch (e) 
      {
        req.log.warn(`Failed to delete poster file for id ${id}`);
      }
    }

    return reply.code(200).send({ 
       message: 'Event deleted successfully',
       data: result
    });
  }
}