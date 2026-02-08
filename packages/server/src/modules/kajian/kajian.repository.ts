import { eq, desc, and, gte } from 'drizzle-orm';
import { db } from '../../db'; // Pastikan path import DB benar
import { kajianEvents } from '../../db/schema';
import { CreateKajianDto, UpdateKajianDto } from './kajian.interface';

export class KajianRepository 
{
  async findAll(filter?: { type?: string; upcoming?: boolean }) 
  {
    const conditions = [];

    if (filter?.type) 
    {
      conditions.push(eq(kajianEvents.type, filter.type as any));
    }

    if (filter?.upcoming) 
    {
      conditions.push(gte(kajianEvents.date, new Date()));
    }

    return await db.query.kajianEvents.findMany({
      where: and(...conditions),
      orderBy: [desc(kajianEvents.date)],
      with: {
        speaker: true,
      }
    });
  }

  async findById(id: number) 
  {
    return await db.query.kajianEvents.findFirst({
      where: eq(kajianEvents.id, id),
      with: {
        speaker: true
      }
    });
  }

  async create(data: CreateKajianDto & { posterUrl?: string }) 
  {
    const [newItem] = await db.insert(kajianEvents)
      .values({
        ...data,
        posterUrl: data.posterUrl || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newItem;
  }

  async update(id: number, data: UpdateKajianDto & { posterUrl?: string }) 
  {
    const payload: any = { ...data, updatedAt: new Date() };

    if (data.posterUrl !== undefined) 
    {
        payload.posterUrl = data.posterUrl;
    }

    const [updated] = await db.update(kajianEvents)
      .set(payload)
      .where(eq(kajianEvents.id, id))
      .returning();
    
    return updated || null;
  }

  async delete(id: number) 
  {
    const [deleted] = await db.delete(kajianEvents)
      .where(eq(kajianEvents.id, id))
      .returning();
    
    return deleted || null;
  }
}