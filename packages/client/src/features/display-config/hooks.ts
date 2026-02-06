import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import type { DisplayConfig, UpdateDisplayConfigDto } from './types';

export const useDisplayConfig = () => 
{
    return useQuery({
        queryKey: ['display-config'],
        queryFn: async () => 
        {
            const { data } = await api.get<{ data: DisplayConfig }>('/display-config');
            return data.data;
        },
        refetchInterval: 30 * 1000,
    });
};

export const useUpdateDisplayConfig = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: UpdateDisplayConfigDto) => 
        {
            const { data } = await api.patch('/display-config', payload);
            return data;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['display-config'] });
        },
    });
};
