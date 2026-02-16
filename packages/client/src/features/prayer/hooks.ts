import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrayerTimes, syncPrayerTimes } from './api';
import type { SyncPrayerRequest } from './types';

export const usePrayerTime = (date: string, options?: { refetchInterval?: number }) => 
{
    return useQuery({
        queryKey: ['prayer-times', date],
        queryFn: () => getPrayerTimes(date),
        enabled: !!date,
        refetchInterval: options?.refetchInterval, 
        refetchOnReconnect: true,
        refetchOnWindowFocus: false
    });
};

export const useSyncPrayerTimes = () => 
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SyncPrayerRequest) => syncPrayerTimes(payload),
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['prayer-times'] });
        },
    });
};
