import { KajianRepository } from './kajian.repository';
import { CreateKajianDto, KajianFilter, UpdateKajianDto } from './kajian.interface';
import { calculateNextOccurrence } from '../../plugins/date';
import path from 'path';
import fs from 'fs/promises';
import { constants } from 'fs';
import { InferSelectModel } from 'drizzle-orm';
import { kajianEvents, people } from '../../db/schema';
import { fileExists } from '../../plugins/fileChecker';

type KajianEvent = InferSelectModel<typeof kajianEvents>;
type Speaker = InferSelectModel<typeof people>;

export class KajianService 
{
  constructor(private repository: KajianRepository) {}

  async getAll(filters: KajianFilter) 
  {
    const rawData = await this.repository.findAll(filters);

    if (filters.upcoming !== 'true') return rawData;

    const processedData = (rawData as { event: KajianEvent; speaker: Speaker | null }[]).map((row) => 
    {
        const event = row.event; 
        const speaker = row.speaker;
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
            displayDate = event.date ? new Date(event.date) : new Date();
        }

        return { ...event, speaker, displayDate };
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
    if (!existing) return null;
    
    let finalPosterUrl: string | null | undefined = uploadedPosterUrl;

    if (finalPosterUrl === undefined && data.posterUrl !== undefined) 
    {
        finalPosterUrl = data.posterUrl;
    }
    
    const updatePayload: UpdateKajianDto & { posterUrl?: string | null } = { ...data };
    if (finalPosterUrl !== undefined) 
    {
        updatePayload.posterUrl = finalPosterUrl;
    }

    const result = await this.repository.update(id, updatePayload);

    if (result && existing.posterUrl) 
    {
        const hasChanged = finalPosterUrl !== undefined && finalPosterUrl !== existing.posterUrl;
        
        if (hasChanged) 
        {
            try 
            {
                const filePath = path.join(process.cwd(), existing.posterUrl);
                if (await fileExists(filePath)) await fs.unlink(filePath);
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
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    const result = await this.repository.delete(id);

    if (existing.posterUrl) 
    {
      try 
      {
        const filePath = path.join(process.cwd(), existing.posterUrl);
        if (await fileExists(filePath)) await fs.unlink(filePath);
      } 
      catch (e) 
      {
        console.warn(`Failed to delete poster file for id ${id}`);
      }
    }

    return result;
  }
}