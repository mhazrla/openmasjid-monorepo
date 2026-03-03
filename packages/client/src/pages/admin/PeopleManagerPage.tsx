import { useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Search, Plus, Phone, MapPin, Edit } from 'lucide-react';
import { usePeople } from '../../features/people/hooks';
import { cn } from '../../lib/utils';
import { ActionButton } from '../../components/ui/ActionButton';
import { DataTable } from '../../components/ui/DataTable';
import { PeopleFormModal } from '../../features/people/components/PeopleFormModal';
import { Select } from '../../components/ui/Select';
import type { Person, PersonType } from '../../features/people/types';

// --- Helper Components ---
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

const RoleBadge = ({ type }: { type: PersonType }) => 
{
    const colors = 
    {
        ustadz: "bg-emerald-50 text-emerald-700 border-emerald-200",
        pengurus: "bg-blue-50 text-blue-700 border-blue-200",
        jamaah: "bg-slate-50 text-slate-700 border-slate-200"
    };
    return (
        <span className={cn("px-2 py-0.5 rounded text-xs border capitalize font-medium", colors[type])}>
            {type}
        </span>
    );
};

export const PeopleManagerPage = () => 
{
    // --- UI State ---
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState<PersonType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);

    // --- Hooks ---
    const { data: people = [], isLoading } = usePeople({ 
        status: 'all',
        limit: 0
    });


    // --- Client-Side Filtering ---
    const filteredData = useMemo(() => 
    {
        if (!people) return [];

        return people.filter((person: any) => 
        {
            // 1. Filter by Status
            if (statusFilter === 'active' && !person.status) return false;
            if (statusFilter === 'inactive' && person.status) return false;

            // 2. Filter by Type
            if (typeFilter !== 'all' && person.type !== typeFilter) return false;

            // 3. Filter by Search
            if (searchText) 
            {
                const lowerSearch = searchText.toLowerCase();
                const nameMatch = person.name.toLowerCase().includes(lowerSearch);
                const addressMatch = person.address?.toLowerCase().includes(lowerSearch);
                const phoneMatch = person.phoneNumber?.includes(lowerSearch);
                
                if (!nameMatch && !addressMatch && !phoneMatch) return false;
            }

            return true;
        });
    }, [people, statusFilter, typeFilter, searchText]);


    // --- Handlers ---
    const handleOpenCreate = () => 
    {
        setEditingPerson(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (person: Person) => 
    {
        setEditingPerson(person);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => 
    {
        setIsModalOpen(false);
        setEditingPerson(null);
    };

    // --- Column Definition ---
    const columnHelper = createColumnHelper<Person>();

    const columns = useMemo(() => [
        columnHelper.accessor('name', 
        {
            header: 'Name & Role',
            cell: info => (
                <div>
                    <div className="font-semibold text-slate-900 text-base">{info.getValue()}</div>
                    <div className="mt-1.5"><RoleBadge type={info.row.original.type} /></div>
                </div>
            ),
        }),
        columnHelper.accessor('phoneNumber', 
        {
            header: 'Contact',
            cell: info => 
            {
                const { phoneNumber, address } = info.row.original;
                return (
                    <div className="flex flex-col gap-1.5 text-slate-500">
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className={!phoneNumber ? "text-slate-300 italic" : ""}>
                                {phoneNumber || '-'}
                            </span>
                        </div>
                        {address && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[200px]" title={address}>
                                    {address}
                                </span>
                            </div>
                        )}
                    </div>
                );
            }
        }),
        columnHelper.accessor('status', 
        {
            header: 'Status',
            cell: info => <StatusBadge status={info.getValue()} />,
        }),
        columnHelper.display({
            id: 'actions',
            header: () => <div className="text-right px-4">Actions</div>,
            cell: ({ row }) => {

                return (
                    <div className="flex items-center justify-end px-4 gap-2">
                        <ActionButton 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleOpenEdit(row.original)}
                            icon={<Edit className="w-3.5 h-3.5" />}
                            title="Edit Data"
                            className="cursor-pointer hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                        />

                    </div>
                );
            },
        }),
    ], []);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">People Management</h1>
                    <p className="text-slate-500">Manage Jamaah, Ustadz, and Staff data.</p>
                </div>
                <ActionButton 
                    variant="primary" 
                    icon={<Plus className="w-4 h-4" />} 
                    onClick={handleOpenCreate}
                    className="cursor-pointer hidden md:flex"
                >
                    Add Person
                </ActionButton>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 transition-all">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search by name..." 
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {/* Filter Type (Dropdown) */}
                    <div className="w-[180px]">
                        <Select
                            options={[
                                { value: 'all', label: 'All Roles' },
                                { value: 'jamaah', label: 'Jamaah' },
                                { value: 'ustadz', label: 'Ustadz' },
                                { value: 'pengurus', label: 'Staff' }
                            ]}
                            value={typeFilter}
                            onChange={(val) => setTypeFilter(val as any)}
                            placeholder="All Roles"
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

            {/* Mobile FAB for Add Person */}
            <ActionButton 
                onClick={handleOpenCreate}
                variant="primary"
                className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg shadow-emerald-900/40 p-0 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            >
                <Plus className="w-6 h-6" />
            </ActionButton>

            {/* Modal*/}
            <PeopleFormModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                editingPerson={editingPerson} 
            />
        </div>
    );
};