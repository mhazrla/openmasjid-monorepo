import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Clock, User, Youtube, Facebook } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import type { KajianSlideData } from '../../types';

const TikTokIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const SocialMediaBadges = () => (
    <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-4">
      <div className="flex items-center gap-4 bg-red-600/20 px-8 py-4 rounded-3xl border border-red-500/30 text-red-200 font-bold" style={{ fontSize: `calc(2rem * var(--scale-label, 1))` }}>
        <Youtube className="w-10 h-10" /> at-tadzkirahtv
      </div>
      <div className="flex items-center gap-4 bg-blue-600/20 px-8 py-4 rounded-3xl border border-blue-500/30 text-blue-200 font-bold" style={{ fontSize: `calc(2rem * var(--scale-label, 1))` }}>
        <Facebook className="w-10 h-10" /> At-tadzkirahtv Masjid
      </div>
      <div className="flex items-center gap-4 bg-pink-600/20 px-8 py-4 rounded-3xl border border-pink-500/30 text-pink-200 font-bold" style={{ fontSize: `calc(2rem * var(--scale-label, 1))` }}>
        <TikTokIcon className="w-10 h-10" /> at_tadzkirahtv
      </div>
    </div>
);

const KajianBadge = ({ type }: { type: string }) => 
{
    const isRutin = type === 'kajian_rutin';
    return (
        <span 
          className={cn(
            'px-10 py-4 rounded-full font-extrabold tracking-widest uppercase shadow-lg border-2 backdrop-blur-md',
            isRutin ? 'bg-primary border-primary/50 text-black' : 'bg-white/10 border-white/20 text-white'
          )}
          style={{ fontSize: `calc(2rem * var(--scale-label, 1))` }}
        >
          {isRutin ? 'KAJIAN RUTIN' : type.replace(/_/g, ' ').toUpperCase()}
        </span>
    );
};

const KajianNoPoster = ({ data, dateStr, timeStr }: { data: KajianSlideData, dateStr: string, timeStr: string }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-full flex flex-col items-center text-center gap-6">
        <KajianBadge type={data.type} />
        <h1 className="font-black leading-tight tracking-tighter text-white drop-shadow-2xl max-w-[100%] uppercase py-2 line-clamp-2" style={{ fontSize: `calc(4rem * var(--scale-label, 1))` }}>
          {data.title || "Judul Kajian Belum Diisi"}
        </h1>

        <div className="flex flex-col items-center justify-center gap-2 bg-white/5 px-16 py-8 rounded-[3rem] border border-white/10 w-full max-w-5xl shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10 mb-2">
            <User className="w-8 h-8" style={{ color: 'var(--theme-accent)' }} />
            <span className="uppercase tracking-widest font-bold" style={{ fontSize: `calc(2.4rem * var(--scale-label, 1))`, color: 'var(--theme-accent)' }}>
              Pemateri
            </span>
          </div>
          <p className="font-black text-white tracking-tight leading-none relative z-10 drop-shadow-md" style={{ fontSize: `calc(4rem * var(--scale-label, 1))` }}>
            {data.speaker || "Belum Ditentukan"}
          </p>
        </div>

        <div className="w-80 h-2 bg-white/10 rounded-full my-1" />

        <div className="grid grid-cols-2 gap-10 w-full max-w-5xl">
          <div className="flex flex-col items-center gap-3 bg-black/30 p-6 rounded-[2.5rem] border border-white/5">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8" style={{ color: 'var(--theme-primary)' }} />
              <span className="uppercase tracking-wider font-bold" style={{ fontSize: `calc(1.7rem * var(--scale-label, 1))`, color: 'var(--theme-label)' }}>Tanggal</span>
            </div>
            <p className="font-extrabold text-slate-100 whitespace-nowrap leading-none" style={{ fontSize: `calc(2.7rem * var(--scale-label, 1))` }}>{dateStr}</p>
          </div>
          <div className="flex flex-col items-center gap-3 bg-black/30 p-6 rounded-[2.5rem] border border-white/5">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8" style={{ color: 'var(--theme-primary)' }} />
              <span className="uppercase tracking-wider font-bold" style={{ fontSize: `calc(1.7rem * var(--scale-label, 1))`, color: 'var(--theme-label)' }}>Waktu</span>
            </div>
            <p className="font-extrabold text-slate-100 leading-none whitespace-nowrap" style={{ fontSize: `calc(2.7rem * var(--scale-label, 1))` }}>{timeStr}</p>
          </div>
        </div>

        <div className="mt-2 transform scale-90">
          <SocialMediaBadges />
        </div>

      </div>
    </div>
);

