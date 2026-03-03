import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { toast } from 'sonner';
import type { ArchiveAlbum, ArchiveMedia, CreateArchiveAlbumRequest, AddVideoMediaRequest } from './types';
import { useLoadingStore } from '../../store/useLoadingStore';

export const useAdminAlbums = () => 
{
    return useQuery({
        queryKey: ['admin', 'albums'],
        queryFn: async () => 
        {
            const { data } = await api.get<{ data: ArchiveAlbum[] }>('/archive/albums');
            return data.data;
        }
    });
};

export const useAdminAlbumMedia = (albumId: number | undefined) => 
{
    return useQuery({
        queryKey: ['admin', 'albums', albumId, 'media'],
        queryFn: async () => 
        {
            const { data } = await api.get<{ data: ArchiveMedia[] }>(`/archive/albums/${albumId}/media`);
            return data.data;
        },
        enabled: !!albumId,
    });
};

export const useCreateAlbum = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateArchiveAlbumRequest) => 
        {
            const { data } = await api.post<{ data: ArchiveAlbum }>('/archive/albums', payload);
            return data.data;
        },
        onMutate: () => useLoadingStore.getState().showLoading('Creating album...'),
        onSettled: () => useLoadingStore.getState().hideLoading(),
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['admin', 'albums'] });
            toast.success('Album created successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to create album');
        }
    });
};

export const useUpdateAlbum = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number, payload: Partial<CreateArchiveAlbumRequest> }) => 
        {
            const { data } = await api.patch<{ data: ArchiveAlbum }>(`/archive/albums/${id}`, payload);
            return data.data;
        },
        onMutate: () => useLoadingStore.getState().showLoading('Updating album...'),
        onSettled: () => useLoadingStore.getState().hideLoading(),
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['admin', 'albums'] });
            toast.success('Album updated successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to update album');
        }
    });
};

export const useDeleteAlbum = () => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => 
        {
            await api.delete(`/archive/albums/${id}`);
        },
        onMutate: () => useLoadingStore.getState().showLoading('Deleting album and cleaning up storage...'),
        onSettled: () => useLoadingStore.getState().hideLoading(),
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['admin', 'albums'] });
            toast.success('Album deleted successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to delete album');
        }
    });
};

export const useAddMedia = (albumId: number) => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: FormData | AddVideoMediaRequest) => 
        {
            const { data } = await api.post<{ data: ArchiveMedia }>(`/archive/albums/${albumId}/media`, payload);
            return data.data;
        },
        onMutate: () => useLoadingStore.getState().showLoading('Adding media...'),
        onSettled: () => useLoadingStore.getState().hideLoading(),
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['admin', 'albums', albumId, 'media'] });
            toast.success('Media added successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to add media');
        }
    });
};

export const useDeleteMedia = (albumId: number) => 
{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (mediaId: number) => 
        {
            await api.delete(`/archive/media/${mediaId}`);
        },
        onMutate: () => useLoadingStore.getState().showLoading('Deleting media...'),
        onSettled: () => useLoadingStore.getState().hideLoading(),
        onSuccess: () => 
        {
            queryClient.invalidateQueries({ queryKey: ['admin', 'albums', albumId, 'media'] });
            toast.success('Media deleted successfully');
        },
        onError: (error: any) => 
        {
            toast.error(error?.response?.data?.message || 'Failed to delete media');
        }
    });
};
