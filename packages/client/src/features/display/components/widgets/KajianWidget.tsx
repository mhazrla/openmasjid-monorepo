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
      <div className="flex items-center gap-4 bg-red-600/20 px-8 py-4 rounded-3xl border border-red-500/30 text-red-200 font-bold" style={{ fontSize: `calc(1.6rem * var(--scale-label, 1))` }}>
        <Youtube className="w-10 h-10" /> at-tadzkirahtv
      </div>
      <div className="flex items-center gap-4 bg-blue-600/20 px-8 py-4 rounded-3xl border border-blue-500/30 text-blue-200 font-bold" style={{ fontSize: `calc(1.6rem * var(--scale-label, 1))` }}>
        <Facebook className="w-10 h-10" /> At-tadzkirahtv Masjid
      </div>
      <div className="flex items-center gap-4 bg-pink-600/20 px-8 py-4 rounded-3xl border border-pink-500/30 text-pink-200 font-bold" style={{ fontSize: `calc(1.6rem * var(--scale-label, 1))` }}>
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

const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-center gap-8">
      <div className="p-6 bg-black/40 rounded-3xl border border-white/10">
        <Icon className="w-12 h-12" style={{ color: 'var(--theme-primary)' }} />
      </div>
      <div className="overflow-hidden">
        <p className="uppercase tracking-widest font-bold mb-2" style={{ fontSize: `calc(1.8rem * var(--scale-label, 1))`, color: 'var(--theme-label, #cbd5e1)' }}>
          {label}
        </p>
        <p className="text-[3.5rem] font-extrabold text-white tracking-tight truncate leading-tight">
          {value}
        </p>
      </div>
    </div>
);

const KajianNoPoster = ({ data, dateStr, timeStr }: { data: KajianSlideData, dateStr: string, timeStr: string }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-12 md:p-20 relative overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center text-center gap-10">
        <KajianBadge type={data.type} />
        <h1 className="text-[7.5rem] font-black leading-none tracking-tighter text-white drop-shadow-2xl max-w-[95%] uppercase py-4">
          {data.title || "Judul Kajian Belum Diisi"}
        </h1>

        <div className="flex flex-col items-center justify-center gap-4 bg-white/5 px-24 py-10 rounded-[4rem] border border-white/10 w-full max-w-5xl shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-5 relative z-10 mb-2">
            <User className="w-10 h-10" style={{ color: 'var(--theme-accent)' }} />
            <span className="uppercase tracking-[0.5em] font-bold" style={{ fontSize: `calc(2.5rem * var(--scale-label, 1))`, color: 'var(--theme-accent)' }}>
              Pemateri
            </span>
          </div>
          <p className="text-[6rem] font-black text-white tracking-tight leading-none relative z-10 drop-shadow-md">
            {data.speaker || "Belum Ditentukan"}
          </p>
        </div>

        <div className="w-80 h-2 bg-white/10 rounded-full my-2" />

        <div className="grid grid-cols-2 gap-16 w-full max-w-5xl">
          <div className="flex flex-col items-center gap-4 bg-black/30 p-8 rounded-[3rem] border border-white/5">
            <div className="flex items-center gap-4">
              <Calendar className="w-10 h-10" style={{ color: 'var(--theme-primary)' }} />
              <span className="uppercase tracking-[0.3em] font-bold" style={{ fontSize: `calc(2rem * var(--scale-label, 1))`, color: 'var(--theme-label)' }}>Tanggal</span>
            </div>
            <p className="text-[3rem] font-extrabold text-slate-100 whitespace-nowrap leading-none">{dateStr}</p>
          </div>
          <div className="flex flex-col items-center gap-4 bg-black/30 p-8 rounded-[3rem] border border-white/5">
            <div className="flex items-center gap-4">
              <Clock className="w-10 h-10" style={{ color: 'var(--theme-primary)' }} />
              <span className="uppercase tracking-[0.3em] font-bold" style={{ fontSize: `calc(2rem * var(--scale-label, 1))`, color: 'var(--theme-label)' }}>Waktu</span>
            </div>
            <p className="text-[3rem] font-extrabold text-slate-100 leading-none whitespace-nowrap">{timeStr}</p>
          </div>
        </div>

        <div className="mt-4">
          <SocialMediaBadges />
        </div>

      </div>
    </div>
);

const KajianWithPoster = ({ data, dateStr, timeStr }: { data: KajianSlideData, dateStr: string, timeStr: string }) => (
    <div className="w-full h-full flex flex-col lg:flex-row bg-[#0a0f0b] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      
      <div className="hidden lg:flex lg:w-[50%] relative bg-black items-center justify-center overflow-hidden h-full">
        <div className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-30 scale-110 z-0" style={{ backgroundImage: `url(${data.posterUrl})` }} />
        <img
          src={data.posterUrl}
          alt={data.title}
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          loading="lazy"
        />
      </div>

      <div className="w-full lg:w-[50%] flex flex-col justify-between p-16 lg:p-20 bg-[#0d120e] relative border-l border-white/5">
        <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex justify-start mb-2">
            <KajianBadge type={data.type} />
          </div>
          <h1 className="text-[5.5rem] font-black leading-tight text-white drop-shadow-md uppercase line-clamp-3">
            {data.title || "Judul Kajian"}
          </h1>
        </div>

        <div className="relative z-10 flex flex-col gap-10 my-8">
          <div className="flex items-center gap-8 bg-white/5 px-10 py-8 rounded-[3rem] border border-white/10 w-full shadow-inner">
            <div className="p-6 bg-black/50 rounded-3xl border border-white/5 shrink-0">
              <User className="w-16 h-16" style={{ color: 'var(--theme-accent)' }} />
            </div>
            <div className="overflow-hidden">
              <p className="uppercase tracking-[0.4em] font-bold mb-2" style={{ fontSize: `calc(1.8rem * var(--scale-label, 1))`, color: 'var(--theme-accent)' }}>
                Pemateri
              </p>
              <p className="text-[4rem] font-extrabold text-white tracking-tight truncate leading-none py-2">
                {data.speaker}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-white/10" />

          <div className="flex flex-col gap-10">
            <InfoItem icon={Calendar} label="Tanggal" value={dateStr} />
            <InfoItem icon={Clock} label="Waktu" value={timeStr} />
          </div>
        </div>

        <div className="relative z-10 pt-4">
          <p className="uppercase tracking-[0.3em] font-bold mb-4" style={{ fontSize: `calc(1.8rem * var(--scale-label, 1))`, color: 'var(--theme-label)' }}>
            Live Streaming On
          </p>
          <SocialMediaBadges />
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

  const dateStr = isValidDate
    ? format(eventDate, 'EEEE, d MMMM yyyy', { locale: id })
    : '-';

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