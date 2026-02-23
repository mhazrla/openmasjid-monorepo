import { useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { useShortlinks, useDeleteShortlink } from '../../features/shortlink/hooks';
import { Plus, Trash2, ExternalLink, Copy, Search, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { ActionButton } from '../../components/ui/ActionButton'; 
import { DataTable } from '../../components/ui/DataTable';
import { ShortlinkFormModal } from '../../features/shortlink/components/ShortlinkFormModal';
import type { Shortlink } from '../../features/shortlink/types';

export const ShortlinkPage = () => 
{
    const [searchText, setSearchText] = useState('');
    const { data: shortlinks = [], isLoading } = useShortlinks();
    const deleteMutation = useDeleteShortlink();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShortlink, setEditingShortlink] = useState<Shortlink | null>(null);

    const filteredData = useMemo(() => 
    {
        if (!searchText) return shortlinks;
        const lower = searchText.toLowerCase();
        return shortlinks.filter(link => 
            link.slug.toLowerCase().includes(lower) || 
            link.originalUrl.toLowerCase().includes(lower) ||
            (link.description && link.description.toLowerCase().includes(lower))
        );
    }, [shortlinks, searchText]);

    const handleOpenCreate = () => 
    {
        setEditingShortlink(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (shortlink: Shortlink) => 
    {
        setEditingShortlink(shortlink);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => 
    {
        setIsModalOpen(false);
        setEditingShortlink(null);
    };

    const onDelete = (id: number) => 
    {
        if (confirm('Are you sure you want to delete this shortlink?')) 
        {
            deleteMutation.mutate(id, 
            {
                onSuccess: () => toast.success('Shortlink deleted.'),
                onError: () => toast.error('Failed to delete shortlink.'),
            });
        }
    };

    const copyToClipboard = (slug: string) => 
    {
        const apiConfigUrl  = import.meta.env.VITE_API_URL;
        let baseUrl = '';
        try 
        {
            const urlObj = new URL(apiConfigUrl);
            baseUrl = urlObj.origin; 
        } 
        catch (e) 
        {
            baseUrl = window.location.origin; 
        }
        
        const finalUrl = `${baseUrl}/s/${slug}`;
        navigator.clipboard.writeText(finalUrl);
        toast.success('Shortlink copied to clipboard');
    };

    // --- Column Definition ---
    const columnHelper = createColumnHelper<Shortlink>();

    const columns = useMemo(() => [
        columnHelper.accessor('slug', 
        {
            header: 'Slug',
            cell: info => (
                <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-mono font-medium border border-emerald-100">
                        /{info.getValue()}
                    </span>
                    <ActionButton 
                        variant="ghost" 
                        size="sm"
                        className="p-1.5 h-auto text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" 
                        icon={<Copy className="w-3 h-3" />} 
                        onClick={() => copyToClipboard(info.getValue())} 
                        title="Copy Link"
                    />
                </div>
            )
        }),
        columnHelper.accessor('originalUrl', 
        {
            header: 'Original URL',
            cell: info => 
            {
                const url = info.getValue();
                const description = info.row.original.description;
                return (
                    <div className="max-w-md">
                        <a 
                            href={url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 hover:underline truncate"
                        >
                            <span className="truncate">{url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                        </a>
                        {description && (
                            <div className="text-xs text-slate-400 mt-1 truncate">{description}</div>
                        )}
                    </div>
                );
            }
        }),
        columnHelper.accessor('clicks', 
        {
            header: () => <div className="text-center">Clicks</div>,
            cell: info => (
                <div className="text-center font-mono text-slate-600 bg-slate-50 rounded px-2 py-1 inline-block border border-slate-100 text-xs">
                    {info.getValue()}
                </div>
            )
        }),
        columnHelper.display({
            id: 'actions',
            header: () => <div className="text-right px-4">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end px-4 gap-2">
                    <ActionButton 
                        variant="secondary" 
                        size="sm"
                        className="p-2" 
                        icon={<Edit className="w-3.5 h-3.5" />} 
                        onClick={() => handleOpenEdit(row.original)} 
                        title="Edit Shortlink"
                    />
                    <ActionButton 
                        variant="danger" 
                        size="sm"
                        className="p-2" 
                        icon={<Trash2 className="w-3.5 h-3.5" />} 
                        onClick={() => onDelete(row.original.id)} 
                        title="Delete Shortlink"
                    />
                </div>
            )
        })
    ], []);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Shortlinks</h1>
                    <p className="text-slate-500">Manage QR Code redirects and short URLs.</p>
                </div>
                <ActionButton 
                    variant="primary" 
                    icon={<Plus className="w-4 h-4" />} 
                    onClick={handleOpenCreate}
                    className="hidden md:flex"
                >
                    Add New
                </ActionButton>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 transition-all">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search by slug or URL..." 
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={filteredData}
                isLoading={isLoading}
            />

            {/* Mobile FAB for Add Shortlink */}
            <ActionButton 
                onClick={handleOpenCreate}
                variant="primary"
                className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg shadow-emerald-900/40 p-0 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            >
                <Plus className="w-6 h-6" />
            </ActionButton>

            <ShortlinkFormModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                editingShortlink={editingShortlink}
            />
        </div>
    );
};