import { useState, useEffect } from 'react';
import { addMinutes, subMinutes, isWithinInterval, parse } from 'date-fns';
import { getShalatDuration } from './utils/display-helpers';
import type { DisplayMode, Hadith, PrayerState } from '../../features/display/types';
import { api } from '../../lib/axios';
import { useQuery } from '@tanstack/react-query';

export const usePrayerStateMachine = (
  now: Date,
  prayerTimes: any,
  config: any
): PrayerState => 
{
    const [state, setState] = useState<PrayerState>({
        mode: 'normal',
        targetTime: null,
        prayerName: '',
    });

    useEffect(() => 
    {
        if (!prayerTimes || !config) return;

        const checkState = () => 
        {
            const cfg = config as any;

            const delays = 
            {
                Subuh: Number(cfg.iqomahDelaySubuh),
                Dzuhur: Number(cfg.iqomahDelayDzuhur),
                Ashar: Number(cfg.iqomahDelayAshar),
                Maghrib: Number(cfg.iqomahDelayMaghrib),
                Isya: Number(cfg.iqomahDelayIsya),
            };

            const prayers = [
                { name: 'Subuh', time: prayerTimes.subuh },
                { name: 'Dzuhur', time: prayerTimes.dzuhur },
                { name: 'Ashar', time: prayerTimes.ashar },
                { name: 'Maghrib', time: prayerTimes.maghrib },
                { name: 'Isya', time: prayerTimes.isya },
            ];

            let foundMode: DisplayMode = 'normal';
            let target: Date | null = null;
            let pName = '';

            for (const p of prayers) 
            {
                const pTime = parse(p.time, 'HH:mm', now);
                
                const preAdzanDur = Number(cfg.preAdzanDuration);
                const adzanDur = Number(cfg.adzanDuration);
                const iqomahDur = delays[p.name as keyof typeof delays] || 10;
                const shalatDur = getShalatDuration(p.name, cfg);

                // Start times
                const preAdzanStart = subMinutes(pTime, preAdzanDur);
                const adzanEnd = addMinutes(pTime, adzanDur);
                const iqomahTime = addMinutes(adzanEnd, iqomahDur);
                const shalatEnd = addMinutes(iqomahTime, shalatDur);

                // 1. Pre-Adzan (Only if enabled)
                if (cfg.enablePreAdzan && isWithinInterval(now, { start: preAdzanStart, end: pTime })) 
                {
                    foundMode = 'pre_adzan';
                    target = pTime;
                    pName = p.name;
                    break;
                }
                
                // 2. Adzan (Only if enabled)
                if (cfg.enableAdzan && isWithinInterval(now, { start: pTime, end: adzanEnd })) 
                {
                    foundMode = 'adzan';
                    target = null;
                    pName = p.name;
                    break;
                }
                
                // 3. Iqomah (Only if enabled)
                if (cfg.enableIqomah && isWithinInterval(now, { start: adzanEnd, end: iqomahTime })) 
                {
                    foundMode = 'iqomah';
                    target = iqomahTime;
                    pName = p.name;
                    break;
                }

                // 4. Shalat (Only if enabled)
                if (cfg.enableShalat && isWithinInterval(now, { start: iqomahTime, end: shalatEnd })) 
                {
                    foundMode = 'shalat';
                    target = null;
                    pName = p.name;
                    break;
                }
            }

            setState((prev) => 
            {
                const isChanged =
                    prev.mode !== foundMode ||
                    prev.prayerName !== pName ||
                    prev.targetTime?.getTime() !== target?.getTime();
                
                return isChanged ? { mode: foundMode, targetTime: target, prayerName: pName } : prev;
            });
        };

        checkState();
    }, [now, prayerTimes, config]);

    return state;
};

const fetchHadith = async (): Promise<Hadith | null> => 
{
  const { data } = await api.get<{ data: Hadith | null }>('/hadis/display');
  return data.data;
};

export const useHadithDisplay = () => 
{
  return useQuery({
    queryKey: ['hadith-display'],
    queryFn: fetchHadith,
    staleTime: 1000 * 60 * 60, // 1 hour stale time (since backend rotates hourly)
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes just to be safe
    retry: false,
  });
};
