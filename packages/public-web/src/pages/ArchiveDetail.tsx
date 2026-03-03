import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Image as ImageIcon, Video } from 'lucide-react';
import { useAlbumDetail } from '../hooks/useArchive';
import type { ArchiveMedia } from '../types/archive.types';
import { getImageUrl } from '../lib/utils';

const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
};

export const ArchiveDetail = () => 
{
  const { id } = useParams();
  const { data: apiAlbum, isLoading } = useAlbumDetail(id);

  const album = apiAlbum;
  const mediaItems = album?.mediaItems || [];
  const [selectedMedia, setSelectedMedia] = useState<ArchiveMedia | null>(null);

  if (isLoading) 
  {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <div className="mb-8">
          <Link to="/archive" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Galeri
          </Link>
        </div>

        {/* Album Meta */}
        {album && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 mb-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-inner">
              <img 
                src={getImageUrl(album.coverImageUrl) || 'https://via.placeholder.com/800x600?text=No+Image'} 
                alt={album.title} 
                className="w-full h-full object-cover" 
                loading="lazy" 
              />
            </div>
            <div className="w-full md:w-2/3 flex flex-col justify-center h-full">
              {album.category && (
                <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-4 w-fit">
                  {album.category}
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                {album.title}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 font-medium mb-6">
                <Calendar className="w-5 h-5 text-emerald-500" />
                {album.eventDate ? new Date(album.eventDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Tanggal tidak tersedia'}
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">
                {album.description}
              </p>
            </div>
          </div>
        )}

        <div className="columns-2 sm:columns-2 lg:columns-3 gap-3 space-y-3">
          {mediaItems.map((media: ArchiveMedia) => (
            <div 
              key={media.id} 
              onClick={() => setSelectedMedia(media)} 
              className="break-inside-avoid mb-4 relative rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-all bg-slate-100 cursor-pointer"
            >
              {/* Media Image (Same for Photo and Video) */}
              <img 
                src={media.type === 'image' ? getImageUrl(media.mediaUrl) : `https://img.youtube.com/vi/${extractYouTubeId(media.mediaUrl)}/maxresdefault.jpg`}
                onError={(e) => { 
                  if (media.type === 'video') e.currentTarget.src = `https://img.youtube.com/vi/${extractYouTubeId(media.mediaUrl)}/hqdefault.jpg`; 
                }}
                alt={media.title || 'Media'} 
                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500" 
                loading="lazy" 
              />
              
              {/* Elegant Badges */}
              {media.type === 'video' ? (
                <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md z-10 uppercase tracking-widest">
                  <Video className="w-3 h-3" />
                  Video
                </div>
              ) : (
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
              )}
              
              <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <h3 className="text-white text-sm font-semibold line-clamp-2 leading-snug drop-shadow-sm">
                  {media.title || 'Tanpa Judul'}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {mediaItems.length === 0 && (
          <div className="py-20 text-center text-slate-500 font-medium">
            Belum ada media di album ini.
          </div>
        )}

        {selectedMedia && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8" onClick={() => setSelectedMedia(null)}>
            {/* Close Button */}
            <button className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md transition-all z-10" onClick={() => setSelectedMedia(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            {/* Content Container */}
            <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {selectedMedia.type === 'image' ? (
                <img src={getImageUrl(selectedMedia.mediaUrl)} alt={selectedMedia.title || 'Image'} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
              ) : (
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                  <iframe 
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${extractYouTubeId(selectedMedia.mediaUrl)}?autoplay=1&rel=0`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              {/* Optional Title below media */}
              {selectedMedia.title && (
                <div className="mt-4 text-white text-lg font-medium text-center">
                    {selectedMedia.title}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
