import { eq, asc, and, like, desc } from 'drizzle-orm';
import { db } from '../../db';
import { people } from '../../db/schema';
import { CreatePersonDto, PeopleFilter, UpdatePersonDto } from './people.interface';

export class PeopleRepository 
{
  async findAll(filters: PeopleFilter) 
  {
    const conditions = [];
    const limit = filters.limit !== undefined ? filters.limit : 10;
    const offset = (filters.page && filters.page > 0) ? (filters.page - 1) * limit : 0;
    
    if (filters.status && filters.status !== 'all') 
    {
        conditions.push(eq(people.status, filters.status === 'active'));
    }

    if (filters.type && filters.type !== 'all') 
    {
        conditions.push(eq(people.type, filters.type as any)); 
    }

    if (filters.search) 
    {
        conditions.push(like(people.name, `%${filters.search}%`));
    }

    const orderBy = filters.sortBy && (people as any)[filters.sortBy] 
        ? (filters.sortOrder === 'asc' ? asc((people as any)[filters.sortBy]) : desc((people as any)[filters.sortBy]))
        : asc(people.name);

    const baseQuery = db.select()
      .from(people)
      .where(and(...conditions))
      .orderBy(orderBy);

    // If limit is exactly 0, fetch ALL without pagination
    if (filters.limit === 0) 
    {
        return await baseQuery;
    }

    return await baseQuery
      .limit(limit)
      .offset(offset);
  }

  async findById(id: number) 
  {
    const [person] = await db.select()
      .from(people)
      .where(eq(people.id, id));
    
    return person || null;
  }

  async create(data: CreatePersonDto) 
  {
    const [newPerson] = await db.insert(people)
      .values({
        ...data,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newPerson;
  }

  async update(id: number, data: UpdatePersonDto) 
  {
    const [updatedPerson] = await db.update(people)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(people.id, id))
      .returning();
    
    return updatedPerson || null;
  }
}