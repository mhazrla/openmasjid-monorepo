
import { memo } from 'react';
import { Moon, Sparkles, Quote, HandHeart, Wallet, BarChart3, ArrowUpRight, ArrowDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
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
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-inner' 
                : 'bg-emerald-950/30 text-emerald-600 border-emerald-800/30'
        }`}>
            {active && <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent" />}
            
            <span className={`font-mono font-black leading-none z-10 tracking-tighter ${active ? 'text-5xl drop-shadow-md' : 'text-4xl opacity-80'}`}>
                {qty || 0}
            </span>
            
            <span className={`text-[12px] font-black uppercase z-10 tracking-widest mt-0.5 ${active ? 'text-emerald-100' : 'text-emerald-800'}`}>
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
                ? 'bg-linear-to-r from-emerald-900/80 to-slate-800 border-emerald-400 shadow-[0_0_25px_-5px_rgba(52,211,153,0.3)] z-10 scale-[1.01]' 
                : 'bg-slate-900/40 border-slate-800 opacity-70'
        }`}>
            {isToday && <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-emerald-400 rounded-r-full shadow-[0_0_15px_#34d399]" />}

            {/* DATE */}
            <div className="col-span-2 flex flex-col items-center justify-center border-r-2 border-white/5 h-full py-1">
                <span className={`font-mono font-black leading-none tracking-tighter ${isToday ? 'text-6xl text-white drop-shadow-xl' : 'text-5xl text-slate-500'}`}>
                    {row.ramadanDay}
                </span>
                <span className={`uppercase font-black text-[10px] mt-0.5 tracking-widest ${isToday ? 'text-emerald-300' : 'text-slate-600'}`}>
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
                <span className={`text-[12px] font-black uppercase tracking-widest mt-1 ${isToday ? 'text-cyan-600' : 'text-slate-700'}`}>DUS</span>
            </div>

            <div className="col-span-2 h-full flex flex-col justify-between py-1 pl-2 gap-1">
                {/* Itikaf */}
                <div className="flex-1 flex items-center justify-between bg-slate-800/60 rounded-lg px-2">
                    <span className="text-[12px] font-black text-slate-500 uppercase">ITIKAF</span>
                    <span className={`text-xl font-mono font-black ${row.itikafStatus === 'open' ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {row.itikafQty || 0}
                    </span>
                </div>
                {/* Santunan */}
                <div className="flex-1 flex items-center justify-between bg-slate-800/60 rounded-lg px-2">
                    <span className="text-[12px] font-black text-slate-500 uppercase">SANTUNAN</span>
                    <span className={`text-xl font-mono font-black ${row.charityStatus === 'open' ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {row.charityQty || 0}
                    </span>
                </div>
            </div>
        </div>
    );
});

export const RamadanTableWidget = memo(({ schedules, config, effectiveDate }: { schedules: RamadanScheduleUI[], config?: RamadanConfig, effectiveDate: Date }) => (
    <div className="w-full h-full flex flex-col px-4 pt-2 pb-1 overflow-hidden font-sans bg-slate-950/40 rounded-3xl border border-white/5 backdrop-blur-sm">
        {/* HEADER */}
        <div className="min-h-[50px] flex items-center justify-between mb-2 px-6 bg-slate-900/80 rounded-2xl border border-emerald-500/20 shadow-lg shrink-0">
            <div className="flex items-center gap-3 py-3">
                <div className="p-2 bg-emerald-600/20 rounded-xl text-emerald-400 border border-emerald-500/30">
                    <HandHeart className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none mt-1">{ config?.title }</h2>
                    <span className="text-xs text-emerald-400 font-bold tracking-widest uppercase">{ config?.subtitle }</span>
                </div>
            </div>
        </div>

        {/* TABLE HEADER */}
        <div className="h-[5%] min-h-[25px] grid grid-cols-12 gap-2 px-6 items-center text-xs font-black uppercase tracking-widest text-slate-400 shrink-0">
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
    <div className="flex items-center justify-center w-full h-full animate-in zoom-in duration-700 p-8">
        <div className="relative w-full max-w-6xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[50vh]">
            <div className="w-full md:w-1/3 bg-linear-to-br from-emerald-600 to-emerald-900 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
                <div className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm shadow-lg">
                    <Moon className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white uppercase tracking-widest mb-3">{title}</h2>
                <span className="px-5 py-2 bg-black/20 rounded-full text-emerald-100 text-lg font-mono border border-white/10">
                    {hijriYear} Hijriah
                </span>
            </div>
            <div className="w-full md:w-2/3 p-12 flex flex-col justify-center items-start">
                <div className="flex items-center gap-4 mb-6">
                    <span className="px-4 py-1.5 rounded bg-emerald-500/10 text-emerald-400 text-sm font-bold uppercase tracking-wider border border-emerald-500/20">Malam Ini</span>
                    <span className="text-slate-400 text-lg">Ramadhan Ke-{data.ramadanDay}</span>
                </div>
                <h1 className="text-4xl lg:text-4xl font-bold text-white leading-tight mb-6 font-serif">
                    {data.tarawihImam?.name || data.imam?.name || "Belum Ditentukan"}
                </h1>
                {data.description && (
                    <div className="flex items-start gap-4 bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 w-full">
                        <Sparkles className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                        <p className="text-amber-200 text-xl leading-relaxed">{data.description}</p>
                    </div>
                )}
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
        if (len < 50) return 'text-5xl lg:text-6xl';
        if (len < 150) return 'text-4xl lg:text-5xl';
        if (len < 300) return 'text-3xl lg:text-4xl';
        return 'text-2xl lg:text-3xl';
    };

    const getTextSize = (len: number) => 
    {
        if (len < 100) return 'text-2xl lg:text-3xl';
        if (len < 300) return 'text-xl lg:text-2xl';
        if (len < 600) return 'text-lg lg:text-xl';
        return 'text-base lg:text-lg';
    };

    const arabicLen = data.arabic?.length || 0;
    const textLen = data.text.length;

    return (
        <div className="flex items-center justify-center w-full h-full animate-in slide-in-from-bottom-8 duration-1000 p-2 md:p-6">
            <div className="w-full max-w-[95vw] h-[85vh] flex flex-col items-center justify-center relative z-10 bg-slate-950/60 backdrop-blur-xl p-6 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
                
                {/* Background Ornament - Centered and Subtle */}
                <Quote className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-emerald-500/5 -scale-x-100" />
                <Quote className="absolute top-10 left-10 w-24 h-24 text-emerald-500/10 -scale-x-100" />
                <Quote className="absolute bottom-10 right-10 w-24 h-24 text-emerald-500/10" />

                {/* Main Content Container - Vertical Layout */}
                <div className="z-10 w-full h-full flex flex-col items-center justify-center overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none] space-y-12">
                    
                    {/* Top: Arabic Text */}
                    {data.arabic && (
                        <div className="w-full flex-col flex items-center justify-center text-center px-4 md:px-16">
                            <h1 
                                className={`${getArabicSize(arabicLen)} text-white font-serif leading-loose drop-shadow-lg py-2`} 
                                dir="rtl"
                            >
                                {data.arabic}
                            </h1>
                        </div>
                    )}

                    {/* Bottom: Translation & Source */}
                    <div className="w-full max-w-6xl flex flex-col items-center justify-center text-center px-4 md:px-16">
                        <div className="relative">
                            <p className={`${getTextSize(textLen)} text-slate-200 font-light leading-relaxed italic`}>
                                "{data.text}" 
                                <span className="text-emerald-400 font-bold uppercase tracking-widest text-lg lg:text-xl not-italic ml-3 block md:inline-block mt-4 md:mt-2">
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
    <div className="flex items-center justify-center w-full h-full animate-in zoom-in duration-700 p-8">
        <div className="relative w-full max-w-5xl h-[55vh] min-h-[400px] bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            {/* LEFT / TOP: QRIS - Only show if URL exists */ }
            { data.qrisUrl && (
                <div className="w-full md:w-1/2 bg-white p-8 flex flex-col items-center justify-center relative group">
                    <img 
                        src={data.qrisUrl} 
                        alt="QRIS" 
                        className="w-full h-full object-contain max-h-[400px] z-10 drop-shadow-xl" 
                        loading="lazy"
                    />
                    <div className="absolute top-2 right-2 z-20">
                        <img src="/images/qris-icon.webp" alt="QRIS Logo" className="h-6 md:h-8 opacity-80" loading="lazy" />
                    </div>
                </div>
            )}

            {/* RIGHT / BOTTOM: INFO */}
            <div className={`${data.qrisUrl ? 'w-full md:w-1/2' : 'w-full'} p-10 flex flex-col justify-center bg-linear-to-br from-slate-900 to-black text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-widest mb-6">Infaq / Shodaqoh</h2>

                {/* DIGITAL INFO CARD STYLE */}
                <div className={`relative w-full ${data.qrisUrl ? 'aspect-video' : 'max-w-2xl mx-auto aspect-[2.5/1]'} bg-slate-800/50 rounded-3xl p-8 border border-white/10 flex flex-col justify-center items-start overflow-hidden group backdrop-blur-md`}>
                    
                    {/* Background Decor */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 w-full space-y-6">
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">No. Rekening</p>
                            <div className="flex items-center gap-4">
                                <p className="font-mono text-4xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">
                                    {data.accountNumber || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-px bg-white/10" />

                        <div className="flex flex-col gap-1">
                            <p className="text-2xl font-bold text-emerald-400 tracking-tight">
                                {data.bankName || 'BANK'}
                            </p>
                            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider truncate">
                                a.n {data.bankAccountName || data.mosqueName}
                            </p>
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 opacity-20 transform rotate-12">
                        <HandHeart className="w-32 h-32 text-emerald-500" />
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
        <div className="flex items-center justify-center w-full h-full animate-in zoom-in duration-700 p-4 md:p-6">
            <div className="w-full max-w-6xl h-auto max-h-[64vh] flex flex-col items-start justify-start relative z-10 bg-[#0f1423] p-5 md:p-6 rounded-3xl border border-white/10 shadow-2xl overflow-hidden shrink-0">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-5 shrink-0">
                    <div className="p-1.5 bg-linear-to-br from-slate-700 to-slate-800 rounded-lg text-emerald-400 border border-white/5 shadow-inner">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-amber-500 tracking-wide">Laporan Keuangan Masjid</h2>
                </div>

                {/* Cards Container */}
                <div className="grid grid-cols-3 gap-4 w-full mb-5 shrink-0">
                    
                    {/* Pemasukan Card */}
                    <div className="bg-[#151b2b] rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center relative shadow-md">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pemasukan</p>
                        <p className="font-mono text-2xl lg:text-3xl font-black text-white tracking-tight">
                            {formatCurrency(totalIncome)}
                        </p>
                    </div>

                    {/* Total Kas Card */}
                    <div className={`rounded-2xl p-5 flex flex-col items-center justify-center relative shadow-lg ${isKasNegative ? 'bg-rose-950/20 border border-rose-500/30' : 'bg-emerald-950/20 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.08)]'}`}>
                        <div className="mb-2">
                            <Wallet className="w-7 h-7 text-amber-500" />
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Kas</p>
                        <p className={`font-mono text-2xl lg:text-3xl font-black tracking-tight drop-shadow-md ${isKasNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {formatCurrency(totalAssets)}
                        </p>
                    </div>

                    {/* Pengeluaran Card */}
                    <div className="bg-[#151b2b] rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center relative shadow-md">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
                            <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pengeluaran</p>
                        <p className="font-mono text-2xl lg:text-3xl font-black text-white tracking-tight">
                            {formatCurrency(totalExpense)}
                        </p>
                    </div>

                </div>

                {/* Table section */}
                <div className="w-full bg-[#151b2b] border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col flex-1 min-h-[0]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 shrink-0">Riwayat Transaksi Terakhir</h3>
                    
                    <div className="w-full flex-1 flex flex-col min-h-0">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-3 pb-2 border-b border-white/10 text-[11px] text-slate-400 font-medium shrink-0">
                            <div className="col-span-2">
                                <span className="block text-[9px] opacity-70 mb-0.5">Bulan</span>
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
                                        <div className="col-span-2 text-sm text-white font-medium">
                                            {format(parseISO(tx.date), 'dd MMM', { locale: id })}
                                        </div>
                                        <div className="col-span-6 text-sm text-slate-200 truncate pr-3">
                                            {tx.description}
                                        </div>
                                        <div className="col-span-4 text-sm font-mono font-medium flex items-center gap-1.5">
                                            {isDebit ? (
                                                <ArrowUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                            ) : (
                                                <ArrowDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                            )}
                                            <span className="text-white">
                                                {formatCurrency(tx.amount)}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                            {(!recentTransactions || recentTransactions.length === 0) && (
                                <div className="py-8 text-center text-slate-500 text-xs">
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

