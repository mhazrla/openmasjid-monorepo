import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { ArchiveAlbum, ArchiveAlbumDetail, ArchiveMedia } from '../types/archive.types';

let baseURL = '/api/';
if (import.meta.env.PROD && import.meta.env.VITE_API_URL) 
{
  const apiUrl = import.meta.env.VITE_API_URL as string;
  baseURL = apiUrl.endsWith('/api/') ? apiUrl : apiUrl.replace(/\/$/, '') + '/api/';
}

const api = axios.create({
  baseURL,
});

export const useAlbums = () => 
{
  return useQuery({
    queryKey: ['archive', 'albums'],
    queryFn: async () => 
    {
      const { data } = await api.get<{ data: ArchiveAlbum[] }>('/archive/albums');
      return data.data;
    },
  });
};

export const useAlbumDetail = (id: string | undefined) => 
{
  return useQuery({
    queryKey: ['archive', 'albums', id],
    queryFn: async () => 
    {
      if (!id) throw new Error('Album ID is required');
      const { data } = await api.get<{ data: ArchiveMedia[] }>(`/archive/albums/${id}/media`);
      
      const { data: albumsData } = await api.get<{ data: ArchiveAlbum[] }>('/archive/albums');
      const album = albumsData.data.find(a => a.id === parseInt(id, 10));

      if (!album) throw new Error('Album not found');

      return {
        ...album,
        mediaItems: data.data
      } as ArchiveAlbumDetail;
    },
    enabled: !!id,
  });
};
