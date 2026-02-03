import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrayerTimes, syncPrayerTimes } from './api';
import type { SyncPrayerRequest } from './types';

export const usePrayerTime = (date: string) => 
{
    return useQuery({
        queryKey: ['prayer-times', date],
        queryFn: () => getPrayerTimes(date),
        enabled: !!date,
        staleTime: 1000 * 60 * 60,
    });
};

export const useSyncPrayerTimes = () => 
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SyncPrayerRequest) => syncPrayerTimes(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prayer-times'] });
        },
    });
};
