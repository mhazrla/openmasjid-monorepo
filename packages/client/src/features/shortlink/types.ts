export interface Shortlink 
{
    id: number;
    slug: string;
    originalUrl: string;
    description?: string;
    clicks: number;
    createdAt: string;
}

export interface CreateShortlinkRequests 
{
    slug: string;
    originalUrl: string;
    description?: string;
}

export interface UpdateShortlinkRequests extends Partial<CreateShortlinkRequests> 
{
    id: number;
}

export interface ShortlinkFormModalProps 
{
    isOpen: boolean;
    onClose: () => void;
    editingShortlink?: Shortlink | null;
}