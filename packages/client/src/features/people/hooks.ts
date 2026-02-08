import { api } from '../../lib/axios';
import { useQuery } from '@tanstack/react-query';
import type { Person } from '../ramadan/types'; 

export const usePeople = (type?: string) => 
{
    return useQuery({
        queryKey: ['people', type],
        queryFn: async () => 
        {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            
            const { data } = await api.get<{ data: Person[] }>(`/people`, { params });

            return data.data;
        },

        staleTime: 1000 * 60 * 5,
        retry: false,
        refetchOnWindowFocus: false
    });
};