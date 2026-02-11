import { api } from '../../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RamadanConfig, CreateRamadanConfigRequest, UpdateRamadanScheduleRequest, UpdateRamadanConfigRequest } from './types';

export const useActiveRamadan = () => 
{
    return useQuery({
        queryKey: ['ramadan', 'active'],
        queryFn: async () => 
        {
            const { data } = await api.get<{ data: RamadanConfig | null }>('/ramadan');
            return data.data;
        },
    });
};

export const useInitRamadan = () => 
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateRamadanConfigRequest) => 
        {
            const { data } = await api.post<{ data: RamadanConfig }>('/ramadan/init', payload);
            return data.data;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['ramadan', 'active'] });
        },
    });
};

export const useUpdateRamadanConfig = () => 
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...payload }: UpdateRamadanConfigRequest & { id: number }) => 
        {
            const { data } = await api.patch<{ data: RamadanConfig }>(`/ramadan/config/${id}`, payload);
            return data.data;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['ramadan', 'active'] });
        },
    });
};

export const useUpdateRamadanSchedule = () => 
{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...payload }: UpdateRamadanScheduleRequest & { id: number }) => 
        {
            const { data } = await api.patch<{ data: any }>(`/ramadan/schedule/${id}`, payload);
            return data.data;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['ramadan', 'active'] });
        },
    });
};