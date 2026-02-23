import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nextDay, set, isBefore, addWeeks } from 'date-fns';

// --- CSS Utility ---
export function cn(...inputs: ClassValue[]) 
{
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => 
{
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export const formatDate = (dateString: string | Date, includeTime = false) => 
{
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return new Date(dateString).toLocaleDateString('id-ID', options);
};

/**
 * Calculates the next occurrence of a specific day and time.
 * Used for recurring events (Kajian Rutin).
 */
export const calculateNextRecurringDate = (dayOfWeek: string, time: string): Date => 
{
    const [hours, minutes] = (time || '00:00').split(':').map(Number);
    const targetDay = parseInt(dayOfWeek || '0'); // 0 = Sunday, 1 = Monday, etc.
    
    const today = new Date();
    
    let nextDate = nextDay(today, targetDay as any);
    
    if (today.getDay() === targetDay) 
    {
        const potentialDate = set(today, { hours, minutes, seconds: 0, milliseconds: 0 });
        
        if (isBefore(today, potentialDate)) 
        {
            nextDate = potentialDate;
        } 
        else 
        {
            nextDate = addWeeks(potentialDate, 1);
        }
    } 
    else 
    {
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
): Date => 
{
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