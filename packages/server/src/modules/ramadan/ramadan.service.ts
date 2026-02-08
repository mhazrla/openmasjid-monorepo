import { RamadanRepository } from './ramadan.repository';
import { 
  CreateRamadanConfigDto, 
  UpdateRamadanConfigDto, 
  UpdateRamadanScheduleDto 
} from './ramadan.interface';

export class RamadanService 
{
  constructor(private repository: RamadanRepository) {}

  async getActiveConfig() 
  {
    return await this.repository.getActiveConfig();
  }

  async initializeConfig(data: CreateRamadanConfigDto) 
  {
    return await this.repository.initializeConfig(data);
  }

  async updateConfig(id: number, data: UpdateRamadanConfigDto) 
  {
    return await this.repository.updateConfig(id, data);
  }

  async updateSchedule(data: UpdateRamadanScheduleDto) 
  {
    return await this.repository.updateSchedule(data);
  }
}