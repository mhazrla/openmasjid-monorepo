import { useMemo, useState } from 'react';
import { AlbumCard } from '../components/AlbumCard';
import { Filter, Search } from 'lucide-react';
import { useAlbums } from '../hooks/useArchive';
import type { ArchiveAlbum } from '../types/archive.types';
import { getImageUrl } from '../lib/utils';

export const ArchiveExplorer = () => {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const filters = ['Semua', 'Kajian', 'Ramadhan', 'Sosial', 'Jumat'];

  const { data: apiAlbums, isLoading } = useAlbums();

  const sourceAlbums = apiAlbums || [];

  const filteredAlbums = useMemo(() => 
  {
    return sourceAlbums.filter((album: ArchiveAlbum) => 
    {
      const matchesFilter = activeFilter === 'Semua' || (album.category ?? 'Lainnya') === activeFilter;
      const matchesSearch = album.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [sourceAlbums, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Galeri Arsip</h1>
            <p className="text-slate-500 mt-2 text-lg">Menyimpan kenangan dan dokumentasi kegiatan masjid.</p>
          </div>
          <div className="bg-white px-5 py-3 rounded-xl border border-slate-100 shadow-sm inline-flex items-center gap-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-emerald-600">{sourceAlbums.length}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Album</span>
            </div>
          </div>
        </div>

        {/* Filters & Search Control */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-10 pb-6 border-b border-slate-200">
          <div className="flex overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 gap-2 hide-scrollbar">
            <div className="flex items-center gap-2 mr-2 text-slate-400">
              <Filter className="w-5 h-5" />
            </div>
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all text-sm
                  ${activeFilter === filter 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Cari album..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Standard Grid Layout for Albums */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {filteredAlbums.map((album: ArchiveAlbum) => (
              <AlbumCard 
                key={album.id} 
                id={album.id!}
                title={album.title}
                date={album.eventDate ? new Date(album.eventDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Tanggal tidak tersedia'}
                coverImage={getImageUrl(album.coverImageUrl) || 'https://via.placeholder.com/800x600?text=No+Image'}
                itemCount={album.mediaCount || 0}
              />
            ))}
          </div>
        )}

        {(!isLoading && filteredAlbums.length === 0) && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Tidak ada album ditemukan</h3>
            <p className="text-slate-500 mt-2">Coba gunakan filter atau kata kunci pencarian lain.</p>
          </div>
        )}

      </div>
    </div>
  );
};
