import { db } from '../../db';
import { dsMosqueProfile } from '../../db/schema';
import { InsertMosqueProfile } from './mosque.interface';

export class MosqueRepository 
{
  async getProfile() 
  {
    const result = await db.select().from(dsMosqueProfile).limit(1);

    return result[0] || null;
  }

  async createOrUpdateProfile(data: Partial<InsertMosqueProfile>) 
  {
    const insertValues = {
      id: 1,
      name: data.name ?? 'New Mosque',
      address: data.address ?? '-', 
      ...data
    } as InsertMosqueProfile;

    const result = await db.insert(dsMosqueProfile)
      .values(insertValues)
      .onConflictDoUpdate({
        target: dsMosqueProfile.id,
        set: 
        { 
          ...data, 
          updatedAt: new Date() 
        }
      })
      .returning();

    return result[0];
  }
}
