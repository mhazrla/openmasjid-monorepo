import { ArchiveRepository } from './archive.repository';
import { InsertArAlbum, InsertArMedia } from '../../db/schema';
import { cloudinaryService } from '../upload/cloudinary.service';

export class ArchiveService 
{
  constructor(private repository: ArchiveRepository) {}
  async createAlbum(data: Omit<InsertArAlbum, 'createdAt' | 'updatedAt'>) 
  {
    return this.repository.createAlbum(data);
  }

  async updateAlbum(id: number, data: Partial<InsertArAlbum>) 
  {
    const existingAlbum = await this.repository.getAlbumById(id);
    if (!existingAlbum) return null;

    if (data.coverImageUrl !== undefined && existingAlbum.coverImageUrl && data.coverImageUrl !== existingAlbum.coverImageUrl) 
    {
       if (existingAlbum.coverImageUrl.startsWith('http')) 
       {
           await cloudinaryService.deleteImage(existingAlbum.coverImageUrl);
       }
    }
    
    return this.repository.updateAlbum(id, data);
  }

  async getAlbums() 
  {
    return this.repository.getAlbums();
  }

  async getAlbumMedia(albumId: number) 
  {
    return this.repository.getMediaByAlbumId(albumId);
  }

  async deleteAlbum(albumId: number) 
  {
    const album = await this.repository.getAlbumById(albumId);
    if (!album) return null;

    const mediaList = await this.repository.getMediaByAlbumId(albumId);
    
    const deletionPromises: Promise<void>[] = [];

    // Delete all associated media images from Cloudinary
    for (const media of mediaList) 
    {
      if (media.type === 'image' && media.mediaUrl.startsWith('http')) 
      {
        deletionPromises.push(cloudinaryService.deleteImage(media.mediaUrl));
      }
    }

    if (album.coverImageUrl && album.coverImageUrl.startsWith('http')) 
    {
      deletionPromises.push(cloudinaryService.deleteImage(album.coverImageUrl));
    }

    // Execute all deletions in parallel
    if (deletionPromises.length > 0) 
    {
        await Promise.all(deletionPromises);
    }

    return this.repository.deleteAlbum(albumId);
  }

  async deleteMedia(mediaId: number) 
  {
    const media = await this.repository.getMediaById(mediaId);
    if (!media) return null;

    if (media.type === 'image' && media.mediaUrl.startsWith('http')) 
    {
       await cloudinaryService.deleteImage(media.mediaUrl);
    }

    return this.repository.deleteMediaById(mediaId);
  }

  async addVideoMedia(albumId: number, title: string | undefined, mediaUrl: string) 
  {
    const mediaObj: InsertArMedia = 
    {
      albumId,
      type: 'video',
      mediaUrl,
      title
    };
    return this.repository.addMedia(mediaObj);
  }

  async addImageMedia(albumId: number, title: string | undefined, imageBuffer: Buffer) 
  {
    const mediaUrl = await cloudinaryService.uploadImage(imageBuffer, 'archives');

    const mediaObj: InsertArMedia = 
    {
      albumId,
      type: 'image',
      mediaUrl,
      title
    };

    return this.repository.addMedia(mediaObj);
  }
}
