import { memo } from 'react';
import type { BankInfoWidgetProps } from '../../types';

export const BankInfoWidget = memo(({ data }: BankInfoWidgetProps) => (
    <div className="w-full h-full flex flex-row bg-[#121914] rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl">
        {data.qrisUrl && (
            <div className="w-4/12 bg-white flex flex-col items-center justify-center p-16 relative">
                <img src={data.qrisUrl} alt="QRIS" className="w-full h-full object-contain scale-105" />
            </div>
        )}
        
        <div className={`${data.qrisUrl ? 'w-8/12' : 'w-full'} p-20 flex flex-col justify-center bg-[#0d120e] text-white relative`}>
            
            <h2 className="font-black uppercase tracking-[0.4em] mb-16 drop-shadow-md" style={{ fontSize: `calc(3.5rem * var(--scale-label, 1))`, color: 'var(--theme-primary)' }}>
                Infaq / Shodaqoh
            </h2>
            
            <div className="space-y-12 z-10 w-full">
                <div className="w-full overflow-hidden">
                    <p className="font-bold uppercase tracking-widest mb-4" style={{ fontSize: `calc(3rem * var(--scale-label, 1))`, color: 'var(--theme-label)' }}>
                        No. Rekening
                    </p>
                    <p className="font-mono text-[6.5rem] font-black tracking-tighter leading-none drop-shadow-2xl whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        {data.accountNumber || '-'}
                    </p>
                </div>
                
                <div className="w-full h-1 bg-white/10" />
                
                <div className="w-full overflow-hidden">
                    <p className="font-black tracking-widest uppercase leading-none mb-3" style={{ fontSize: `calc(3.5rem * var(--scale-label, 1))` }}>
                        {data.bankName || 'BANK'}
                    </p>
                    <p className="font-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis w-full" style={{ fontSize: `calc(4rem * var(--scale-label, 1))`, color: 'var(--theme-accent)' }}>
                        A.N {data.bankAccountName || data.mosqueName}
                    </p>
                </div>
            </div>
        </div>
    </div>
));
