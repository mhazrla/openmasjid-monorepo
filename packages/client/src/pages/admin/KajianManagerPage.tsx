import { useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Search, Plus, Calendar as CalIcon, User, ImageIcon, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useKajianEvents } from '../../features/kajian/hooks';
import { ActionButton } from '../../components/ui/ActionButton';
import { DataTable } from '../../components/ui/DataTable';
import { KajianFormModal } from '../../features/kajian/components/KajianFormModal';
import { Select } from '../../components/ui/Select';
import { cn, getImageUrl } from '../../lib/utils';
import type { KajianType, KajianEvent } from '../../features/kajian/types'; 

// --- Helper Components ---
const TypeBadge = ({ type }: { type: string }) => 
{
    const colors = 
    {
        kajian_rutin: "bg-blue-50 text-blue-700 border-blue-200", 
        tabligh_akbar: "bg-purple-50 text-purple-700 border-purple-200",
        kajian_tematik: "bg-emerald-50 text-emerald-700 border-emerald-200"
    };

    return (
        <span
            className={cn(
                "px-2 py-0.5 rounded text-xs border capitalize font-medium",
                colors[type as keyof typeof colors] || "bg-slate-50 text-slate-700 border-slate-200"
            )}
        >
            {type.replace(/_/g, ' ')}
        </span>
    );
};

const StatusBadge = ({ status }: { status: boolean }) => (
    <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        status 
            ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
            : "bg-slate-100 text-slate-600 border border-slate-200"
    )}>
        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", status ? "bg-emerald-500" : "bg-slate-400")} />
        {status ? 'Active' : 'Archived'}
    </span>
);

export const KajianManagerPage = () => 
{
    // --- UI State ---
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState<KajianType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKajian, setEditingKajian] = useState<KajianEvent | null>(null);

    // --- Hooks ---
    const { data: events = [], isLoading } = useKajianEvents({
        status: 'all', 
        upcoming: undefined 
    });

    
    // --- Client-Side Filtering ---
    const filteredData = useMemo(() => 
    {
        if (!events) return [];

        return events.filter(event => 
        {
            // 1. Filter by Status
            if (statusFilter === 'active' && !event.status) return false;
            if (statusFilter === 'inactive' && event.status) return false;

            // 2. Filter by Type
            if (typeFilter !== 'all' && event.type !== typeFilter) return false;

            // 3. Filter by Search
            if (searchText) 
            {
                const lowerSearch = searchText.toLowerCase();
                const titleMatch = event.title.toLowerCase().includes(lowerSearch);
                const speakerMatch = event.speaker?.name?.toLowerCase().includes(lowerSearch);
                
                if (!titleMatch && !speakerMatch) return false;
            }

            return true;
        });
    }, [events, statusFilter, typeFilter, searchText]);


    // --- Handlers ---
    const handleOpenCreate = () => 
    {
        setEditingKajian(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (kajian: KajianEvent) => 
    {
        setEditingKajian(kajian);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => 
    {
        setIsModalOpen(false);
        setEditingKajian(null);
    };

    // --- Column Definition ---
    const columnHelper = createColumnHelper<KajianEvent>();

    const columns = useMemo(() => [
        columnHelper.accessor('posterUrl', 
        {
            header: 'Poster',
            cell: info => 
            {
                const poster = info.getValue();
                return poster ? (
                    <img
                        src={getImageUrl(poster)}
                        alt="Poster"
                        className="w-24 h-14 object-cover rounded-md border border-slate-200 aspect-video bg-slate-100"
                    />
                ) : (
                    <div className="w-24 h-14 bg-slate-100 rounded-md flex items-center justify-center text-slate-300 border border-slate-200 aspect-video">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                );
            }
        }),

        columnHelper.accessor('title', 
        {
            header: 'Event Details',
            cell: info => 
            {
                const row = info.row.original;
                return (
                    <div>
                        <div className="font-semibold text-slate-900 text-base">
                            {row.title}
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-500 mt-1 text-sm">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span>{row.speaker?.name || 'Unknown Speaker'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium mt-1 text-sm">
                            <CalIcon className="w-3.5 h-3.5 shrink-0" />
                            {(() => 
                            {
                                const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                                const timeLabel = row.timeMode === 'bada_sholat' && row.badaSholat
                                    ? `Ba'da ${capitalize(row.badaSholat)}`
                                    : row.time || null;

                                if (row.type === 'kajian_rutin') 
                                {
                                    if (row.dayOfWeek !== null && timeLabel) 
                                    {
                                        const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][Number(row.dayOfWeek)] || '';
                                        return `Every ${dayName}, ${timeLabel}`;
                                    }
                                    return 'Recurring';
                                }
                                
                                const dateStr = row.date ? format(new Date(row.date), 'dd MMM yyyy') : '-';
                                return timeLabel ? `${dateStr}, ${timeLabel}` : dateStr;
                            })()}
                        </div>
                    </div>
                );
            }
        }),

        columnHelper.accessor('type', 
        {
            header: 'Type',
            cell: info => <TypeBadge type={info.getValue()} />
        }),

        columnHelper.accessor('status', 
        {
             header: 'Status',
             cell: info => <StatusBadge status={info.getValue()} />
        }),

        columnHelper.display({
            id: 'actions',
            header: () => <div className="text-right px-4">Actions</div>,
            cell: ({ row }) => 
                {

                return (
                    <div className="flex items-center justify-end px-4 gap-2">
                        <ActionButton
                            variant="secondary"
                            size="sm"
                            icon={<Edit className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEdit(row.original)}
                            className="cursor-pointer hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                            title="Edit Event"
                        />

                    </div>
                );
            }
        })
    ], []);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kajian Manager</h1>
                    <p className="text-slate-500">Manage upcoming islamic lectures and events.</p>
                </div>

                <ActionButton
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={handleOpenCreate}
                    className="cursor-pointer hidden md:flex"
                >
                    Add Event
                </ActionButton>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 transition-all">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search event title..." 
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {/* Filter Type (Dropdown) */}
                    {/* Filter Type (Dropdown) */}
                    <div className="w-[180px]">
                        <Select
                            options={[
                                { value: 'all', label: 'All Types' },
                                { value: 'kajian_rutin', label: 'Kajian Rutin' },
                                { value: 'kajian_tematik', label: 'Kajian Tematik' },
                                { value: 'tabligh_akbar', label: 'Tabligh Akbar' }
                            ]}
                            value={typeFilter}
                            onChange={(val) => setTypeFilter(val as any)}
                            placeholder="All Types"
                        />
                    </div>

                    {/* Filter Status */}
                    <div className="flex bg-slate-100 p-1 rounded-lg h-10 shrink-0">
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={cn(
                                "px-3 text-xs font-medium rounded-md transition-all cursor-pointer", 
                                statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            )}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setStatusFilter('inactive')}
                            className={cn(
                                "px-3 text-xs font-medium rounded-md transition-all cursor-pointer", 
                                statusFilter === 'inactive' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            )}
                        >
                            Archived
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={filteredData}
                isLoading={isLoading}
            />

            {/* Mobile FAB for Add Event */}
            <ActionButton 
                onClick={handleOpenCreate}
                variant="primary"
                className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg shadow-emerald-900/40 p-0 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            >
                <Plus className="w-6 h-6" />
            </ActionButton>

            {/* Modal */}
            <KajianFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingKajian={editingKajian}
            />
        </div>
    );
};