import { KajianRepository } from './kajian.repository';
import { CreateKajianDto, UpdateKajianDto } from './kajian.interface';

export class KajianService 
{
  constructor(private repository: KajianRepository) {}

  async getAll(query: { type?: string; upcoming?: string })
  {
    const isUpcoming = query.upcoming === 'true';
    
    return await this.repository.findAll({ 
      type: query.type, 
      upcoming: isUpcoming 
    });
  }

  async getById(id: number) {
    return await this.repository.findById(id);
  }

  async create(data: CreateKajianDto, posterUrl?: string) 
  {
    return await this.repository.create({ ...data, posterUrl });
  }

  async update(id: number, data: UpdateKajianDto, posterUrl?: string) 
  {
    return await this.repository.update(id, { ...data, posterUrl });
  }

  async delete(id: number) 
  {
    return await this.repository.delete(id);
  }
}