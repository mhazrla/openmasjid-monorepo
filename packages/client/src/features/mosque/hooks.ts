import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMosqueProfile, updateMosqueProfile } from './api';
import type { UpdateMosqueProfileDto } from './types';

export const useMosqueProfile = () => 
{
    return useQuery({
        queryKey: ['mosque-profile'],
        queryFn: getMosqueProfile,
    });
};

export const useUpdateMosqueProfile = () => 
{
    const queryClient = useQueryClient();

    return useMutation(
    {
        mutationFn: (data: UpdateMosqueProfileDto) => updateMosqueProfile(data),
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['mosque-profile'] });
        },
    });
};
