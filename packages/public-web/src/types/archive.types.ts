export interface ArchiveAlbum {
  id: number | string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean | null;
  eventDate: string | null;
  category?: string; 
  mediaCount?: number;
}

export interface ArchiveMedia {
  id: number | string;
  albumId: number | string;
  type: 'image' | 'video';
  mediaUrl: string;
  title: string | null;
}

export interface ArchiveAlbumDetail extends ArchiveAlbum {
  mediaItems: ArchiveMedia[];
}
