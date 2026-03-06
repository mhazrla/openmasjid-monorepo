import { useState, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Trash2, Pencil, MoreVertical, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTransactions, useAccounts, useDeleteTransaction, useFinanceSummaryData } from '../../features/finance/hooks';
import { cn } from '../../lib/utils';
import { ActionButton } from '../../components/ui/ActionButton';
import { DataTable } from '../../components/ui/DataTable';
import { TransactionFormModal } from '../../features/finance/components/TransactionFormModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
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
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0, openUp: false });
    const menuTriggerRef = useRef<Record<number, HTMLDivElement | null>>({});
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

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
    const pagination = queryResult?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 };
    
    const { data: summaryData } = useFinanceSummaryData();
    const summary = summaryData || { 
        totalBalance: 0, monthlyIncome: 0, monthlyExpense: 0,
        fundBalances: {} as Record<string, number>, 
        accountBalances: {} as Record<string, number>
    };
    
    const { totalBalance, monthlyIncome, monthlyExpense, fundBalances, accountBalances } = summary;

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
        setTransactionToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // --- Positioning for Portal Action Menu ---
    const updateMenuPos = useCallback(() => 
    {
        if (activeMenu !== null && menuTriggerRef.current[activeMenu]) 
        {
            const rect = menuTriggerRef.current[activeMenu]!.getBoundingClientRect();
            const menuH = 110; // approx height of edit+delete menu
            const spaceBelow = window.innerHeight - rect.bottom;
            const openUp = spaceBelow < menuH && rect.top > menuH;

            setMenuPos({
                top: openUp ? rect.top + window.scrollY - menuH - 4 : rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 144, // w-36 = 144px, align right
                openUp,
            });
        }
    }, [activeMenu]);

    useLayoutEffect(() => 
    {
        if (activeMenu === null) return;
        updateMenuPos();
        window.addEventListener('scroll', updateMenuPos, true);
        window.addEventListener('resize', updateMenuPos);
        return () => 
        {
            window.removeEventListener('scroll', updateMenuPos, true);
            window.removeEventListener('resize', updateMenuPos);
        };
    }, [activeMenu, updateMenuPos]);

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
        columnHelper.accessor('fundCategory', 
        {
            header: 'Fund Category',
            cell: info => 
            {
                const map: Record<string, string> = 
                {
                    operasional: 'Operasional',
                    yatim: 'Yatim & Dhuafa',
                    pembangunan: 'Pembangunan',
                    ramadhan: 'Ramadhan'
                };
                return (
                    <div>
                        <span className="px-2 py-0.5 rounded text-xs border border-slate-200 bg-slate-50 text-slate-700 font-medium">
                            {map[info.getValue()] || info.getValue()}
                        </span>
                        <div className="text-xs text-slate-400 mt-1">{info.row.original.account?.name}</div>
                    </div>
                )
            },
        }),
        columnHelper.accessor('description', 
        {
            header: 'Description',
            cell: info => <div className="text-sm max-w-[200px] lg:max-w-md">{info.getValue()}</div>,
        }),
        columnHelper.accessor(row => row.type === 'income' ? row.amount : 0, 
        {
            id: 'income',
            header: () => <div className="text-right">Income</div>,
            cell: info => 
            {
                const val = info.getValue() as number;
                return <div className="text-right text-emerald-600 font-medium">{val > 0 ? formatCurrency(val) : '-'}</div>;
            },
        }),
        columnHelper.accessor(row => row.type === 'expense' ? row.amount : 0, 
        {
            id: 'expense',
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

            {/* Grand Total & Accounts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-linear-to-br from-emerald-600 to-emerald-800 rounded-xl p-6 flex flex-col justify-between shadow-md text-white border border-emerald-500/30 min-h-[140px]">
                    <div>
                        <h2 className="text-sm md:text-base font-semibold mb-1 opacity-90">Total Master Balance</h2>
                        <p className="text-2xl md:text-4xl font-bold tracking-tight">{formatCurrency(totalBalance)}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center min-h-[140px]">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kas Bank BSI</p>
                    <p className="text-xl md:text-3xl font-bold text-slate-800">{formatCurrency(accountBalances?.bsi || 0)}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center min-h-[140px]">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kas Tunai (Cash)</p>
                    <p className="text-xl md:text-3xl font-bold text-slate-800">{formatCurrency(accountBalances?.cash || 0)}</p>
                </div>
            </div>

            {/* Fund Categories Breakdown */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Operasional</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(fundBalances?.operasional || 0)}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Yatim & Dhuafa</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(fundBalances?.yatim || 0)}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Pembangunan</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(fundBalances?.pembangunan || 0)}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Prog. Ramadhan</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(fundBalances?.ramadhan || 0)}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="p-4 flex justify-between md:block items-center">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider md:mb-1">Monthly Income (All Accounts)</p>
                        <p className="text-lg md:text-2xl font-semibold text-emerald-600">{formatCurrency(monthlyIncome)}</p>
                    </div>
                    <div className="p-4 flex justify-between md:block items-center">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider md:mb-1">Monthly Expense (All Accounts)</p>
                        <p className="text-lg md:text-2xl font-semibold text-rose-600">{formatCurrency(monthlyExpense)}</p>
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
                                                    <p className="text-[12px] text-slate-400 mt-0.5 truncate">{tx.fundCategory} &bull; {tx.account?.name}</p>
                                                </div>
                                                <div className="flex items-center gap-2 pl-2">
                                                    <div className={cn(
                                                        "font-bold text-[14px] whitespace-nowrap",
                                                        tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                                                    )}>
                                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                    </div>
                                                    <div 
                                                        ref={(el) => { menuTriggerRef.current[tx.id] = el; }}
                                                        className="p-1"
                                                    >
                                                        <MoreVertical className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Portal-based Action Menu for Mobile */}
            {activeMenu !== null && createPortal(
                <>
                    <div className="fixed inset-0 z-199" onClick={() => setActiveMenu(null)} />
                    <div 
                        className="absolute z-200 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                        style={{
                            top: menuPos.top,
                            left: menuPos.left,
                        }}
                    >
                        <button 
                            onClick={(e) => 
                            { 
                                e.stopPropagation(); 
                                const tx = transactions.find((t: Transaction) => t.id === activeMenu);
                                if (tx) handleOpenEdit(tx);
                                setActiveMenu(null); 
                            }} 
                            className="w-full text-left px-4 py-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                            <Pencil className="w-4 h-4 text-slate-400" /> Edit
                        </button>
                        <div className="h-px bg-slate-100 my-0.5" />
                        <button 
                            onClick={(e) => 
                            { 
                                e.stopPropagation(); 
                                handleDelete(activeMenu); 
                                setActiveMenu(null); 
                            }} 
                            className="w-full text-left px-4 py-3 text-[13px] font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4 text-rose-500" /> Delete
                        </button>
                    </div>
                </>,
                document.body
            )}
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

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => 
                {
                    if (transactionToDelete !== null) 
                    {
                        deleteMutation.mutate(transactionToDelete);
                    }
                }}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction? The balance will be returned automatically."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};
