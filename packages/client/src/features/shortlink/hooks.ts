import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import type { Shortlink, CreateShortlinkRequests, UpdateShortlinkRequests } from './types';

export const useShortlinks = () => 
{
    return useQuery({
        queryKey: ['shortlinks'],
        queryFn: async () => 
        {
            const { data } = await api.get<{ data: Shortlink[] }>('/shortlinks');
            return data.data;
        },
    });
};

export const useCreateShortlink = () => 
{
    const queryClient = useQueryClient();
    return useMutation(
    {
        mutationFn: async (payload: CreateShortlinkRequests) => 
        {
            const { data } = await api.post('/shortlinks', payload);
            return data;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
        },
    });
};

export const useDeleteShortlink = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => 
        {
            await api.delete(`/shortlinks/${id}`);
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
        },
    });
};

export const useUpdateShortlink = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: UpdateShortlinkRequests) => 
        {
            const { id, ...data } = payload;
            const { data: response } = await api.put(`/shortlinks/${id}`, data);
            return response;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
        },
    });
};
