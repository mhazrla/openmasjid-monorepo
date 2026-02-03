import { db } from '../../db';
import { shortlinks } from '../../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { InsertShortlink } from './shortlink.interface';

export class ShortlinkRepository 
{
  async create(data: InsertShortlink) 
  {
    const result = await db.insert(shortlinks).values(data).returning();

    return result[0];
  }

  async findBySlug(slug: string) 
  {
    const result = await db.select()
      .from(shortlinks)
      .where(eq(shortlinks.slug, slug))
      .limit(1);
      
    return result[0] || null;
  }

  async incrementClicks(slug: string) 
  {
    await db.update(shortlinks)
      .set({ clicks: sql`${shortlinks.clicks} + 1` })
      .where(eq(shortlinks.slug, slug));
  }

  async checkSlugExists(slug: string) 
  {
    const result = await db.select({ id: shortlinks.id }).from(shortlinks).where(eq(shortlinks.slug, slug)).limit(1);
    
    return result.length > 0;
  }

  async findAll() 
  {
    return db.select().from(shortlinks).orderBy(desc(shortlinks.createdAt));
  }

  async delete(id: number) 
  {
    return db.delete(shortlinks).where(eq(shortlinks.id, id)).returning();
  }
}