const KajianWithPoster = ({ data, dateStr, timeStr }: { data: KajianSlideData, dateStr: string, timeStr: string }) => (
    <div className="w-full h-full relative flex items-center justify-center bg-[#0a0f0b] overflow-hidden rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      
      <div className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-40 scale-125 z-0" style={{ backgroundImage: `url(${data.posterUrl})` }} />

      <div className="absolute inset-0 z-10 flex items-center justify-center px-8 pt-8 pb-[240px]">
          <img
            src={data.posterUrl}
            alt={data.title || "Poster Kajian"}
            className="w-full h-full object-contain drop-shadow-2xl"
            loading="lazy"
          />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 pointer-events-none" />

      <div className="absolute bottom-10 left-10 right-10 z-20">
        <div className="bg-black/60 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl flex flex-row items-center justify-between gap-10 w-full">
            
            <div className="flex flex-col gap-4 flex-1 min-w-0 pr-4">
                <div className="flex">
                    <KajianBadge type={data.type} />
                </div>
                <h1 className="font-black leading-tight text-white drop-shadow-lg uppercase line-clamp-3 break-words" style={{ fontSize: `calc(3rem * var(--scale-label, 1))` }}>
                    {data.title || "Kajian Rutin"}
                </h1>
            </div>

            {/* Divider Vertikal */}
            <div className="w-px h-32 bg-white/20 hidden lg:block rounded-full"></div>

            {/* Tengah: Pemateri */}
            <div className="flex flex-col gap-2 w-fit max-w-[35%] shrink-0 justify-center">
                <span className="text-white/60 uppercase tracking-widest font-bold" style={{ fontSize: 'calc(2rem * var(--scale-label, 1))' }}>Pemateri</span>
                <div className="flex items-center gap-4 mt-1">
                    <div className="p-4 bg-primary/20 rounded-2xl border border-primary/30 shrink-0">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    <p className="font-extrabold text-white tracking-wide leading-tight line-clamp-2" style={{ fontSize: `calc(3rem * var(--scale-label, 1))` }}>
                {data.speaker || "Belum Ditentukan"}
            </p>
        </div>
    </div>

            {/* Divider Vertikal */}
            <div className="w-px h-32 bg-white/20 hidden lg:block rounded-full"></div>

            {/* Kanan: Tanggal & Waktu */}
            <div className="flex flex-col gap-4 shrink-0 w-fit">
                <div className="flex items-center gap-5 bg-white/10 border border-white/10 px-6 py-4 rounded-2xl w-full">
                    <Calendar className="w-8 h-8 text-slate-300" />
                    <span className="font-bold text-slate-100 tracking-wide" style={{ fontSize: `calc(2rem * var(--scale-label, 1))` }}>{dateStr}</span>
                </div>
                <div className="flex items-center gap-5 bg-primary/20 border border-primary/40 px-6 py-4 rounded-2xl w-full shadow-inner">
                    <Clock className="w-10 h-10 text-primary drop-shadow-md" />
                    <span className="font-black text-white leading-none drop-shadow-lg tracking-wide" style={{ fontSize: `calc(2rem * var(--scale-label, 1))` }}>{timeStr}</span>
                </div>
            </div>

        </div>
      </div>
    </div>
);

// --- MAIN COMPONENT (Controller) ---
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const KajianWidget = ({ data }: { data: KajianSlideData }) => 
{
  const eventDate = data.dateRaw ? new Date(data.dateRaw) : null;
  const isValidDate = eventDate && !isNaN(eventDate.getTime());

  let dateStr = '-';
  if (data.type === 'kajian_rutin' && data.dayOfWeek != null) 
  {
      const dayName = ['Ahad','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][Number(data.dayOfWeek)] || '';
      dateStr = `Setiap Hari ${dayName}`;
  }
  else if (isValidDate)
  {
      dateStr = format(eventDate, 'EEEE, d MMMM yyyy', { locale: id });
  }

  let timeStr: string;
  if (data.timeMode === 'bada_sholat' && data.badaSholat) 
  {
    timeStr = `Ba'da ${capitalize(data.badaSholat)}`;
  } 
  else if (data.time) 
  {
    timeStr = data.time + ' WIB';
  } 
  else if (isValidDate) 
  {
    timeStr = format(eventDate, 'HH:mm') + ' WIB';
  } 
  else 
  {
    timeStr = '-';
  }

  if (!data.posterUrl) 
  {
    return <KajianNoPoster data={data} dateStr={dateStr} timeStr={timeStr} />;
  }

  return <KajianWithPoster data={data} dateStr={dateStr} timeStr={timeStr} />;
};