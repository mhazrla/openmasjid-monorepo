import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nextDay, set, isBefore, addWeeks } from 'date-fns';

// --- CSS Utility ---
export function cn(...inputs: ClassValue[]) 
{
  return twMerge(clsx(inputs));
}

// --- Date Utilities ---

/**
 * Calculates the next occurrence of a specific day and time.
 * Used for recurring events (Kajian Rutin).
 */
export const calculateNextRecurringDate = (dayOfWeek: string, time: string): Date => {
    const [hours, minutes] = (time || '00:00').split(':').map(Number);
    const targetDay = parseInt(dayOfWeek || '0'); // 0 = Sunday, 1 = Monday, etc.
    
    const today = new Date();
    
    // Start by finding the next occurrence of the target day
    // Note: nextDay from date-fns returns the next date *after* today
    let nextDate = nextDay(today, targetDay as any);
    
    // If today IS the target day, we need to check the time specific logic
    if (today.getDay() === targetDay) 
    {
        const potentialDate = set(today, { hours, minutes, seconds: 0, milliseconds: 0 });
        
        // If the time hasn't passed yet today, use today
        if (isBefore(today, potentialDate)) 
        {
            nextDate = potentialDate;
        } 
        else 
        {
            // Otherwise, move to next week
            nextDate = addWeeks(potentialDate, 1);
        }
    } 
    else 
    {
        // Set the time on the calculated next day
        nextDate = set(nextDate, { hours, minutes, seconds: 0, milliseconds: 0 });
    }

    return nextDate;
};

/**
 * Determines the final event date based on type.
 * Accepts primitives to keep 'lib' independent of feature types.
 */
export const calculateEventDate = (
    type: string, 
    singleDate: string | Date, 
    dayOfWeek?: string, 
    time?: string
): Date => {
    if (type === 'kajian_rutin') 
    {
        if (!dayOfWeek || !time) 
        {
            return new Date(); // Fallback
        }
        return calculateNextRecurringDate(dayOfWeek, time);
    }
    
    return new Date(singleDate);
};

// IMAGES
export const getImageUrl = (path: string | undefined | null) => 
{
    if (!path) return '';
    if (path.startsWith('http')) return path;

    const apiConfigUrl = import.meta.env.VITE_BASE_URL || '';
    const cleanBaseUrl = apiConfigUrl.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${cleanBaseUrl}${cleanPath}`;
};