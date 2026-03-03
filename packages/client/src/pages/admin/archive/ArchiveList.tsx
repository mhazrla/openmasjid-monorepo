import { useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, ImageIcon, Edit, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAdminAlbums, useDeleteAlbum } from '../../../features/archive/hooks';
import { ActionButton } from '../../../components/ui/ActionButton';
import { DataTable } from '../../../components/ui/DataTable';
import { ArchiveFormModal } from '../../../features/archive/components/ArchiveFormModal';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { getImageUrl } from '../../../lib/utils';
import type { ArchiveAlbum } from '../../../features/archive/types'; 

export const ArchiveList = () => 
{
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState<ArchiveAlbum | undefined>(undefined);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [albumToDelete, setAlbumToDelete] = useState<ArchiveAlbum | null>(null);

    const { data: albums = [], isLoading } = useAdminAlbums();
    const { mutate: deleteAlbum } = useDeleteAlbum();

    const filteredData = useMemo(() => 
    {
        if (!albums) return [];
        if (!searchText) return albums;

        return albums.filter(a => a.title.toLowerCase().includes(searchText.toLowerCase()));
    }, [albums, searchText]);

    const handleOpenEdit = (album: ArchiveAlbum) => 
    {
        navigate(`/admin/archive/${album.id}`);
    };

    const handleDelete = (album: ArchiveAlbum) => 
    {
        setAlbumToDelete(album);
        setIsDeleteModalOpen(true);
    };

    const columnHelper = createColumnHelper<ArchiveAlbum>();

    const columns = useMemo(() => [
        columnHelper.accessor('coverImageUrl', 
        {
            header: 'Cover',
            cell: info => 
            {
                const cover = info.getValue();
                return cover ? (
                    <img
                        src={getImageUrl(cover)}
                        alt="Cover"
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
            header: 'Album Details',
            cell: info => 
            {
                const row = info.row.original;
                return (
                    <div>
                        <div className="font-semibold text-slate-900 text-base flex items-center gap-2">
                            {row.title}
                            {row.isFeatured && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    Featured
                                </span>
                            )}
                        </div>

                        <div className="text-slate-500 mt-1 text-sm line-clamp-1">
                            {row.description || 'No description'}
                        </div>

                        <div className="text-emerald-600 font-medium mt-1 text-xs">
                            {row.eventDate ? format(new Date(row.eventDate), 'dd MMM yyyy') : 'No Date Set'}
                        </div>
                    </div>
                );
            }
        }),

        columnHelper.display({
            id: 'actions',
            header: () => <div className="text-right px-4">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end px-4 gap-2">
                    <ActionButton
                        variant="secondary"
                        size="sm"
                        icon={<Edit className="w-3.5 h-3.5" />}
                        onClick={() => {
                            setEditingAlbum(row.original);
                            setIsFormModalOpen(true);
                        }}
                        className="cursor-pointer hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                        title="Edit Info"
                    >
                        Edit Info
                    </ActionButton>

                    <ActionButton
                        variant="secondary"
                        size="sm"
                        icon={<ImageIcon className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEdit(row.original)}
                        className="cursor-pointer hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                        title="Manage Media"
                    >
                        Manage Media
                    </ActionButton>

                    <button
                        onClick={() => handleDelete(row.original)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Album"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        })
    ], [deleteAlbum, handleOpenEdit]);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Archive & Gallery</h1>
                    <p className="text-slate-500">Manage albums and visual media displays.</p>
                </div>

                <ActionButton
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                        setEditingAlbum(undefined);
                        setIsFormModalOpen(true);
                    }}
                    className="cursor-pointer hidden md:flex"
                >
                    Add Album
                </ActionButton>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search album title..." 
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

            {/* Mobile FAB for Add Album */}
            <ActionButton 
                onClick={() => {
                    setEditingAlbum(undefined);
                    setIsFormModalOpen(true);
                }}
                variant="primary"
                className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg shadow-emerald-900/40 p-0 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            >
                <Plus className="w-6 h-6" />
            </ActionButton>

            <ArchiveFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                album={editingAlbum}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    if (albumToDelete) {
                        deleteAlbum(albumToDelete.id);
                    }
                }}
                title="Delete Album"
                message={`Are you sure you want to delete the album "${albumToDelete?.title}"? This action will permanently remove all photos and videos inside it.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};
