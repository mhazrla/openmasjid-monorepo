import { getDay, addDays, set, isBefore } from 'date-fns';

export function calculateNextOccurrence(dayOfWeek: number, timeStr: string): Date 
{
    const now = new Date();
    const currentDay = getDay(now);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    let dayDiff = dayOfWeek - currentDay;
    if (dayDiff < 0) dayDiff += 7; 
    
    let nextDate = addDays(now, dayDiff);
    
    nextDate = set(nextDate, { hours, minutes, seconds: 0, milliseconds: 0 });

    if (dayDiff === 0 && isBefore(nextDate, now)) 
    {
        nextDate = addDays(nextDate, 7);
    }

    return nextDate;
}