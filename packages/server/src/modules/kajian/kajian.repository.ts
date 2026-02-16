import { eq, desc, asc, and, gte, or, ne, like } from 'drizzle-orm';
import { db } from '../../db'; 
import { kajianEvents, people } from '../../db/schema';
import { CreateKajianDto, UpdateKajianDto } from './kajian.interface';

export class KajianRepository 
{
  async findAll(filters: { type?: string; search?: string; status?: boolean; upcoming?: boolean }) 
  {
    const conditions = [];

    if (filters?.type && filters.type !== 'all') 
    {
        conditions.push(eq(kajianEvents.type, filters.type as any));
    }

    if (filters.search) conditions.push(like(kajianEvents.title, `%${filters.search}%`));

    if (filters?.upcoming)
    {
       return await db.select({
          event: kajianEvents,
          speaker: people
        })
        .from(kajianEvents)
        .leftJoin(people, eq(kajianEvents.speakerId, people.id))
        .where(
          and(
            ...conditions,
            or(
                and(
                    eq(kajianEvents.type, 'kajian_rutin'), 
                    eq(kajianEvents.status, true) 
                ),
                and(
                    ne(kajianEvents.type, 'kajian_rutin'),
                    gte(kajianEvents.date, new Date())
                )
            )
          )
        )
        .orderBy(asc(kajianEvents.date));
    }
    else 
    {
        if (filters.status !== undefined) 
        {
            conditions.push(eq(kajianEvents.status, filters.status));
        }

        return await db.select({
            event: kajianEvents,
            speaker: people
        })
        .from(kajianEvents)
        .leftJoin(people, eq(kajianEvents.speakerId, people.id))
        .where(and(...conditions))
        .orderBy(desc(kajianEvents.createdAt)) 
        .then(rows => rows.map(row => ({
            ...row.event,
            speaker: row.speaker
        })));
    }
  }

  async findById(id: number) 
  {
    return await db.query.kajianEvents.findFirst({
      where: eq(kajianEvents.id, id),
      with: { speaker: true }
    });
  }

  async create(data: CreateKajianDto & { posterUrl?: string }) 
  {
    const isRutin = data.type === 'kajian_rutin';

    const [newItem] = await db.insert(kajianEvents)
      .values({
        title: data.title,
        speakerId: data.speakerId,
        type: data.type,
        posterUrl: data.posterUrl || null,
        status: data.status ?? true,
        
        date: isRutin ? null : (data.date ? new Date(data.date) : null),
        dayOfWeek: isRutin ? Number(data.dayOfWeek) : null,
        time: isRutin ? data.time : null,
        
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newItem;
  }

  async update(id: number, data: UpdateKajianDto & { posterUrl?: string }) 
  {
    const payload: any = { ...data, updatedAt: new Date() };

    if (data.type === 'kajian_rutin') 
    {
        if (data.dayOfWeek) payload.dayOfWeek = Number(data.dayOfWeek);
        if (data.time) payload.time = data.time;
        payload.date = null; 
    } 
    else if (data.type) 
    {
        if (data.date) payload.date = new Date(data.date);
        payload.dayOfWeek = null;
        payload.time = null;
    }

    if (data.posterUrl !== undefined) payload.posterUrl = data.posterUrl;

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