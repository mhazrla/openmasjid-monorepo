import { db } from '../../db';
import { shortlinks } from '../../db/schema';
import { eq, desc, sql, asc } from 'drizzle-orm';
import { InsertShortlink, ShortlinkFilter } from './shortlink.interface';

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

  async findAll(filters: ShortlinkFilter) 
  {
    const limit = filters.limit || 10;
    const offset = (filters.page && filters.page > 0) ? (filters.page - 1) * limit : 0;
    
    const orderBy = filters.sortBy && (shortlinks as any)[filters.sortBy] 
        ? (filters.sortOrder === 'asc' ? asc((shortlinks as any)[filters.sortBy]) : desc((shortlinks as any)[filters.sortBy]))
        : desc(shortlinks.createdAt);

    return db.select()
      .from(shortlinks)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
  }

  async delete(id: number) 
  {
    return db.delete(shortlinks).where(eq(shortlinks.id, id)).returning();
  }
  
  async update(id: number, data: Partial<InsertShortlink>) 
  {
    const result = await db.update(shortlinks)
      .set(data)
      .where(eq(shortlinks.id, id))
      .returning();

    return result[0];
  }
}
