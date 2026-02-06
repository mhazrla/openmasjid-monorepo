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
