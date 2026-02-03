import { MosqueRepository } from './mosque.repository';
import { UpdateMosqueProfileDto, InsertMosqueProfile } from './mosque.interface';

export class MosqueService 
{
  constructor(private mosqueRepository: MosqueRepository) {}

  async getProfile() 
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

  async updateProfile(data: UpdateMosqueProfileDto) 
  {
    const dbPayload: Partial<InsertMosqueProfile> = 
    {
      name: data.name,
      address: data.address,
      bankAccountNumber: data.bankAccountNumber,
      logoUrl: data.logoUrl,
      letterheadConfig: data.letterheadConfig
    };
    
    return this.mosqueRepository.createOrUpdateProfile(dbPayload);
  }
}
