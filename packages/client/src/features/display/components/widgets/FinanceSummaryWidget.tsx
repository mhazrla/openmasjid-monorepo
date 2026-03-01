import { memo } from 'react';
import { Wallet, BarChart3, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { FinanceSummaryWidgetProps } from '../../types';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

export const FinanceSummaryWidget = memo(({ data }: FinanceSummaryWidgetProps) => {
    const { totalAssets, totalIncome, totalExpense, lastUpdated } = data;
    const isKasNegative = totalAssets < 0;
    const formattedLastUpdated = lastUpdated ? format(new Date(lastUpdated), 'dd MMMM yyyy HH:mm', { locale: id }) : format(new Date(), 'dd MMMM yyyy', { locale: id });

    return (
        <div className="flex flex-col w-full h-full p-16 justify-center bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex flex-col gap-0 mb-16 shrink-0 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/5 backdrop-blur-md border border-white/10 shadow-inner text-primary rounded-2xl"><BarChart3 className="w-12 h-12" /></div>
                    <h2 className="text-5xl font-extrabold text-white tracking-widest uppercase drop-shadow-md">Laporan Keuangan <span className="text-primary">Masjid</span></h2>
                </div>
                <div className="ml-[6.5rem] -mt-3">
                    <p className="font-medium tracking-wide" style={{ fontSize: 'calc(2rem * var(--scale-label, 1))', color: 'var(--theme-label)' }}>
                        Terakhir update: <span className="text-white ml-3 font-bold">{formattedLastUpdated}</span>
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-10 w-full shrink-0 relative z-10">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-inner p-12 flex flex-col items-center justify-center rounded-[2rem]">
                    <ArrowUpRight className="w-16 h-16 text-emerald-400 mb-6 drop-shadow-md" />
                    <p className="font-bold uppercase tracking-widest mb-4" style={{ fontSize: 'calc(2.5rem * var(--scale-label, 1))', color: 'var(--theme-label)' }}>Pemasukan</p>
                    <p className="font-mono text-5xl font-black text-white tracking-tight drop-shadow-md">{formatCurrency(totalIncome)}</p>
                </div>
                <div className={`p-14 flex flex-col items-center justify-center border-2 rounded-[2.5rem] scale-105 z-10 bg-black/50 backdrop-blur-xl ${isKasNegative ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 'border-primary/60 shadow-[0_0_40px_rgba(16,185,129,0.25)]'}`}>
                    <Wallet className="w-20 h-20 text-primary mb-6 drop-shadow-[0_0_10px_var(--theme-primary)]" />
                    <p className="font-bold text-white uppercase tracking-widest mb-4" style={{ fontSize: `calc(3rem * var(--scale-label, 1))` }}>Saldo Kas</p>
                    <p className={`font-mono text-6xl font-black tracking-tighter drop-shadow-xl ${isKasNegative ? 'text-rose-400' : 'text-primary'}`}>{formatCurrency(totalAssets)}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-inner p-12 flex flex-col items-center justify-center rounded-[2rem]">
                    <ArrowDownLeft className="w-16 h-16 text-rose-400 mb-6 drop-shadow-md" />
                    <p className="font-bold uppercase tracking-widest mb-4" style={{ fontSize: 'calc(2.5rem * var(--scale-label, 1))', color: 'var(--theme-label)' }}>Pengeluaran</p>
                    <p className="font-mono text-5xl font-black text-white tracking-tight drop-shadow-md">{formatCurrency(totalExpense)}</p>
                </div>
            </div>
        </div>
    );
});
