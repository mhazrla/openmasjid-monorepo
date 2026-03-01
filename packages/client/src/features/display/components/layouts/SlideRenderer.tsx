import React, { memo } from 'react';
import { TarawihWidget, PosterWidget, HaditsWidget, RamadanTableWidget, BankInfoWidget, FinanceSummaryWidget, KajianIfthorWidget, KajianWidget } from '../widgets';
import type { SlideContent } from '../../types';

export const SlideRenderer = memo(({ currentSlide, slideIndex, ramadanConfig, effectiveDate }: { currentSlide: SlideContent | null; slideIndex: number; ramadanConfig?: any; effectiveDate: Date; }) => 
{
    if (!currentSlide) return null;

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div key={`${currentSlide.type}-${slideIndex}`} className="w-full h-full flex items-center justify-center animate-in fade-in duration-500 bg-[#121914] rounded-[3rem] shadow-xl border border-white/5 overflow-hidden">
            {children}
        </div>
    );

    const currentHijriYear = ramadanConfig?.hijriYear;

    switch (currentSlide.type) 
    {
        case 'lelang_table': return <Wrapper><RamadanTableWidget schedules={currentSlide.data} config={ramadanConfig} effectiveDate={effectiveDate} /></Wrapper>;
        case 'tarawih_today': return <Wrapper><TarawihWidget data={{ ...currentSlide.data, description: "Mari Luruskan & Rapatkan Shaf" }} hijriYear={currentHijriYear} /></Wrapper>;
        case 'kajian_today': return <Wrapper><KajianIfthorWidget data={currentSlide.data} hijriYear={currentHijriYear} /></Wrapper>;
        case 'kajian_event': return <KajianWidget data={currentSlide.data} />;
        case 'poster': return <Wrapper><PosterWidget data={currentSlide.data} /></Wrapper>;
        case 'bank_info': return <Wrapper><BankInfoWidget data={currentSlide.data} /></Wrapper>;
        case 'hadits': return <Wrapper><HaditsWidget data={currentSlide.data} /></Wrapper>;
        case 'finance_summary': return <Wrapper><FinanceSummaryWidget data={currentSlide.data} /></Wrapper>;
        default: return null;
    }
});
