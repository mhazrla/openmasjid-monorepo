import { HadisRepository } from './hadis.repository';

export class HadisService 
{
    constructor(private repository: HadisRepository) {}

    async getDisplayHadith() 
    {
        return await this.repository.getSafeDisplayHadith();
    }
}
