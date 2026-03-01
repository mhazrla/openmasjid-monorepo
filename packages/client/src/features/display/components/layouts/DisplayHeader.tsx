import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getImageUrl } from '../../../../lib/utils';
import type { DisplayConfig } from '../../types';

interface DisplayHeaderProps 
{
    profile: any;
    currentTime: Date;
    config?: DisplayConfig;
    effectiveDate?: Date;
}

export const DisplayHeader = ({ profile, currentTime, config, effectiveDate }: DisplayHeaderProps) => {
    let displayHijriDate = config?.cachedHijriDate;

    if (effectiveDate) {
        try {
            const adjustedDate = new Date(effectiveDate);
            if (config?.hijriAdj) {
                adjustedDate.setDate(adjustedDate.getDate() + config.hijriAdj);
            }
            const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            displayHijriDate = formatter.format(adjustedDate).replace(/ AH$/, ' H');
            if (!displayHijriDate.endsWith('H')) {
                displayHijriDate += ' H';
            }
        } catch (e) {
            console.error('Hijri format error', e);
        }
    }

    return (
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
                    <h1 className="text-[1.5rem] lg:text-[1.8rem] font-black tracking-tight text-white drop-shadow-lg leading-none">{profile?.name}</h1>
                    <div className="flex items-center gap-1.5 text-label opacity-80 mt-0.5 transition-opacity">
                        <p className="font-extrabold" style={{ fontSize: `calc(0.75rem * var(--scale-label, 1))` }}>{profile?.address}</p>
                    </div>
                </div>
            </div>

            <div className="text-right flex flex-col items-end">
                <div 
                    className="font-black font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] leading-none flex items-baseline"
                    style={{ fontSize: `calc(3rem * ${((config?.clockFontSize || 100) / 100)})` }}
                >
                    {format(currentTime, 'HH:mm')}
                    <span 
                        className="text-label opacity-70 ml-1.5 font-bold"
                        style={{ fontSize: '0.4em' }}
                    >
                        {format(currentTime, 'ss')}
                    </span>
                </div>
                <div className="flex flex-col items-end mt-1">
                    <p className="font-extrabold uppercase tracking-widest leading-tight text-accent" style={{ fontSize: `calc(0.75rem * var(--scale-label, 1))` }}>
                        {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })} {displayHijriDate && (<span className="text-label opacity-80 font-extrabold tracking-wide mt-0.5 animate-in fade-in duration-500" style={{ fontSize: '0.9em' }}>/ {displayHijriDate}</span>)}
                    </p>
                </div>
            </div>
        </header>
    );
};