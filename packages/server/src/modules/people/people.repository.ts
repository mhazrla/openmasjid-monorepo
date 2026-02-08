import { eq, desc, and } from 'drizzle-orm';
import { db } from '../../db';
import { people } from '../../db/schema';
import { CreatePersonDto, UpdatePersonDto } from './people.interface';

export class PeopleRepository 
{
  async findAll(type?: string) 
  {
    const conditions = [];
    if (type) conditions.push(eq(people.type, type as any)); 
    
    return await db.select()
      .from(people)
      .where(and(...conditions))
      .orderBy(desc(people.createdAt));
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
        status: 'active',
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
    const [deleted] = await db.delete(people)
      .where(eq(people.id, id))
      .returning();
    
    return deleted || null;
  }
}