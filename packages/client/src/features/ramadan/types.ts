export interface Person 
{
    id: number;
    name: string;
    type: 'jamaah' | 'ustadz' | 'pengurus';
}

export interface RamadanSchedule 
{
    id: number;
    configId: number;
    date: string; // ISO string
    ramadanDay: number;
    description?: string;
    imamId?: number;
    imam?: Person;
}

export interface RamadanConfig 
{
    id: number;
    hijriYear: number;
    gregorianYear: number;
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
    startDate: string;
    badalImamText?: string;
    footerNote?: string;
}

export interface UpdateRamadanConfigRequest 
{
    badalImamText?: string;
    footerNote?: string;
}

export interface UpdateRamadanScheduleRequest 
{
    date?: string;
    description?: string;
    imamId?: number | null;
}
