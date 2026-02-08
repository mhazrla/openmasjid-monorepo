
import { api } from '../../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Person } from '../people/types';

export interface KajianEvent {
    id: number;
    title: string;
    speakerId: number;
    speaker?: Person;
    date: string;
    posterUrl?: string; // URL from backend
    type: 'subuh' | 'tematik' | 'tabligh_akbar';
}

export const useKajianEvents = () => {
    return useQuery({
        queryKey: ['kajian'],
        queryFn: async () => {
            const { data } = await api.get<{ data: KajianEvent[] }>('/kajian');
            return data.data;
        }
    });
};

export const useCreateKajian = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            // Note: Content-Type header is usually auto-set by browser when body is FormData
            const { data } = await api.post('/kajian', formData);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kajian'] })
    });
};

export const useDeleteKajian = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await api.delete(`/kajian/${id}`);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kajian'] })
    });
};
