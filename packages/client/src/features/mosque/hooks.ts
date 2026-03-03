import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMosqueProfile, updateMosqueProfile } from './api';
import type { UpdateMosqueProfileDto } from './types';
import { useLoadingStore } from '../../store/useLoadingStore';

export const useMosqueProfile = (options?: { refetchInterval?: number }) => 
{
    return useQuery({
        queryKey: ['mosque-profile'],
        queryFn: getMosqueProfile,
        refetchInterval: options?.refetchInterval,
    });
};

export const useUpdateMosqueProfile = () => 
{
    const queryClient = useQueryClient();

    return useMutation(
    {
        mutationFn: (data: UpdateMosqueProfileDto) => updateMosqueProfile(data),
        onMutate: () => useLoadingStore.getState().showLoading('Saving profile...'),
        onSettled: () => useLoadingStore.getState().hideLoading(),
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['mosque-profile'] });
        },
    });
};
