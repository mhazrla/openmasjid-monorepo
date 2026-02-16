import { api } from '../../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { KajianEvent, UseKajianParams } from './types';

export const useKajianEvents = (params?: UseKajianParams) => 
{
    return useQuery({
        queryKey: ['kajian', params], 
        queryFn: async () => 
        {
            const queryParams = new URLSearchParams();
            
            if (params?.type && params.type !== 'all') queryParams.append('type', params.type);
            queryParams.append('status', params?.status || 'active'); 
            if (params?.search) queryParams.append('search', params.search);
            if (params?.upcoming !== undefined) queryParams.append('upcoming', String(params.upcoming));
            
            const { data } = await api.get<{ data: KajianEvent[] }>('/kajian', { params: queryParams });
            return data.data;
        },
        staleTime: 1000 * 60 * 5,
        placeholderData: (previousData) => previousData,
        refetchInterval: params?.refetchInterval,
    });
};

export const useCreateKajian = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => 
        {
            const { data } = await api.post<{ data: KajianEvent }>('/kajian', formData);
            return data.data;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['kajian'] });
            toast.success('Event added successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to add event');
        }
    });
};

export const useUpdateKajian = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: FormData }) => 
        {
            const { data: response } = await api.patch<{ data: KajianEvent }>(`/kajian/${id}`, data);
            return response.data;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['kajian'] });
            toast.success('Event updated successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to update event');
        }
    });
};

export const useDeleteKajian = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => 
        {
            await api.delete(`/kajian/${id}`);
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['kajian'] });
            toast.success('Event deleted successfully');
        },
        onError: (error: any) => 
        {
            if (error?.response?.status === 409) 
            {
                toast.error('Cannot delete: This event is already linked to other modules');
            } 
            else 
            {
                toast.error(error?.response?.data?.message || 'Failed to delete event');
            }
        }
    });
};