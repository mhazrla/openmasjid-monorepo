import type { Person } from "../people/types";

export interface RamadanSchedule 
{
    id: number;
    configId: number;
    date: string;
    ramadanDay: number;
    description?: string;

    // 1. Tarawih
    tarawihImamId?: number | null;
    tarawihImam?: Person;

    // 2. Lelang Buka Puasa
    iftarTarget?: number;
    iftarCurrent?: number;

    // 3. Iftar Speaker & Kajian
    iftarSpeakerId?: number | null;
    iftarSpeaker?: Person;
    iftarKajianTitle?: string | null;

    // 4. Lelang Sahur I'tikaf
    itikafTarget?: number;
    itikafCurrent?: number;
}

export interface RamadanConfig 
{
    id: number;
    hijriYear: number;
    gregorianYear: number;
    title?: string | null;
    subtitle?: string | null;
    startDate?: string;
    badalImamText?: string;
    footerNote?: string;
    isActive: boolean;
    schedules?: RamadanSchedule[];
}

export interface CreateRamadanConfigRequest 
{
    hijriYear: number;
    gregorianYear: number;
    title: string;
    subtitle: string;
    startDate: string;
    badalImamText?: string;
    footerNote?: string;
}

export interface UpdateRamadanConfigRequest 
{
    badalImamText?: string;
    footerNote?: string;
}

export type UpdateRamadanScheduleRequest = Partial<Omit<RamadanSchedule, 'id' | 'configId' | 'ramadanDay' | 'tarawihImam' | 'iftarSpeaker'>>;

// --- EXTRACTED UI TYPES ---

export interface StatusBadgeProps 
{
    value: string;
    onChange: (value: string) => void;
    options?: string[];
}

export interface MinimalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface UserSelectProps 
{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export interface InitFormData 
{
    hijriYear: number;
    gregorianYear: number;
    title: string;
    subtitle: string;
    startDate: string;
    badalImamText: string;
    footerNote: string;
}

export interface ScheduleRowProps 
{
    schedule: RamadanSchedule;
    ustadzList: { value: string, label: string }[];
    index: number;
    totalRows: number;
}