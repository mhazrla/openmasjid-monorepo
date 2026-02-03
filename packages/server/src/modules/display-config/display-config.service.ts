import { DisplayConfigRepository } from './display-config.repository';
import { UpdateDisplayConfigDto } from './display-config.interface';

export class DisplayConfigService 
{
  constructor(private repository: DisplayConfigRepository) {}

  async getConfig() 
  {
    return this.repository.getOrInit();
  }

  async updateConfig(data: UpdateDisplayConfigDto) 
  {
    return this.repository.update(data);
  }
}
