import { eq, asc, and, like } from 'drizzle-orm';
import { db } from '../../db';
import { people } from '../../db/schema';
import { CreatePersonDto, UpdatePersonDto } from './people.interface';

export class PeopleRepository 
{
  async findAll(filters: { type?: string; search?: string; status?: boolean }) 
  {
    const conditions = [];
    
    if (filters.status !== undefined) 
    {
        conditions.push(eq(people.status, filters.status));
    }

    if (filters.type) conditions.push(eq(people.type, filters.type as any)); 
    if (filters.search) conditions.push(like(people.name, `%${filters.search}%`));

    return await db.select()
      .from(people)
      .where(and(...conditions))
      .orderBy(asc(people.name));
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

  async delete(id: number) 
  {
    const [softDeleted] = await db.update(people)
      .set({ 
        status: false,
        updatedAt: new Date()
      })
      .where(eq(people.id, id))
      .returning();
    
    return softDeleted || null;
  }
}