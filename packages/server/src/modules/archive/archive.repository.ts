import { db } from '../../db';
import { arAlbums, arMedia, InsertArAlbum, InsertArMedia } from '../../db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export class ArchiveRepository 
{
  async createAlbum(data: InsertArAlbum) 
  {
    const result = await db.insert(arAlbums).values(data).returning();
    return result[0];
  }

  async updateAlbum(id: number, data: Partial<InsertArAlbum>) 
  {
    const result = await db.update(arAlbums).set(data).where(eq(arAlbums.id, id)).returning();
    return result[0];
  }

  async addMedia(data: InsertArMedia) 
  {
    const result = await db.insert(arMedia).values(data).returning();
    return result[0];
  }

  async getAlbums() 
  {
    return await db.select({
      id: arAlbums.id,
      title: arAlbums.title,
      description: arAlbums.description,
      category: arAlbums.category,
      coverImageUrl: arAlbums.coverImageUrl,
      isFeatured: arAlbums.isFeatured,
      eventDate: arAlbums.eventDate,
      createdAt: arAlbums.createdAt,
      updatedAt: arAlbums.updatedAt,
      mediaCount: sql<number>`count(${arMedia.id})`.mapWith(Number)
    })
    .from(arAlbums)
    .leftJoin(arMedia, eq(arAlbums.id, arMedia.albumId))
    .groupBy(arAlbums.id)
    .orderBy(desc(arAlbums.createdAt));
  }

  async getAlbumById(id: number) 
  {
    const result = await db.select().from(arAlbums).where(eq(arAlbums.id, id));
    return result[0] || null;
  }

  async getMediaByAlbumId(albumId: number) 
  {
    return await db.select().from(arMedia).where(eq(arMedia.albumId, albumId)).orderBy(desc(arMedia.createdAt));
  }

  async getMediaById(id: number) 
  {
    const result = await db.select().from(arMedia).where(eq(arMedia.id, id));
    return result[0] || null;
  }

  async deleteAlbum(id: number) 
  {
    await db.delete(arMedia).where(eq(arMedia.albumId, id));
    const result = await db.delete(arAlbums).where(eq(arAlbums.id, id)).returning();
    return result[0];
  }

  async deleteMediaById(id: number) 
  {
    const result = await db.delete(arMedia).where(eq(arMedia.id, id)).returning();
    return result[0];
  }
}
