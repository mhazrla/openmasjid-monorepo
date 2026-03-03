import { Link } from 'react-router-dom';
import { Calendar, ImageIcon } from 'lucide-react';

interface AlbumCardProps {
  id: string | number;
  title: string;
  date: string;
  coverImage?: string;
  itemCount: number;
}

export const AlbumCard = ({ id, title, date, coverImage, itemCount }: AlbumCardProps) => {
  return (
    <Link to={`/archive/${id}`} className="group block overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 break-inside-avoid mb-6">
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" />
          {itemCount}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
          {title}
        </h3>
        <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500 font-medium whitespace-nowrap">
          <Calendar className="w-4 h-4 text-emerald-500" />
          {date}
        </div>
      </div>
    </Link>
  );
};
