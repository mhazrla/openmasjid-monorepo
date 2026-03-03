import { MosqueRepository } from './mosque.repository';
import { UpdateMosqueProfileDto, InsertMosqueProfile } from './mosque.interface';
import { cloudinaryService } from '../upload/cloudinary.service';

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
