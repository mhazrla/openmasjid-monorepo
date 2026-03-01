import type { Person } from '../people/types';

export type KajianType = 'kajian_rutin' | 'kajian_tematik' | 'tabligh_akbar';

export interface KajianEvent 
{
    id: number;
    title: string;
    posterUrl?: string | null;
    date: string;
    displayDate?: string;
    type: KajianType;
    speakerId: number; 
    speaker?: Person;
    status: boolean;
    dayOfWeek?: number | string; 
    time?: string;
    timeMode?: 'manual' | 'bada_sholat';
    badaSholat?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateKajianDTO extends Omit<KajianEvent, 'id' | 'posterUrl' | 'speaker' | 'createdAt' | 'updatedAt' | 'displayDate' | 'status'> 
{
    status?: boolean;
}

export interface UpdateKajianDTO extends Partial<KajianEvent> 
{
    id: number;
}

export interface KajianFormValues 
{
    title: string;
    speakerId: string;
    date: string;
    type: KajianType;
    poster: FileList | null;
    dayOfWeek?: string;
    time?: string;
    timeMode: 'manual' | 'bada_sholat';
    badaSholat?: string;
    status: boolean;
}

export interface KajianFormModalProps 
{
    isOpen: boolean;
    onClose: () => void;
    editingKajian: KajianEvent | null;
}

export const DAYS = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '0', label: 'Sunday' },
];

export interface UseKajianParams 
{
    type?: KajianType | 'all';
    status?: 'active' | 'inactive' | 'all';
    search?: string;
    upcoming?: boolean;
    refetchInterval?: number;
}