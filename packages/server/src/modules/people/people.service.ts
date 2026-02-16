
import { PeopleRepository } from './people.repository';
import { CreatePersonDto, UpdatePersonDto } from './people.interface';

export class PeopleService 
{
  constructor(private repository: PeopleRepository) {}

  async getAllPeople(filters: { type?: string; search?: string; status?: boolean }) 
  {
    return await this.repository.findAll(filters);
  }

  async getPersonById(id: number) 
  {
    return await this.repository.findById(id);
  }

  async createPerson(data: CreatePersonDto) 
  {
    return await this.repository.create(data);
  }

  async updatePerson(id: number, data: UpdatePersonDto) 
  {
    return await this.repository.update(id, data);
  }

  async deletePerson(id: number) 
  {
    return await this.repository.delete(id);
  }
}
