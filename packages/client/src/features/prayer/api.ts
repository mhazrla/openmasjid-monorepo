import { api } from '../../lib/axios';
import type { ApiResponse } from '../../types';
import type { PrayerTime, SyncPrayerRequest } from './types';

export const getPrayerTimes = async (date: string): Promise<PrayerTime | null> => 
{
    const { data } = await api.get<ApiResponse<PrayerTime | null>>('/prayer-times', 
    {
        params: { date }
    });

    return data.data;
};

export const syncPrayerTimes = async (payload: SyncPrayerRequest): Promise<any> => 
{
    const { data } = await api.post<ApiResponse<any>>('/prayer-times/sync', payload);
    
    return data;
};
