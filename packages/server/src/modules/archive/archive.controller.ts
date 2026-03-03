import { FastifyReply, FastifyRequest } from 'fastify';
import { ArchiveService } from './archive.service';
import { z } from 'zod';

const createAlbumSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  eventDate: z.coerce.date().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  isFeatured: z.boolean().optional(),
});

const addVideoMediaSchema = z.object({
  type: z.literal('video'),
  mediaUrl: z.string().url(),
  title: z.string().optional()
});

export class ArchiveController 
{
  constructor(private service: ArchiveService) {}
  async getAllAlbums(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const albums = await this.service.getAlbums();
      return reply.send({ status: 'success', data: albums });
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async getAlbumMedia(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const albumId = parseInt(req.params.id, 10);
      if (isNaN(albumId)) 
      {
        return reply.status(400).send({ status: 'error', message: 'Invalid album ID' });
      }

      const media = await this.service.getAlbumMedia(albumId);
      return reply.send({ status: 'success', data: media });
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async createAlbum(req: FastifyRequest, reply: FastifyReply) 
  {
    try 
    {
      const parsed = createAlbumSchema.safeParse(req.body);
      if (!parsed.success) 
      {
        return reply.status(400).send({ status: 'error', message: 'Validation Error', errors: parsed.error.issues });
      }

      const album = await this.service.createAlbum(parsed.data);
      return reply.status(201).send({ status: 'success', data: album });
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async addMedia(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const albumId = parseInt(req.params.id, 10);
      if (isNaN(albumId)) 
      {
        return reply.status(400).send({ status: 'error', message: 'Invalid album ID' });
      }

      if (req.isMultipart()) 
      {
        // Handle Image upload (multipart/form-data)
        const data = await req.file();
        
        if (!data) 
        {
          return reply.status(400).send({ status: 'error', message: 'File is required for type=image' });
        }
        
        // Form fields handling
        const titleField = data.fields.title as any;
        const title = titleField ? titleField.value : undefined;

        const buffer = await data.toBuffer();
        
        const media = await this.service.addImageMedia(albumId, title, buffer);
        return reply.status(201).send({ status: 'success', data: media });
      }
      else 
      {
        // Handle Video link (application/json)
        const parsed = addVideoMediaSchema.safeParse(req.body);
        if (!parsed.success) 
        {
          return reply.status(400).send({ status: 'error', message: 'Validation Error', errors: parsed.error.issues });
        }

        const media = await this.service.addVideoMedia(albumId, parsed.data.title, parsed.data.mediaUrl);
        return reply.status(201).send({ status: 'success', data: media });
      }
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async updateAlbum(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const albumId = parseInt(req.params.id, 10);
      if (isNaN(albumId)) 
      {
        return reply.status(400).send({ status: 'error', message: 'Invalid album ID' });
      }

      const parsed = createAlbumSchema.partial().safeParse(req.body);
      if (!parsed.success) 
      {
        return reply.status(400).send({ status: 'error', message: 'Validation Error', errors: parsed.error.issues });
      }

      const album = await this.service.updateAlbum(albumId, parsed.data);
      if (!album) 
      {
        return reply.status(404).send({ status: 'error', message: 'Album not found' });
      }
      return reply.send({ status: 'success', data: album });
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async deleteAlbum(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const albumId = parseInt(req.params.id, 10);
      if (isNaN(albumId)) 
      {
        return reply.status(400).send({ status: 'error', message: 'Invalid album ID' });
      }

      await this.service.deleteAlbum(albumId);
      return reply.send({ status: 'success', message: 'Album deleted successfully' });
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
  }

  async deleteMedia(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) 
  {
    try 
    {
      const mediaId = parseInt(req.params.id, 10);
      if (isNaN(mediaId)) 
      {
        return reply.status(400).send({ status: 'error', message: 'Invalid media ID' });
      }

      await this.service.deleteMedia(mediaId);
      return reply.send({ status: 'success', message: 'Media deleted successfully' });
    } 
    catch (error) 
    {
      req.log.error(error);
      return reply.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
  }
}
