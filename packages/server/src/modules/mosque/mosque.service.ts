import path from 'path';
import fs from 'fs';
import { MosqueRepository } from './mosque.repository';
import { UpdateMosqueProfileDto, InsertMosqueProfile } from './mosque.interface';

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

  private async handleFileCleanup(oldProfile: any, newData: UpdateMosqueProfileDto) 
  {
    if (!oldProfile) return;

    if (oldProfile.logoUrl && oldProfile.logoUrl !== newData.logoUrl) 
    {
        await this.deleteFileFromDisk(oldProfile.logoUrl);
    }

    if (oldProfile.qrisUrl && oldProfile.qrisUrl !== newData.qrisUrl) 
    {
        await this.deleteFileFromDisk(oldProfile.qrisUrl);
    }
  }

  private async deleteFileFromDisk(fileUrl: string) 
  {
    try 
    {
        const cleanUrl = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
        
        const fullPath = path.join(process.cwd(), cleanUrl);

        if (fs.existsSync(fullPath)) 
        {
            await fs.promises.unlink(fullPath);
        }
    } 
    catch (error) 
    {
        console.error(`[File Cleanup Error] Failed to delete ${fileUrl}:`, error);
    }
  }
}
