import { ShortlinkRepository } from './shortlink.repository';
import { CreateShortlinkDto } from './shortlink.interface';

export class ShortlinkService {
  constructor(private repository: ShortlinkRepository) {}

  private generateSlug(length: number = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i++) 
    {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  async createShortlink(data: CreateShortlinkDto) 
  {
    let slug = data.slug;

    if (!slug) 
    {
      let retries = 5;

      while (retries > 0) 
      {
        const candidate = this.generateSlug();
        const exists = await this.repository.checkSlugExists(candidate);
        
        if (exists) 
        {
            retries--;

            continue;
        }

        slug = candidate;
        try 
        {
           return await this.repository.create({ ...data, slug });
        } 
        catch (e: any) 
        {
           if (e.code === 'SQLITE_CONSTRAINT_UNIQUE' || e.message?.includes('UNIQUE constraint')) {
             retries--;
             
             continue;
           }

           throw e;
        }
      }
      throw new Error('Failed to generate unique slug after retries');
    }

    return this.repository.create({ ...data, slug });
  }

  async processRedirect(slug: string) 
  {
    const shortlink = await this.repository.findBySlug(slug);

    if (!shortlink) 
    {
      throw new Error('Shortlink not found');
    }

    this.repository.incrementClicks(slug).catch(err => 
    {
      console.error(`[Shortlink] Failed to increment clicks for ${slug}:`, err);
    });

    return shortlink.originalUrl;
  }

  async getAll() 
  {
    return this.repository.findAll();
  }

  async delete(id: number) 
  {
    return this.repository.delete(id);
  }
}
