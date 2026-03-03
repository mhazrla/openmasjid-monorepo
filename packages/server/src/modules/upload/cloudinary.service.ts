import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import { config } from '../../config';

if (config.CLOUDINARY_URL) 
{
  cloudinary.config({
    secure: true
  });
} 
else 
{
  console.warn('⚠️ CLOUDINARY_URL is not set in environment variables');
}

export class CloudinaryService 
{
  async uploadImage(buffer: Buffer, folderName: string = 'general'): Promise<string> 
  {
    return new Promise((resolve, reject) => 
    {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `openmasjid/${folderName}`,
          format: 'webp',
          quality: 'auto'
        },
        (error, result: UploadApiResponse | undefined) => 
        {
          if (error) 
          {
            return reject(error);
          }
          if (result && result.secure_url) 
          {
            resolve(result.secure_url);
          } 
          else 
          {
            reject(new Error('Unknown error: Cloudinary did not return a secure_url'));
          }
        }
      );

      // Pipe the buffer into the stream
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async uploadFromStream(fileStream: NodeJS.ReadableStream, folderName: string = 'general'): Promise<string> 
  {
    return new Promise((resolve, reject) => 
    {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `openmasjid/${folderName}`,
          format: 'webp',
          quality: 'auto'
        },
        (error, result: UploadApiResponse | undefined) => 
        {
          if (error) 
          {
            return reject(error);
          }
          if (result && result.secure_url) 
          {
            resolve(result.secure_url);
          } 
          else 
          {
            reject(new Error('Unknown error: Cloudinary did not return a secure_url'));
          }
        }
      );

      // Pipe the incoming fastify upload stream directly
      fileStream.pipe(uploadStream);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> 
  {
    try 
    {
      const parts = imageUrl.split('/upload/');
      if (parts.length < 2) return;
      
      let publicIdPath = parts[1];
      
      if (publicIdPath.match(/^v\d+\//)) 
      {
          publicIdPath = publicIdPath.substring(publicIdPath.indexOf('/') + 1);
      }
      
      const lastDotIndex = publicIdPath.lastIndexOf('.');
      if (lastDotIndex !== -1) 
      {
          publicIdPath = publicIdPath.substring(0, lastDotIndex);
      }
      
      await cloudinary.uploader.destroy(publicIdPath);
    } 
    catch (error) 
    {
       console.error(`Failed to delete image from Cloudinary: ${imageUrl}`, error);
    }
  }
}

export const cloudinaryService = new CloudinaryService();
