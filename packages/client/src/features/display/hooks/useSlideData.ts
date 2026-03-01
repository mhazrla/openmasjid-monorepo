import { useMemo } from 'react';
import { useKajianEvents } from '../../kajian/hooks';
import { useHadithDisplay } from '../hooks';
import { useFinanceSummaryData } from '../../finance/hooks';
import { getImageUrl } from '../../../lib/utils';
import { REFETCH_INTERVAL } from '../../../constants/duration';
import type { SlideContent } from '../types';

export const useSlideData = (ramadanConfig: any | undefined, effectiveDateStr: string, profile: any) => 
{
    const { data: kajianEvents }    = useKajianEvents({ upcoming: true, refetchInterval: REFETCH_INTERVAL });
    const { data: hadith }          = useHadithDisplay(); 
    const { data: financeSummary }  = useFinanceSummaryData({ refetchInterval: REFETCH_INTERVAL });

    return useMemo(() => 
    {
        const items: SlideContent[] = [];
        const specialItems: SlideContent[] = [];

        if (kajianEvents) 
        {
            kajianEvents.forEach((event: any) => 
            {
                if (event.posterUrl) 
                {
                    items.push({ type: 'poster', data: { id: event.id, title: event.title, imageUrl: getImageUrl(event.posterUrl) } });
                } 
                else 
                {
                    items.push({ type: 'kajian_event', data: 
                    {
                        id: event.id,
                        title: event.title,
                        speaker: typeof event.speaker === 'string' ? event.speaker : event.speaker?.name || 'Belum Ditentukan',
                        type: event.type,
                        dateRaw: event.date || event.displayDate || '',
                        posterUrl: event.posterUrl ? getImageUrl(event.posterUrl) : undefined,
                        timeMode: event.timeMode || 'manual',
                        badaSholat: event.badaSholat || undefined,
                        time: event.time || undefined,
                    } });
                }
            });
        }

        if (ramadanConfig?.schedules) 
        {
            const today = ramadanConfig.schedules.find((s: any) => (s.date?.split('T')[0] === effectiveDateStr));
            if (today) 
            {
                if (today.tarawihImam) items.push({ type: 'tarawih_today', data: { ...today, badalImam: ramadanConfig.badalImamText } });
                if (today.iftarSpeaker) items.push({ type: 'kajian_today', data: today });
            }
        }

        if (financeSummary) items.push({ type: 'finance_summary', data: financeSummary });

        
        if (ramadanConfig?.schedules) 
        {
            const upcoming = ramadanConfig.schedules
                .filter((s: any) => s.date?.split('T')[0] >= effectiveDateStr)
                .sort((a: any, b: any) => a.ramadanDay - b.ramadanDay);
            if (upcoming.length > 0) specialItems.push({ type: 'lelang_table', data: upcoming });
        }

        if (profile && (profile.bankAccountNumber || profile.qrisUrl)) 
        {
            specialItems.push({ 
                type: 'bank_info', 
                data: { mosqueName: profile.name, bankName: profile.bankName, bankAccountName: profile.bankAccountName, accountNumber: profile.bankAccountNumber, qrisUrl: profile.qrisUrl ? getImageUrl(profile.qrisUrl) : undefined } 
            });
        }

        if (hadith) 
        {
            specialItems.push({ 
                type: 'hadits', 
                data: { id: hadith.id, text: hadith.teksIndo || '', source: hadith.takhrij || 'Hadits', arabic: hadith.teksArab || undefined } 
            });
        }
        
        return [...items, ...specialItems]; 

    }, [ramadanConfig, effectiveDateStr, kajianEvents, profile, hadith, financeSummary]);
};
