// Removed unused Link import
import { ArrowLeft, Wallet, Building2, Heart, Moon, Coins, Landmark, Calendar, Search } from 'lucide-react';
import { useFinanceSummary, useRecentTransactions } from '../hooks/useFinance';
import type { Transaction } from '../types/finance.types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const formatIDR = (amount: number) => 
{
    const val = amount || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

export const FinanceReportPage = () => 
{
    const { data: summary, isLoading: isLoadingSummary } = useFinanceSummary();
    const { data: txResponse, isLoading: isLoadingTx } = useRecentTransactions(10);

    const transactions = txResponse?.data || [];

    const getFundCategoryDetails = (category: string) => 
     {
        switch (category) 
        {
            case 'operasional': return { label: 'Operasional', icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
            case 'yatim': return { label: 'Yatim & Dhuafa', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' };
            case 'pembangunan': return { label: 'Pembangunan', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' };
            case 'ramadhan': return { label: 'Ramadhan', icon: Moon, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
            default: return { label: 'Umum', icon: Wallet, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Transparansi Keuangan</h1>
                        <p className="text-slate-500 mt-2 text-lg">Laporan mutasi kas bulanan dan posisi saldo real-time.</p>
                    </div>
                </div>

                <div className="space-y-8 sm:space-y-10">
                
                <section>
                    <div className="mb-6 border-l-4 border-emerald-500 pl-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Breakdown Hak Dana</h2>
                        <p className="text-slate-500 mt-1">Pembagian saldo berdasarkan peruntukan dana umat</p>
                    </div>

                    {isLoadingSummary ? (
                        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {['operasional', 'yatim', 'pembangunan', 'ramadhan'].map((cat) => 
                            {
                                const details = getFundCategoryDetails(cat);
                                const Icon = details.icon;
                                const balance = summary?.fundBalances?.[cat as keyof typeof summary.fundBalances] || 0;
                                
                                return (
                                    <div key={cat} className={`bg-white rounded-2xl p-5 border shadow-sm ${details.border} hover:shadow-md transition-shadow`}>
                                        <div className="flex items-start justify-between">
                                            <div className={`p-3 rounded-xl ${details.bg} ${details.color} shrink-0`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-widest">{details.label}</p>
                                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{formatIDR(balance)}</h3>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section>
                    <div className="mb-6 border-l-4 border-slate-400 pl-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Posisi Fisik Kas</h2>
                        <p className="text-slate-500 mt-1">Lokasi penyimpanan fisik dana saat ini</p>
                    </div>

                    {isLoadingSummary ? (
                         <div className="h-28 bg-slate-200 animate-pulse rounded-2xl w-full max-w-2xl"></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                             <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                                <Landmark className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium mb-1">Saldo Bank Syariah (BSI)</p>
                                        <h3 className="text-2xl font-bold">{formatIDR(summary?.accountBalances?.bsi || 0)}</h3>
                                    </div>
                                </div>
                             </div>

                             <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                                <Coins className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-100" />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium mb-1">Kas Tunai (Kotak Amal)</p>
                                        <h3 className="text-2xl font-bold text-slate-900">{formatIDR(summary?.accountBalances?.cash || 0)}</h3>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                </section>

                <section>
                    <div className="mb-6 border-l-4 border-amber-500 pl-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Riwayat Transaksi</h2>
                            <p className="text-slate-500 mt-1">30 Mutasi terakhir arus kas masuk dan keluar</p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        {isLoadingTx ? (
                            <div className="p-8 text-center text-slate-500">
                                <Search className="w-8 h-8 mx-auto animate-spin mb-3 text-emerald-500" />
                                Memuat data transaksi...
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-1">Belum Ada Transaksi</h3>
                                <p className="text-slate-500">Data mutasi keuangan akan muncul di sini.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {transactions.map((tx: Transaction) => 
                                {
                                    const isIncome = tx.type === 'income';
                                    const categoryInfo = getFundCategoryDetails(tx.fundCategory);
                                    
                                    return (
                                        <div key={tx.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 sm:mt-0 p-2 sm:p-3 rounded-full shrink-0 ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                    <ArrowLeft className={`w-5 h-5 sm:w-6 sm:h-6 ${isIncome ? 'rotate-[-45deg]' : 'rotate-[135deg]'}`} />
                                                </div>
                                                <div>
                                                    <h4 className="text-base sm:text-lg font-bold text-slate-900">{tx.description}</h4>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            {format(new Date(tx.date), 'dd MMM yyyy', { locale: id })}
                                                        </span>
                                                        <span className="hidden sm:inline text-slate-300">•</span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${categoryInfo.bg} ${categoryInfo.color}`}>
                                                            {categoryInfo.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className={`text-left sm:text-right font-bold text-lg sm:text-xl shrink-0 ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {isIncome ? '+' : '-'}{formatIDR(tx.amount)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
                </div>
            </div>
        </div>
    );
};
