import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Clock, User, Youtube, Facebook } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { KajianSlideData } from '../types';

// --- 1. ATOMIC COMPONENTS (Kecil & Reusable) ---
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const SocialMediaBadges = () => (
  <div className="flex flex-wrap gap-2 mt-3">
    <div className="flex items-center gap-1.5 bg-red-600/20 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-200 text-xs font-semibold">
      <Youtube className="w-3.5 h-3.5" /> at-tadzkirahtv
    </div>
    <div className="flex items-center gap-1.5 bg-blue-600/20 px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-200 text-xs font-semibold">
      <Facebook className="w-3.5 h-3.5" /> At-tadzkirahtv Masjid
    </div>
    <div className="flex items-center gap-1.5 bg-pink-600/20 px-3 py-1.5 rounded-lg border border-pink-500/30 text-pink-200 text-xs font-semibold">
      <TikTokIcon className="w-3.5 h-3.5" /> at_tadzkirahtv
    </div>
  </div>
);

const KajianBadge = ({ type }: { type: string }) => 
{
  const isRutin = type === 'kajian_rutin';
  return (
    <span className={cn(
      'px-4 py-1 rounded-full text-[10px] md:text-xs font-extrabold tracking-wider uppercase shadow-sm border backdrop-blur-sm',
      isRutin
        ? 'bg-blue-900/40 border-blue-500/40 text-blue-200'
        : 'bg-white/10 border-white/20 text-white'
    )}>
      {type.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
};

const InfoItem = ({ icon: Icon, label, value, colorClass }: { icon: any, label: string, value: string, colorClass: string }) => (
  <div className="flex items-center gap-3">
    <div className={cn("p-2 bg-slate-800/60 rounded-lg border border-slate-700", colorClass)}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="overflow-hidden">
      <p className="text-[0.625rem] uppercase tracking-widest text-slate-400 font-semibold mb-0.5">{label}</p>
      <p className="text-[1rem] lg:text-[1.125rem] font-extrabold text-white tracking-tight truncate leading-tight">
        {value}
      </p>
    </div>
  </div>
);

// --- 2. KAJIAN COMPONENTS ---

const KajianNoPoster = ({ data, dateStr, timeStr }: { data: KajianSlideData, dateStr: string, timeStr: string }) => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-full max-w-4xl bg-linear-to-b from-slate-900/95 to-black backdrop-blur-md border border-slate-700/50 rounded-3xl shadow-2xl p-8 md:p-10 flex flex-col items-center text-center gap-5 animate-fade-in zoom-in-95 duration-700 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent animate-spin-slow pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10">
        <KajianBadge type={data.type} />
      </div>

      <h1 className="relative z-10 text-[1.5rem] sm:text-[1.875rem] md:text-[2.25rem] font-black leading-tight tracking-tight text-white drop-shadow-2xl max-w-[95%]">
        {data.title || "Judul Kajian Belum Diisi"}
      </h1>

      {/* Narasumber Highlight */}
      <div className="relative z-10 flex flex-col items-center gap-1 bg-slate-800/60 px-8 py-4 rounded-2xl border border-slate-600/50 w-full max-w-xl shadow-lg">
        <div className="flex items-center gap-2 text-slate-400">
          <User className="w-[1rem] h-[1rem] text-accent" />
          <span className="text-[0.625rem] uppercase tracking-widest font-semibold">Narasumber</span>
        </div>
        <p className="text-[1.125rem] md:text-[1.5rem] font-black text-accent tracking-tight">
          {data.speaker}
        </p>
      </div>

      <div className="w-20 h-px bg-slate-700/80 my-2" />

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-lg">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-blue-300/80">
            <Calendar className="w-[1rem] h-[1rem]" />
            <span className="text-[0.625rem] uppercase tracking-widest font-semibold">Tanggal</span>
          </div>
          <p className="text-[1.25rem] font-extrabold text-slate-100">{dateStr}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-orange-300/80">
            <Clock className="w-[1rem] h-[1rem]" />
            <span className="text-[0.625rem] uppercase tracking-widest font-semibold">Waktu</span>
          </div>
          <p className="text-[1.25rem] font-extrabold text-slate-100">{timeStr}</p>
        </div>
      </div>

      <div className="relative z-10 mt-2">
        <SocialMediaBadges />
      </div>
    </div>
  </div>
);

const KajianWithPoster = ({ data, dateStr, timeStr }: { data: KajianSlideData, dateStr: string, timeStr: string }) => (
  <div className="w-full h-full flex items-center justify-center p-2 md:p-4">
    <div className="w-full max-w-[95vw] h-[65vh] min-h-[400px] flex flex-col lg:flex-row bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
      
      {/* Left: Poster */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-black items-center justify-center overflow-hidden h-full">
        <img
          src={data.posterUrl}
          alt={data.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Right: Info */}
      <div className="w-full lg:w-[40%] flex flex-col justify-between p-6 bg-slate-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-slate-800/50 via-slate-900 to-slate-900 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex justify-start">
            <KajianBadge type={data.type} />
          </div>
          <h1 className="text-[1.25rem] md:text-[1.5rem] lg:text-[1.875rem] font-black leading-tight text-white drop-shadow-md line-clamp-2">
            {data.title || "Judul Kajian"}
          </h1>
        </div>

        <div className="relative z-10 flex flex-col gap-4 my-2">
          <div className="flex items-center gap-3 bg-slate-800/60 px-3 py-3 rounded-xl border border-slate-700/50 w-full shadow-inner">
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-700 text-accent shrink-0">
              <User className="w-[1.25rem] h-[1.25rem]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[0.625rem] uppercase tracking-widest text-slate-400 font-semibold mb-0.5">Narasumber</p>
              <p className="text-[1rem] font-extrabold text-white tracking-tight truncate">
                {data.speaker}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-800" />

          <div className="flex flex-col gap-3">
            <InfoItem icon={Calendar} label="Tanggal" value={dateStr} colorClass="text-blue-400" />
            <InfoItem icon={Clock} label="Waktu" value={timeStr} colorClass="text-orange-400" />
          </div>
        </div>

        <div className="relative z-10 pt-2">
          <p className="text-[0.625rem] uppercase tracking-widest text-slate-500 font-semibold mb-1">Live Streaming On</p>
          <SocialMediaBadges />
        </div>
      </div>
    </div>
  </div>
);

// --- 3. MAIN COMPONENT (Controller) ---

export const KajianWidget = ({ data }: { data: KajianSlideData }) => 
{
  const eventDate = new Date(data.dateRaw);
  const dateStr = format(eventDate, 'EEEE, d MMMM yyyy', { locale: id });
  const timeStr = format(eventDate, 'HH:mm') + ' WIB';

  if (!data.posterUrl) {
    return <KajianNoPoster data={data} dateStr={dateStr} timeStr={timeStr} />;
  }

  return <KajianWithPoster data={data} dateStr={dateStr} timeStr={timeStr} />;
};