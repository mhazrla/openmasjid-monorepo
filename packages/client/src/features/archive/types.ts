export interface ArchiveAlbum 
{
    id: number;
    title: string;
    description: string | null;
    category?: string;
    coverImageUrl: string | null;
    isFeatured: boolean | null;
    eventDate: string | null;
    mediaCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ArchiveMedia 
{
    id: number;
    albumId: number;
    type: 'image' | 'video';
    mediaUrl: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateArchiveAlbumRequest 
{
    title: string;
    description?: string;
    category?: string;
    eventDate?: Date;
    coverImageUrl?: string | null;
    isFeatured?: boolean;
}

export interface AddVideoMediaRequest 
{
    type: 'video';
    mediaUrl: string;
    title?: string;
}

export interface ArchiveFormValues 
{
    title: string;
    description: string;
    category: string;
    eventDate: string;
    isFeatured: string;
    coverImage: FileList | null;
}

export interface ArchiveFormModalProps 
{
    isOpen: boolean;
    onClose: () => void;
    album?: ArchiveAlbum;
}

export interface AddMediaForm 
{
    title: string;
    videoUrl: string;
    imageFile: FileList | null;
}
