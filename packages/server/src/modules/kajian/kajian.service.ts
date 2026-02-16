import { KajianRepository } from './kajian.repository';
import { CreateKajianDto, UpdateKajianDto } from './kajian.interface';
import { calculateNextOccurrence } from '../../plugins/date';
import path from 'path';
import fs from 'fs';

export class KajianService 
{
  constructor(private repository: KajianRepository) {}

  async getAll(filters: { type?: string; upcoming?: boolean; search?: string; status?: boolean })
  {
    const rawData = await this.repository.findAll(filters);

    if (!filters.upcoming) return rawData;

    const processedData = (rawData as any[]).map((row) => 
    {
        const event = row.event || row; 
        const speaker = row.speaker || row.speaker;
        let displayDate: Date;

        if (event.type === 'kajian_rutin') 
        {
            if (event.dayOfWeek !== null && event.time) 
            {
                displayDate = calculateNextOccurrence(event.dayOfWeek, event.time);
            } 
            else 
            {
                displayDate = new Date();
            }
        } 
        else 
        {
            displayDate = new Date(event.date);
        }

        return {
            ...event,
            speaker,
            displayDate,
        };
    });

    processedData.sort((a, b) => a.displayDate.getTime() - b.displayDate.getTime());
    return processedData;
  }

  async getById(id: number) 
  {
    return await this.repository.findById(id);
  }

  async create(data: CreateKajianDto, posterUrl?: string) 
  {
    return await this.repository.create({ ...data, posterUrl });
  }

  async update(id: number, data: UpdateKajianDto, uploadedPosterUrl?: string) 
  {
    const existing = await this.repository.findById(id);
    
    let finalPosterUrl: string | null | undefined = uploadedPosterUrl;

    if (finalPosterUrl === undefined && data.posterUrl !== undefined) 
    {
        finalPosterUrl = data.posterUrl;
    }
    const updatePayload: any = { ...data };
    if (finalPosterUrl !== undefined) 
    {
        updatePayload.posterUrl = finalPosterUrl;
    }

    const result = await this.repository.update(id, updatePayload);

    if (result && existing?.posterUrl) 
    {
        const hasChanged = finalPosterUrl !== undefined && finalPosterUrl !== existing.posterUrl;
        
        if (hasChanged) 
        {
            try 
            {
                const filePath = path.join(process.cwd(), existing.posterUrl);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } 
            catch (e) 
            {
                console.warn(`Failed to delete old poster file: ${existing.posterUrl}`, e);
            }
        }
    }
    
    return result;
  }

  async delete(id: number) 
  {
    return await this.repository.delete(id);
  }
}