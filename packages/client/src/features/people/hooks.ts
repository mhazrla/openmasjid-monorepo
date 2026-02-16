import { api } from '../../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Person, CreatePersonDTO, UpdatePersonDTO, UsePeopleParams } from './types';

export const usePeople = (params?: UsePeopleParams) => 
{
    return useQuery({
        queryKey: ['people', params], 
        queryFn: async () => 
        {
            const queryParams = new URLSearchParams();
            if (params?.type && params.type !== 'all') queryParams.append('type', params.type);
            
            queryParams.append('status', params?.status || 'active'); 
            
            if (params?.search) queryParams.append('search', params.search);
            
            const { data } = await api.get<{ data: Person[] }>('/people', { params: queryParams });
            return data.data;
        },
        staleTime: 1000 * 60 * 5, 
        placeholderData: (previousData) => previousData, 
    });
};

export const useCreatePerson = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newPerson: CreatePersonDTO) => 
        {
            const { data } = await api.post<{ data: Person }>('/people', newPerson);
            return data.data;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['people'] });
            toast.success('Person added successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to add person');
        }
    });
};

export const useUpdatePerson = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: UpdatePersonDTO) => 
        {
            const { data: response } = await api.patch<{ data: Person }>(`/people/${id}`, data);
            return response.data;
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['people'] });
            toast.success('Person updated successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to update person');
        }
    });
};

export const useDeletePerson = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => 
        {
            await api.delete(`/people/${id}`);
        },
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['people'] });
            toast.success('Person archived successfully');
        },
        onError: (error: any) => 
        {
            if (error?.response?.status === 409) {
                toast.error('Cannot delete: This data is currently used in schedules or events');
            } else {
                toast.error(error?.response?.data?.message || 'Failed to archive person');
            }
        }
    });
};