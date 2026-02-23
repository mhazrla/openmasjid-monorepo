import { useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Trash2, Pencil, MoreVertical, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTransactions, useAccounts, useDeleteTransaction } from '../../features/finance/hooks';
import { cn } from '../../lib/utils';
import { ActionButton } from '../../components/ui/ActionButton';
import { DataTable } from '../../components/ui/DataTable';
import { TransactionFormModal } from '../../features/finance/components/TransactionFormModal';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import type { Transaction, Account } from '../../features/finance/types';

const formatCurrency = (amount: number) => 
{
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string) => 
{
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

export const FinanceManagerPage = () => 
{
    // --- UI State (Filters) ---
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];
    
    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(today);
    const [accountId, setAccountId] = useState<number | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    // --- Hooks ---
    const { data: accounts = [] } = useAccounts();
    const deleteMutation = useDeleteTransaction();
    
    const { data: queryResult, isLoading, isFetching } = useTransactions({
        startDate: startDate ? `${startDate}T00:00:00` : undefined,
        endDate: endDate ? `${endDate}T23:59:59` : undefined,
        accountId: accountId,
        page: page,
        limit: 20
    });

    const transactions = queryResult?.data || [];
    const summary = queryResult?.summary || { totalDebit: 0, totalCredit: 0 };
    const pagination = queryResult?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 };
    const { totalDebit, totalCredit } = summary;
    const saldoAkhir = totalDebit - totalCredit;

    // Total Kekayaan Masjid (Sum of all account balances)
    const totalKekayaan = useMemo(() => 
    {
        return accounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0);
    }, [accounts]);

    // Group transactions by Date for mobile view
    const groupedTransactions = useMemo(() => 
    {
        const groups: Record<string, Transaction[]> = {};
        transactions.forEach((tx: Transaction) => 
        {
            const dateKey = new Date(tx.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(tx);
        });
        return groups;
    }, [transactions]);

    // --- Handlers ---
    const handleOpenCreate = () => 
    {
        setEditingTx(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (tx: Transaction) => 
    {
        setEditingTx(tx);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => 
    {
        setIsModalOpen(false);
        setEditingTx(null);
    };

    const handleDelete = (id: number) => 
    {
        if (window.confirm('Yakin ingin menghapus transaksi ini? Saldo terkait akan otomatis dikembalikan.')) 
        {
            deleteMutation.mutate(id);
        }
    };

    // --- Column Definition ---
    const columnHelper = createColumnHelper<Transaction>();

    const columns = useMemo(() => [
        columnHelper.display({
            id: 'no',
            header: 'No',
            cell: info => <div className="text-slate-500 w-8">{info.row.index + 1}</div>,
        }),
        columnHelper.accessor('date', 
        {
            header: 'Date',
            cell: info => <div className="text-sm font-medium whitespace-nowrap">{formatDate(info.getValue())}</div>,
        }),
        columnHelper.accessor('categoryId', 
        {
            header: 'Category',
            cell: info => (
                <div>
                    <span className="px-2 py-0.5 rounded text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium">
                        {info.row.original.category?.name || '-'}
                    </span>
                    <div className="text-xs text-slate-400 mt-1">{info.row.original.account?.name}</div>
                </div>
            ),
        }),
        columnHelper.accessor('description', 
        {
            header: 'Description',
            cell: info => <div className="text-sm max-w-[200px] lg:max-w-md">{info.getValue()}</div>,
        }),
        columnHelper.accessor(row => row.type === 'debit' ? row.amount : 0, 
        {
            id: 'debit',
            header: () => <div className="text-right">Income</div>,
            cell: info => 
            {
                const val = info.getValue() as number;
                return <div className="text-right text-emerald-600 font-medium">{val > 0 ? formatCurrency(val) : '-'}</div>;
            },
        }),
        columnHelper.accessor(row => row.type === 'credit' ? row.amount : 0, 
        {
            id: 'credit',
            header: () => <div className="text-right">Expense</div>,
            cell: info => 
            {
                const val = info.getValue() as number;
                return <div className="text-right text-rose-600 font-medium">{val > 0 ? formatCurrency(val) : '-'}</div>;
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: () => <div className="text-right px-4">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end px-2 gap-2">
                    <ActionButton 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleOpenEdit(row.original)}
                        icon={<Pencil className="w-3.5 h-3.5" />}
                        title="Edit Transaction"
                        className="cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-colors"
                    />
                    <ActionButton 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleDelete(row.original.id)}
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        title="Delete Transaction"
                        className="cursor-pointer hover:border-rose-500 hover:text-rose-600 transition-colors"
                    />
                </div>
            ),
        }),
    ], [deleteMutation]);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Financial Report</h1>
                    <p className="text-slate-500">Manual income and expense recording.</p>
                </div>
                <ActionButton 
                    variant="primary" 
                    icon={<Plus className="w-4 h-4" />} 
                    onClick={handleOpenCreate}
                    className="cursor-pointer hidden md:flex"
                >
                    Add Transaction
                </ActionButton>
            </div>

            {/* Grand Total */}
            <div className="bg-linear-to-br from-emerald-600 to-emerald-800 rounded-xl p-4 md:p-8 flex items-center justify-between shadow-md text-white border border-emerald-500/30">
                <div>
                    <h2 className="text-base md:text-2xl font-bold mb-0.5 md:mb-1">Total Assets</h2>
                    <p className="text-emerald-100/80 text-[10px] md:text-base leading-tight">Master Balance</p>
                </div>
                <div className="text-right">
                    <p className="text-xl md:text-4xl font-bold tracking-tight">{formatCurrency(totalKekayaan)}</p>
                </div>
            </div>

            {/* Filter & Summary Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-end">
                    
                    <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
                        <div className="w-full sm:w-[200px]">
                            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Start Date</label>
                            <Input 
                                type="date" 
                                value={startDate}
                                max={endDate || undefined}
                                onChange={(e) => 
                                { 
                                    const val = e.target.value;
                                    if (val && endDate && val > endDate) 
                                    {
                                        toast.error("Start Date cannot be after End Date");
                                        setStartDate(endDate);
                                    } 
                                    else 
                                    {
                                        setStartDate(val); 
                                    }
                                    setPage(1); 
                                }}
                            />
                        </div>
                        <div className="w-full sm:w-[200px]">
                            <label className="text-xs font-medium text-slate-500 mb-1.5 block">End Date</label>
                            <Input 
                                type="date" 
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(e) => 
                                { 
                                    const val = e.target.value;
                                    if (val && startDate && val < startDate) 
                                    {
                                        toast.error("End Date cannot be before Start Date");
                                        setEndDate(startDate);
                                    } 
                                    else 
                                    {
                                        setEndDate(val); 
                                    }
                                    setPage(1); 
                                }}
                            />
                        </div>
                        <div className="w-full sm:w-[220px]">
                            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Account Filter</label>
                            <Select
                                options={[
                                    { value: '', label: 'All Accounts' },
                                    ...accounts.map((a: Account) => ({ value: a.id.toString(), label: a.name }))
                                ]}
                                value={accountId?.toString() || ''}
                                onChange={(val) => 
                                { setAccountId(val ? Number(val) : undefined); setPage(1); }}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="p-4 flex justify-between md:block items-center">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider md:mb-1">Total Income</p>
                        <p className="text-lg md:text-2xl font-semibold text-emerald-600">{formatCurrency(totalDebit)}</p>
                    </div>
                    <div className="p-4 flex justify-between md:block items-center">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider md:mb-1">Total Expense</p>
                        <p className="text-lg md:text-2xl font-semibold text-rose-600">{formatCurrency(totalCredit)}</p>
                    </div>
                    <div className="p-4 bg-slate-50/50 flex justify-between md:block items-center">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider md:mb-1">Period Balance</p>
                        <p className={cn("text-lg md:text-2xl font-semibold", saldoAkhir < 0 ? "text-rose-600" : "text-slate-900")}>
                            {formatCurrency(saldoAkhir)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Table / Mobile Compact List */}
            <div className="md:hidden flex flex-col  relative">
                {isFetching && (
                    <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    </div>
                )}
                
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500">Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">No transactions found.</div>
                ) : (
                    <div className="bg-white border border-slate-200 divide-y divide-slate-100 rounded-xl overflow-hidden shadow-sm">
                        {Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
                            <div key={dateLabel}>
                                {/* Sticky Date Header */}
                                <div className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-md px-4 py-2 border-b border-slate-200 shadow-sm">
                                    <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{dateLabel}</h3>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {txs.map((tx: Transaction) => (
                                        <div key={tx.id} className="relative bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors">
                                            <div 
                                                className="px-4 py-2.5 flex items-center justify-between cursor-pointer"
                                                onClick={() => setActiveMenu(activeMenu === tx.id ? null : tx.id)}
                                            >
                                                <div className="flex-1 min-w-0 pr-3">
                                                    <p className="text-[14px] font-bold text-slate-800 truncate">{tx.description}</p>
                                                    <p className="text-[12px] text-slate-400 mt-0.5 truncate">{tx.category?.name || '-'} &bull; {tx.account?.name}</p>
                                                </div>
                                                <div className="flex items-center gap-2 pl-2">
                                                    <div className={cn(
                                                        "font-bold text-[14px] whitespace-nowrap",
                                                        tx.type === 'debit' ? "text-emerald-600" : "text-rose-600"
                                                    )}>
                                                        {tx.type === 'debit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                    </div>
                                                    <MoreVertical className="w-4 h-4 text-slate-300" />
                                                </div>
                                            </div>
                                            
                                            {/* Action Menu Dropdown */}
                                            {activeMenu === tx.id && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={(e) => 
                                                    { e.stopPropagation(); setActiveMenu(null); }}></div>
                                                    <div className="absolute right-4 top-10 z-50 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 overflow-hidden animate-in fade-in zoom-in duration-150">
                                                        <button 
                                                            onClick={(e) => 
                                                            { e.stopPropagation(); handleOpenEdit(tx); setActiveMenu(null); }} 
                                                            className="w-full text-left px-4 py-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                                        >
                                                            <Pencil className="w-4 h-4 text-slate-400" /> Edit
                                                        </button>
                                                        <div className="h-px bg-slate-100 my-0.5"></div>
                                                        <button 
                                                            onClick={(e) => 
                                                            { e.stopPropagation(); handleDelete(tx.id); setActiveMenu(null); }} 
                                                            className="w-full text-left px-4 py-3 text-[13px] font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-rose-500" /> Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="hidden md:block relative">
                {isFetching && (
                    <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                )}
                <DataTable 
                    columns={columns} 
                    data={transactions} 
                    isLoading={isLoading} 
                />
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border border-slate-200 bg-white px-4 py-3 sm:px-6 mx-4 sm:mx-0 rounded-xl shadow-sm">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button 
                            onClick={() => setPage((p: number) => Math.max(1, p - 1))} 
                            disabled={page === 1} 
                            className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <p className="text-sm text-slate-500 flex items-center justify-center font-medium">Page {pagination.page}/{pagination.totalPages}</p>
                        <button 
                            onClick={() => setPage((p: number) => Math.min(pagination.totalPages, p + 1))} 
                            disabled={page === pagination.totalPages} 
                            className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-700">Page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span></p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button 
                                    onClick={() => setPage((p: number) => Math.max(1, p - 1))} 
                                    disabled={page === 1} 
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button 
                                    onClick={() => setPage((p: number) => Math.min(pagination.totalPages, p + 1))} 
                                    disabled={page === pagination.totalPages} 
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile FAB for Add Transaction */}
            <ActionButton 
                onClick={handleOpenCreate}
                variant="primary"
                className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg shadow-emerald-900/40 p-0 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            >
                <Plus className="w-6 h-6" />
            </ActionButton>

            {/* Modal */}
            <TransactionFormModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                editingTx={editingTx} 
            />
        </div>
    );
};
