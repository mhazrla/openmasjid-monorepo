import { MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getImageUrl } from '../../../lib/utils';

interface DisplayHeaderProps 
{
    profile: any;
    currentTime: Date;
}

export const DisplayHeader = ({ profile, currentTime }: DisplayHeaderProps) => (
    <header className="relative z-30 px-6 py-3 flex items-center justify-between shrink-0 h-20 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-xl">
                <img 
                    src={profile?.logoUrl ? getImageUrl(profile.logoUrl) : "/images/logo1.webp"} 
                    alt="Logo" 
                    className="w-full h-full object-contain p-1.5"
                    fetchPriority="high"
                />
            </div>
            <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white drop-shadow-lg leading-none">{profile?.name}</h1>
                <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <p className="text-xs font-medium">{profile?.address}</p>
                </div>
            </div>
        </div>

        <div className="text-right">
            <h2 className="text-4xl lg:text-5xl font-bold font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] leading-none">
                {format(currentTime, 'HH:mm')}
                <span className="text-xl text-slate-500 ml-1.5 font-light">{format(currentTime, 'ss')}</span>
            </h2>
            <p className="text-xs text-emerald-400 font-medium uppercase tracking-widest mt-0.5">
                {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })}
            </p>
        </div>
    </header>
);