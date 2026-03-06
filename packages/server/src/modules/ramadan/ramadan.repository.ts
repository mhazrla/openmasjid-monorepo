import { db } from '../../db';
import { ramadanConfigs, ramadanSchedules } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { 
  CreateRamadanConfigDto, 
  UpdateRamadanConfigDto, 
  UpdateRamadanScheduleDto, 
  InsertRamadanSchedule 
} from './ramadan.interface';
import { addDays } from 'date-fns';

export class RamadanRepository 
{
  async getActiveConfig() 
  {
    const config = await db.query.ramadanConfigs.findFirst({
      where: eq(ramadanConfigs.isActive, true),
      orderBy: [desc(ramadanConfigs.createdAt)],
      with: {
        schedules: {
          orderBy: (schedules: any, { asc }: any) => [asc(schedules.ramadanDay)],
          with: {
            tarawihImam: 
            {
                columns: { id: true, name: true }
            },
            iftarSpeaker: 
            {
                columns: { id: true, name: true }
            }
          }
        }
      }
    });

    return config || null;
  }

  async initializeConfig(data: CreateRamadanConfigDto) 
  {
    return await db.transaction(async (tx: any) => 
    {
      await tx.update(ramadanConfigs)
        .set({ isActive: false })
        .where(eq(ramadanConfigs.isActive, true));

      const [insertedConfig] = await tx.insert(ramadanConfigs).values({
        hijriYear: data.hijriYear,
        gregorianYear: data.gregorianYear,
        title: data.title,
        subtitle: data.subtitle,
        badalImamText: data.badalImamText,
        footerNote: data.footerNote,
        isActive: true
      }).returning(); 

      const newConfigId = insertedConfig.id;
      const newConfig = 
      {
        ...insertedConfig,
        ...data,
      };

      const startDate = new Date(data.startDate); 
      const schedulesToInsert: InsertRamadanSchedule[] = [];

      for (let day = 1; day <= 30; day++) 
      {
        const currentDate = addDays(startDate, day - 1);
        
        schedulesToInsert.push({
          configId: newConfigId,
          ramadanDay: day,
          date: currentDate,
          description: '',
          iftarTarget: 0,
          iftarCurrent: 0,
          itikafTarget: 0,
          itikafCurrent: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      if (schedulesToInsert.length > 0) 
      {
        await tx.insert(ramadanSchedules).values(schedulesToInsert);
      }

      return newConfig;
    });
  }

  async updateConfig(id: number, data: UpdateRamadanConfigDto) 
  {
    const [updated] = await db.update(ramadanConfigs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ramadanConfigs.id, id))
      .returning();
    return updated;
  }

  async updateSchedule(data: UpdateRamadanScheduleDto) 
  {
    const { id, date, ...rest } = data;

    const updatePayload: any = 
    {
      ...rest,
      updatedAt: new Date(),
    };

    if (date) 
    {
      updatePayload.date = typeof date === 'string' ? new Date(date) : date;
    }

    const [updated] = await db.update(ramadanSchedules)
      .set(updatePayload)
      .where(eq(ramadanSchedules.id, id))
      .returning();
      
    return updated;
  }
}
