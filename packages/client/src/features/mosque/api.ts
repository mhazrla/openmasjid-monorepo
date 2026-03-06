import { api } from '../../lib/axios';
import type { MosqueProfile, UpdateMosqueProfileDto } from './types';
import type { ApiResponse } from '../../types';

export const getMosqueProfile = async (): Promise<MosqueProfile> => 
{
    const { data } = await api.get<ApiResponse<MosqueProfile>>('/mosque-profile');
    
    return data.data;
};

export const updateMosqueProfile = async (payload: UpdateMosqueProfileDto): Promise<MosqueProfile> => 
{
    const { data } = await api.patch<ApiResponse<MosqueProfile>>('/mosque-profile', payload);

    return data.data; 
};
