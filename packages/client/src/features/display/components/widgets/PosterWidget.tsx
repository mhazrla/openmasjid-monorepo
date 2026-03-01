import { memo } from 'react';
import type { PosterWidgetProps } from '../../types';

export const PosterWidget = memo(({ data }: PosterWidgetProps) => (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#0a0f0b] rounded-[3rem] shadow-xl border border-white/5">
        {data.imageUrl && (
            <>
                <div className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-30 scale-110 z-0" style={{ backgroundImage: `url(${data.imageUrl})` }} />
                <img src={data.imageUrl} alt={data.title || "Poster"} className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]" loading="lazy" />
            </>
        )}
    </div>
));
