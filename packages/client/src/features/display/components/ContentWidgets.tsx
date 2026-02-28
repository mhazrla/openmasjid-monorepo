
import { memo } from 'react';
import { Moon, Quote, HandHeart, Wallet, BarChart3, ArrowUpRight, ArrowDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import type 
{ 
    RamadanScheduleUI, 
    TarawihWidgetProps, 
    PosterWidgetProps, 
    HaditsWidgetProps,
    BankInfoWidgetProps,
    FinanceSummaryWidgetProps
} from '../types';
import type { RamadanConfig } from '../../ramadan/types';

const formatCurrency = (amount: number) => 
{
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

const BigStatusBadge = memo(({ status, qty, active }: { status: string, qty: number, active: boolean }) => 
{
    return (
        <div className={`w-full h-full flex flex-col items-center justify-center rounded-xl border-2 relative overflow-hidden transition-all ${
            active 
                ? 'bg-primary text-white border-white/20 shadow-inner' 
                : 'bg-black/20 text-slate-400 border-white/10'
        }`}>
            {active && <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent" />}
            
            <span className={`font-mono font-black leading-none z-10 tracking-tighter ${active ? 'text-5xl drop-shadow-md' : 'text-4xl opacity-80'}`}>
                {qty || 0}
            </span>
            
            <span className={`font-black uppercase z-10 tracking-widest mt-0.5 transition-all ${active ? 'text-white' : 'text-label'}`} style={{ fontSize: `calc(0.75rem * var(--scale-label, 1))` }}>
                {status === 'close' ? 'TERPENUHI' : 'TERKUMPUL'}
            </span>
        </div>
    );
});

const RamadanRow = memo(({ row, effectiveDate }: { row: RamadanScheduleUI, effectiveDate: Date }) => 
{
    const isToday = isSameDay(parseISO(row.date), effectiveDate);
    
    return (
        <div className={`relative grid grid-cols-12 gap-3 flex-1 items-center px-2 rounded-2xl border-2 transition-all duration-500 ${
            isToday 
                ? 'bg-linear-to-r from-primary/80 to-slate-800 border-primary shadow-[0_0_25px_-5px_var(--theme-primary)] z-10 scale-[1.01]' 
                : 'bg-slate-900/40 border-slate-800 opacity-70'
        }`}>
            {isToday && <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-primary rounded-r-full shadow-[0_0_15px_var(--theme-primary)]" />}

            {/* DATE */}
            <div className="col-span-2 flex flex-col items-center justify-center border-r-2 border-white/5 h-full py-1">
                <span className={`font-mono font-black leading-none tracking-tighter ${isToday ? 'text-[3.5rem] text-white drop-shadow-xl' : 'text-[3rem] text-slate-500'}`}>
                    {row.ramadanDay}
                </span>
                <span className={`uppercase font-black mt-0.5 tracking-widest transition-all ${isToday ? 'text-accent drop-shadow-md' : 'text-label opacity-60'}`} style={{ fontSize: `calc(0.6rem * var(--scale-label, 1))` }}>
                    {format(parseISO(row.date), 'dd MMM', { locale: id })}
                </span>
            </div>

            {/* TAKJIL */}
            <div className="col-span-3 h-full py-1">
                <BigStatusBadge status={row.iftarSnackStatus} qty={row.iftarSnackQty} active={isToday} />
            </div>

            {/* IFTHOR */}
            <div className="col-span-3 h-full py-1">
                <BigStatusBadge status={row.iftarMealStatus} qty={row.iftarMealQty} active={isToday} />
            </div>

            {/* AIR MINERAL */}
            <div className="col-span-2 h-full flex flex-col items-center justify-center border-x-2 border-white/5 bg-black/20">
                <span className={`font-mono font-black block leading-none tracking-tighter ${isToday ? 'text-5xl text-cyan-300 drop-shadow-lg' : 'text-4xl text-slate-500'}`}>
                    {(row.waterTarawihQty + row.waterIftarQty + row.waterItikafQty) || 0}
                </span>
                <span className={`font-black uppercase tracking-widest mt-1 transition-all ${isToday ? 'text-cyan-600' : 'text-label opacity-60'}`} style={{ fontSize: `calc(0.75rem * var(--scale-label, 1))` }}>DUS</span>
            </div>

            <div className="col-span-2 h-full flex flex-col justify-between py-1 pl-2 gap-1">
                {/* Itikaf */}
                <div className="flex-1 flex items-center justify-between bg-slate-800/60 rounded-lg px-2">
                    <span className="font-black text-label uppercase transition-all" style={{ fontSize: `calc(0.7rem * var(--scale-label, 1))` }}>ITIKAF</span>
                    <span className={`text-[1.25rem] font-mono font-black ${row.itikafStatus === 'open' ? 'text-accent' : 'text-slate-600'}`}>
                        {row.itikafQty || 0}
                    </span>
                </div>
                {/* Santunan */}
                <div className="flex-1 flex items-center justify-between bg-slate-800/60 rounded-lg px-2">
                    <span className="font-black text-label uppercase transition-all" style={{ fontSize: `calc(0.7rem * var(--scale-label, 1))` }}>SANTUNAN</span>
                    <span className={`text-[1.25rem] font-mono font-black ${row.charityStatus === 'open' ? 'text-accent' : 'text-slate-600'}`}>
                        {row.charityQty || 0}
                    </span>
                </div>
            </div>
        </div>
    );
});

export const RamadanTableWidget = memo(({ schedules, config, effectiveDate }: { schedules: RamadanScheduleUI[], config?: RamadanConfig, effectiveDate: Date }) => (
    <div className="w-full max-w-[1700px] mx-auto h-[700px] flex flex-col px-4 pt-2 pb-1 overflow-hidden font-sans bg-slate-950/40 rounded-3xl border border-white/5 backdrop-blur-sm shrink-0">
        {/* HEADER */}
        <div className="min-h-[50px] flex items-center justify-between mb-2 px-6 bg-slate-900/80 rounded-2xl border border-white/10 shadow-lg shrink-0">
            <div className="flex items-center gap-3 py-3">
                <div className="p-2 rounded-xl text-white bg-black/20 border border-white/5">
                    <HandHeart className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-[1.25rem] font-black text-white tracking-tight uppercase leading-none mt-1">{ config?.title }</h2>
                    <span className="text-label font-extrabold tracking-widest uppercase transition-all" style={{ fontSize: `calc(0.7rem * var(--scale-label, 1))` }}>{ config?.subtitle }</span>
                </div>
            </div>
        </div>

        {/* TABLE HEADER */}
        <div className="h-auto min-h-[25px] grid grid-cols-12 gap-2 px-6 items-center font-black uppercase tracking-widest text-label shrink-0 transition-all" style={{ fontSize: `calc(0.75rem * var(--scale-label, 1))` }}>
            <div className="col-span-2 text-center border-b-2 border-slate-800 pb-0.5">Tanggal</div>
            <div className="col-span-3 text-center border-b-2 border-slate-800 pb-0.5">Takjil</div>
            <div className="col-span-3 text-center border-b-2 border-slate-800 pb-0.5">Ifthor</div>
            <div className="col-span-2 text-center border-b-2 border-slate-800 pb-0.5">Air</div>
            <div className="col-span-2 text-center border-b-2 border-slate-800 pb-0.5">Lainnya</div>
        </div>

        {/* BODY ROWS */}
        <div className="flex-1 flex flex-col gap-2 min-h-0 pt-1 pb-1">
            {schedules.map((row) => (
                <RamadanRow key={row.id || row.date} row={row} effectiveDate={effectiveDate} />
            ))}
        </div>
    </div>
));

export const TarawihWidget = memo(({ data, hijriYear, title = "Tarawih" }: TarawihWidgetProps) => (
    <div className="flex items-center justify-center w-full h-full animate-in zoom-in duration-700 p-8 shrink-0">
        <div className="relative w-full max-w-[1700px] mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-row h-[600px] shrink-0">
            <div className="w-1/3 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ backgroundColor: 'var(--theme-primary)' }}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-20 mix-blend-overlay"></div>
                <div className="w-[7rem] h-[7rem] bg-black/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm shadow-lg border border-white/10">
                    <Moon className="w-[3.5rem] h-[3.5rem] text-white drop-shadow-md" />
                </div>
                <h2 className="text-[1.8rem] font-extrabold text-white uppercase tracking-widest mb-3 drop-shadow-md">{title}</h2>
                <span className="px-5 py-2 bg-black/30 rounded-full text-white/90 text-[1.125rem] font-mono border border-white/20 shadow-inner">
                    {hijriYear} Hijriah
                </span>
            </div>
            <div className="w-2/3 p-12 flex flex-col justify-center items-start relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full opacity-5 blur-[100px] pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-6 z-10">
                    <span className="px-4 py-1.5 rounded bg-white/10 text-white text-[0.875rem] font-extrabold uppercase tracking-wider border border-primary/20">Malam Ini</span>
                    <span className="text-slate-400 text-[1.125rem]">Ramadhan Ke-{data.ramadanDay}</span>
                </div>
                <h1 className="text-[2.25rem] lg:text-[2.5rem] font-extrabold text-white leading-tight mb-6 font-serif">
                    {data.tarawihImam?.name || data.imam?.name || "Belum Ditentukan"}
                </h1>
                
                <div className="space-y-8 w-full z-10">
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-[0.9rem] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Penceramah</span>
                        <h3 className="text-[2.25rem] font-extrabold text-white leading-tight drop-shadow-sm">
                            {typeof data.imam === 'string' ? data.imam : data.imam?.name || "Belum Ditentukan"}
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    </div>
));

export const PosterWidget = memo(({ data }: PosterWidgetProps) => (
    <div className="w-full h-full flex items-center justify-center relative animate-in fade-in zoom-in duration-700 overflow-hidden">
        {data.imageUrl && (
            <>
                <div className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-60 scale-150 z-0" style={{ backgroundImage: `url(${data.imageUrl})` }} />
                <div className="relative z-10 w-full h-full flex items-center justify-center p-10">
                    <img 
                        src={data.imageUrl} 
                        alt={data.title || "Poster"} 
                        className="max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl border-4 border-white/10" 
                        loading="lazy"
                    />
                </div>
            </>
        )}
    </div>
));

export const HaditsWidget = memo(({ data }: HaditsWidgetProps) => 
{
    const getArabicSize = (len: number) => 
    {
        if (len < 50) return 'text-[3rem] lg:text-[3.75rem]';
        if (len < 150) return 'text-[2.25rem] lg:text-[3rem]';
        if (len < 300) return 'text-[1.875rem] lg:text-[2.25rem]';
        return 'text-[1.5rem] lg:text-[1.875rem]';
    };

    const getTextSize = (len: number) => 
    {
        if (len < 100) return 'text-[1.5rem] lg:text-[1.875rem]';
        if (len < 300) return 'text-[1.25rem] lg:text-[1.5rem]';
        if (len < 600) return 'text-[1.125rem] lg:text-[1.25rem]';
        return 'text-[1rem] lg:text-[1.125rem]';
    };

    const arabicLen = data.arabic?.length || 0;
    const textLen = data.text.length;

    return (
        <div className="flex items-center justify-center w-full h-full animate-in slide-in-from-bottom-8 duration-1000 p-8 shrink-0">
            <div className="w-full max-w-[1700px] h-[800px] mx-auto py-12 flex flex-col items-center justify-center relative z-10 bg-slate-950/60 backdrop-blur-xl px-16 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden shrink-0">
                
                {/* Background Ornament - Centered and Subtle */}
                <Quote className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-white/5 -scale-x-100" />
                <Quote className="absolute top-10 left-10 w-24 h-24 text-white/10 -scale-x-100" />
                <Quote className="absolute bottom-10 right-10 w-24 h-24 text-white/10" />

                {/* Main Content Container - Vertical Layout */}
                <div className="z-10 w-full h-full flex flex-col items-center justify-center overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none] space-y-12">
                    
                    {/* Top: Arabic Text */}
                    {data.arabic && (
                        <div className="w-full flex-col flex items-center justify-center text-center px-16 xl:px-32">
                            <h1 
                                className={`${getArabicSize(arabicLen)} text-white font-serif leading-loose drop-shadow-lg py-2 max-w-[1400px]`} 
                                dir="rtl"
                            >
                                {data.arabic}
                            </h1>
                        </div>
                    )}

                    {/* Bottom: Translation & Source */}
                    <div className="w-full max-w-[1400px] flex flex-col items-center justify-center text-center px-16 md:px-24">
                        <div className="relative">
                            <p className={`${getTextSize(textLen)} text-slate-200 font-light leading-relaxed italic`}>
                                "{data.text}" 
                                <span className="text-accent font-extrabold uppercase tracking-widest text-[1.25rem] not-italic ml-3 inline-block mt-2">
                                    — {data.source}
                                </span>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
});

export const BankInfoWidget = memo(({ data }: BankInfoWidgetProps) => (
    <div className="flex items-center justify-center w-full h-full animate-in zoom-in duration-700 p-8 shrink-0">
        <div className="relative w-full max-w-[1600px] h-[650px] mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-row shrink-0">
            
            {/* LEFT / TOP: QRIS - Only show if URL exists */ }
            { data.qrisUrl && (
                <div className="w-5/12 bg-white p-8 flex flex-col items-center justify-center relative group">
                    <img 
                        src={data.qrisUrl} 
                        alt="QRIS" 
                        className="w-full h-full object-contain max-h-[400px] z-10 drop-shadow-xl" 
                        loading="lazy"
                    />
                    <div className="absolute top-2 right-2 z-20">
                        <img src="/images/qris-icon.webp" alt="QRIS Logo" className="h-8 opacity-80" loading="lazy" />
                    </div>
                </div>
            )}

            {/* RIGHT / BOTTOM: INFO */}
            <div className={`${data.qrisUrl ? 'w-7/12' : 'w-full'} p-16 flex flex-col justify-center bg-linear-to-br from-slate-900 to-black text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full opacity-10 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <h2 className="text-[1.25rem] font-extrabold text-accent uppercase tracking-widest mb-6 drop-shadow-md">Infaq / Shodaqoh</h2>

                {/* DIGITAL INFO CARD STYLE */}
                <div className={`relative w-full ${data.qrisUrl ? 'flex-1 py-10' : 'max-w-3xl mx-auto py-12'} bg-slate-800/50 rounded-3xl p-8 border border-white/10 flex flex-col justify-center items-start overflow-hidden group backdrop-blur-md`}>
                    
                    {/* Background Decor */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-primary rounded-full opacity-5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 w-full space-y-6">
                        <div>
                            <p className="font-extrabold text-label uppercase tracking-widest mb-2 transition-all" style={{ fontSize: `calc(0.875rem * var(--scale-label, 1))` }}>No. Rekening</p>
                            <div className="flex items-center gap-4">
                                <p className="font-mono text-[2.25rem] lg:text-[3.75rem] font-black text-white tracking-tight drop-shadow-md">
                                    {data.accountNumber || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-px bg-white/10" />

                        <div className="flex flex-col gap-1">
                            <p className="font-extrabold text-label tracking-tight drop-shadow-sm transition-all" style={{ fontSize: `calc(1.5rem * var(--scale-label, 1))` }}>
                                {data.bankName || 'BANK'}
                            </p>
                            <p className="font-bold text-label uppercase tracking-wider truncate transition-all" style={{ fontSize: `calc(0.875rem * var(--scale-label, 1))` }}>
                                a.n {data.bankAccountName || data.mosqueName}
                            </p>
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 opacity-20 transform rotate-12">
                        <HandHeart className="w-[8rem] h-[8rem] text-accent" />
                    </div>
                </div>

            </div>
        </div>
    </div>
));

export const FinanceSummaryWidget = memo(({ data }: FinanceSummaryWidgetProps) => 
{
    const { totalAssets, totalIncome, totalExpense, recentTransactions } = data;
    const isKasNegative = totalAssets < 0;

    return (
        <div className="flex items-center justify-center w-full h-full animate-in zoom-in duration-700 p-8 shrink-0">
            <div className="w-full max-w-[1750px] h-[800px] mx-auto py-8 flex flex-col items-start justify-start relative z-10 bg-[#0f1423] p-12 rounded-[3rem] border border-white/10 shadow-2xl shrink-0">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-5 shrink-0">
                    <div className="p-1.5 bg-linear-to-br from-slate-700 to-slate-800 rounded-lg text-accent border border-white/5 shadow-inner">
                        <BarChart3 className="w-[1.25rem] h-[1.25rem]" />
                    </div>
                    <h2 className="text-[1.25rem] font-extrabold text-amber-500 tracking-wide">Laporan Keuangan Masjid</h2>
                </div>

                {/* Cards Container */}
                <div className="grid grid-cols-3 gap-4 w-full mb-5 shrink-0">
                    
                    {/* Pemasukan Card */}
                    <div className="bg-[#151b2b] rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center relative shadow-md">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                            <ArrowUpRight className="w-4 h-4 text-accent" />
                        </div>
                        <p className="font-extrabold text-label uppercase tracking-widest mb-1 transition-all" style={{ fontSize: `calc(0.75rem * var(--scale-label, 1))` }}>Pemasukan</p>
                        <p className="font-mono text-[1.5rem] lg:text-[1.875rem] font-black text-white tracking-tight">
                            {formatCurrency(totalIncome)}
                        </p>
                    </div>

                    {/* Total Kas Card */}
                    <div className={`rounded-2xl p-5 flex flex-col items-center justify-center relative shadow-lg ${isKasNegative ? 'bg-rose-950/20 border border-rose-500/30' : 'bg-primary/20 border border-primary/30 shadow-[0_0_30px_rgba(16,185,129,0.08)]'}`}>
                        <div className="mb-2">
                            <Wallet className="w-7 h-7 text-amber-500" />
                        </div>
                        <p className="font-extrabold text-label uppercase tracking-widest mb-1 transition-all" style={{ fontSize: `calc(0.75rem * var(--scale-label, 1))` }}>Saldo Kas</p>
                        <p className={`font-mono text-[1.5rem] lg:text-[1.875rem] font-black tracking-tight drop-shadow-md ${isKasNegative ? 'text-rose-400' : 'text-white'}`}>
                            {formatCurrency(totalAssets)}
                        </p>
                    </div>

                    {/* Pengeluaran Card */}
                    <div className="bg-[#151b2b] rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center relative shadow-md">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
                            <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                        </div>
                        <p className="font-extrabold text-label uppercase tracking-widest mb-1 transition-all" style={{ fontSize: `calc(0.75rem * var(--scale-label, 1))` }}>Pengeluaran</p>
                        <p className="font-mono text-[1.5rem] lg:text-[1.875rem] font-black text-white tracking-tight">
                            {formatCurrency(totalExpense)}
                        </p>
                    </div>

                </div>

                {/* Table section */}
                <div className="w-full bg-[#151b2b] border border-white/5 rounded-2xl p-5 flex flex-col flex-1 h-full min-h-0">
                    <h3 className="font-extrabold text-label uppercase tracking-widest mb-3 shrink-0 transition-all" style={{ fontSize: `calc(0.85rem * var(--scale-label, 1))` }}>Riwayat Transaksi Terakhir</h3>
                    
                    <div className="w-full flex-1 flex flex-col min-h-0">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-3 pb-2 border-b border-white/10 text-label font-bold shrink-0 transition-all" style={{ fontSize: `calc(0.7rem * var(--scale-label, 1))` }}>
                            <div className="col-span-2">
                                <span className="block opacity-70 mb-0.5 transition-all" style={{ fontSize: `calc(0.5625rem * var(--scale-label, 1))` }}>Bulan</span>
                                Tgl
                            </div>
                            <div className="col-span-6 flex items-end">Keterangan</div>
                            <div className="col-span-4 flex items-end justify-start">Nominal</div>
                        </div>

                        {/* Table Body */}
                        <div className="flex flex-col gap-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                            {recentTransactions?.slice(0, 2).map((tx) => 
                            {
                                const isDebit = tx.type === 'debit';
                                return (
                                    <div key={tx.id} className="grid grid-cols-12 gap-3 py-3 border-b border-white/5 last:border-0 items-center">
                                        <div className="col-span-2 text-[0.875rem] text-white font-bold">
                                            {format(parseISO(tx.date), 'dd MMM', { locale: id })}
                                        </div>
                                        <div className="col-span-6 text-[0.875rem] text-slate-200 truncate pr-3">
                                            {tx.description}
                                        </div>
                                        <div className="col-span-4 text-[0.875rem] font-mono font-bold flex items-center gap-1.5">
                                            {isDebit ? (
                                                <ArrowUp className="w-[1rem] h-[1rem] text-accent shrink-0" />
                                            ) : (
                                                <ArrowDown className="w-[1rem] h-[1rem] text-rose-400 shrink-0" />
                                            )}
                                            <span className="text-white">
                                                {formatCurrency(tx.amount)}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                            {(!recentTransactions || recentTransactions.length === 0) && (
                                <div className="py-8 text-center text-label opacity-60 transition-all" style={{ fontSize: `calc(0.75rem * var(--scale-label, 1))` }}>
                                    Belum ada transaksi bulan ini
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
});

