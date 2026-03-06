import { MosqueRepository } from './mosque.repository';
import { UpdateMosqueProfileDto, InsertMosqueProfile, updateMosqueProfileSchema } from './mosque.interface';
import { cloudinaryService } from '../upload/cloudinary.service';
import { FastifyRequest } from 'fastify';

export class MosqueService 
{
  constructor(private mosqueRepository: MosqueRepository) {}

  async get() 
  {
    const profile = await this.mosqueRepository.getProfile();
    
    if (!profile) 
    {
      return {
        name: 'Not Setting Yet',
        address: 'Not Setting Yet',
        bankAccountNumber: 'Not Setting Yet',
        logoUrl: 'Not Setting Yet',
        letterheadConfig: null
      };
    }
    
    return profile;
  }

  async update(data: UpdateMosqueProfileDto) 
  {
    const oldProfile = await this.get();

    const dbPayload: Partial<InsertMosqueProfile> = 
    {
      name: data.name,
      address: data.address,
      bankName: data.bankName,
      bankAccountName: data.bankAccountName,
      bankAccountNumber: data.bankAccountNumber,
      logoUrl: data.logoUrl,
      qrisUrl: data.qrisUrl,
      letterheadConfig: data.letterheadConfig
    };
    
    const updatedProfile = await this.mosqueRepository.createOrUpdateProfile(dbPayload);

    this.handleFileCleanup(oldProfile, data);

    return updatedProfile;
  }

  async updateProfileWithMultipart(req: FastifyRequest) 
  {
      if (!req.isMultipart()) 
      {
         const result = updateMosqueProfileSchema.safeParse(req.body);
         if (!result.success) throw new Error('Validation Error: ' + JSON.stringify(result.error.issues));
         return this.update(result.data);
      }

      const parts = req.parts();
      const body: Record<string, any> = {};
      const uploadPromises: Promise<void>[] = [];
      let logoUrlUpload: string | undefined;
      let qrisUrlUpload: string | undefined;

      for await (const part of parts) 
      {
        if (part.type === 'file') 
        {
          if (part.fieldname === 'logoFile') 
          {
             uploadPromises.push(
               this.handleImageUpload(part.file, part.mimetype, 'profile').then(url => { logoUrlUpload = url; })
             );
          } 
          else if (part.fieldname === 'qrisFile') 
          {
             uploadPromises.push(
               this.handleImageUpload(part.file, part.mimetype, 'profile').then(url => { qrisUrlUpload = url; })
             );
          } 
          else 
          {
             part.file.resume();
          }
        } 
        else 
        {
          body[part.fieldname] = part.value;
        }
      }

      await Promise.all(uploadPromises);

      const result = updateMosqueProfileSchema.safeParse(body);
      if (!result.success) 
      {
         throw new Error('Validation Error: Required fields are missing or invalid.');
      }

      const finalData = result.data;
      if (logoUrlUpload !== undefined) finalData.logoUrl = logoUrlUpload;
      if (qrisUrlUpload !== undefined) finalData.qrisUrl = qrisUrlUpload;

      if (body.logoUrl === '') finalData.logoUrl = null;
      if (body.qrisUrl === '') finalData.qrisUrl = null;
      
      if (body.bankName !== undefined) finalData.bankName = body.bankName === '' ? null : body.bankName;
      if (body.bankAccountName !== undefined) finalData.bankAccountName = body.bankAccountName === '' ? null : body.bankAccountName;
      if (body.bankAccountNumber !== undefined) finalData.bankAccountNumber = body.bankAccountNumber === '' ? null : body.bankAccountNumber;

      return this.update(finalData);
  }

  private async handleImageUpload(fileStream: NodeJS.ReadableStream, mimetype: string, folder: string): Promise<string> 
  {
    const mimeToExt: Record<string, string> = 
    {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp'
    };

    if (!mimeToExt[mimetype]) 
    {
        throw new Error('Invalid file type. Only JPG, PNG, WEBP allowed.');
    }

    return await cloudinaryService.uploadFromStream(fileStream, folder);
  }

  private async handleFileCleanup(oldProfile: any, newData: UpdateMosqueProfileDto) 
  {
    if (!oldProfile) return;

    if (newData.logoUrl !== undefined && oldProfile.logoUrl && oldProfile.logoUrl !== newData.logoUrl) 
    {
        await this.deleteImageFromCloudinary(oldProfile.logoUrl);
    }

    if (newData.qrisUrl !== undefined && oldProfile.qrisUrl && oldProfile.qrisUrl !== newData.qrisUrl) 
    {
        await this.deleteImageFromCloudinary(oldProfile.qrisUrl);
    }
  }

  private async deleteImageFromCloudinary(fileUrl: string) 
  {
    if (fileUrl.startsWith('http')) 
    {
        await cloudinaryService.deleteImage(fileUrl);
    }
  }
}
