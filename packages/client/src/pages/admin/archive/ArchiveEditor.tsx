import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoadingStore } from '../../../store/useLoadingStore';
import { useAdminAlbums, useAdminAlbumMedia, useAddMedia, useDeleteMedia } from '../../../features/archive/hooks';
import { ActionButton } from '../../../components/ui/ActionButton';
import { ArrowLeft, Trash2, Image as ImageIcon, Video, Upload, Plus, Edit } from 'lucide-react';
import { cn, getImageUrl } from '../../../lib/utils';
import { useForm } from 'react-hook-form';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { Input } from '../../../components/ui/Input';
import { ArchiveFormModal } from '../../../features/archive/components/ArchiveFormModal';
import type { AddMediaForm } from '../../../features/archive/types';

const extractYouTubeId = (url: string): string | null => 
{
    if (!url) return null;
    if (url.includes('/playlist?list=')) return null; // Reject playlists
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
};

export const ArchiveEditor = () => 
{
    const { id } = useParams<{ id: string }>();
    const albumId = parseInt(id || '0', 10);
    const navigate = useNavigate();

    const { data: albums } = useAdminAlbums();
    const album = albums?.find(a => a.id === albumId);

    const { data: mediaList, isLoading } = useAdminAlbumMedia(albumId);
    const { mutate: addMedia, mutateAsync: addMediaAsync, isPending: isAdding } = useAddMedia(albumId);
    const { mutate: deleteMedia } = useDeleteMedia(albumId);

    const [isAddImageOpen, setIsAddImageOpen] = useState(false);
    const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const { register: imgReg, handleSubmit: imgSubmit, reset: imgReset } = useForm<AddMediaForm>();
    const { register: vidReg, handleSubmit: vidSubmit, reset: vidReset, formState: { errors: vidErrs } } = useForm<AddMediaForm>();

    const onAddImage = async (data: AddMediaForm) => 
    {
        const files = data.imageFile;
        if (!files || files.length === 0) return;
        setIsAddImageOpen(false);
        const total = files.length;
        let successCount = 0;
        try {
            for (let i = 0; i < total; i++) {
                useLoadingStore.getState().showLoading(`Uploading image ${i + 1} of ${total}...`);
                
                const formData = new FormData();
                if (data.title && total === 1) formData.append('title', data.title);
                else if (data.title) formData.append('title', `${data.title} (${i + 1})`);
                
                formData.append('file', files[i]);
                await addMediaAsync(formData);
                successCount++;
            }
            toast.success(`Successfully uploaded ${successCount} images!`);
        } 
        catch (error) 
        {
            toast.error(`Upload stopped. ${successCount} of ${total} uploaded successfully.`);
        } 
        finally 
        {
            useLoadingStore.getState().hideLoading();
            imgReset();
        }
    };

    const onAddVideo = (data: AddMediaForm) => 
    {
        addMedia({ type: 'video', mediaUrl: data.videoUrl, title: data.title }, 
        {
            onSuccess: () => 
            {
                setIsAddVideoOpen(false);
                vidReset();
            }
        });
    };

    if (!album) return <div className="p-8 text-center text-slate-500">Album not found or loading...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/archive')}
                        className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{album.title}</h1>
                        <p className="text-slate-500">Manage internal media files</p>
                    </div>
                </div>

                <div className="relative z-50 hidden md:block">
                    <ActionButton
                        variant="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="cursor-pointer"
                    >
                        Manage
                    </ActionButton>
                    
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <button onClick={() => 
                                { setIsAddImageOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer transition-colors">
                                    <Upload className="w-4 h-4 text-slate-400" />
                                    <span className="font-medium">Upload Photo</span>
                                </button>
                                <button onClick={() => 
                                { setIsAddVideoOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer transition-colors">
                                    <Video className="w-4 h-4 text-slate-400" />
                                    <span className="font-medium">Add Video</span>
                                </button>
                                <div className="h-px bg-slate-100 my-1 mx-3" />
                                <button onClick={() => 
                                { setIsEditModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer transition-colors">
                                    <Edit className="w-4 h-4 text-slate-400" />
                                    <span className="font-medium">Edit Album</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Media Grid */}
            {isLoading ? (
                <div className="text-center py-10 text-slate-500">Loading media...</div>
            ) : mediaList?.length === 0 ? (
                <div className="bg-white border text-center border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No media yet</h3>
                    <p className="text-sm text-slate-500 mt-1">Start building your album by uploading a photo or linking a video.</p>
                </div>
            ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {mediaList?.map((medium) => (
                        <div 
                            key={medium.id} 
                            className="break-inside-avoid mb-4 relative rounded-xl overflow-hidden group shadow-sm hover:shadow-lg transition-all bg-slate-100 border border-slate-200"
                        >
                            {/* Universal Image Renderer (Same for Photo and Video) */}
                            <img 
                                src={medium.type === 'image' ? getImageUrl(medium.mediaUrl) : `https://img.youtube.com/vi/${extractYouTubeId(medium.mediaUrl)}/maxresdefault.jpg`}
                                onError={(e) => { 
                                    if (medium.type === 'video') e.currentTarget.src = `https://img.youtube.com/vi/${extractYouTubeId(medium.mediaUrl)}/hqdefault.jpg`; 
                                }}
                                alt={medium.title || 'Media'} 
                                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500" 
                                loading="lazy" 
                            />
                            {/* Elegant Type Badge */}
                            {medium.type === 'video' ? (
                                <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md z-10 uppercase tracking-widest">
                                    <Video className="w-3 h-3" />
                                    Video
                                </div>
                            ) : (
                                <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white p-1.5 rounded-full z-10">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                </div>
                            )}
                            {/* Hover Action Menu (Delete) */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button 
                                    onClick={() => setDeleteConfirmId(medium.id)}
                                    className="p-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {/* Clean Title Overlay (Bottom) */}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/80 via-black/40 to-transparent z-10">
                                <h3 className="text-white text-sm font-semibold line-clamp-2 leading-snug drop-shadow-sm">
                                    {medium.title || 'Tanpa Judul'}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <Modal isOpen={isAddImageOpen} onClose={() => setIsAddImageOpen(false)} title="Upload Photo">
                <form onSubmit={imgSubmit(onAddImage)} className="space-y-4">
                    <Input 
                        label="Title (Optional)"
                        {...imgReg('title')}
                        placeholder="Image description"
                    />
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">Photo File <span className="text-red-500">*</span></label>
                        <input type="file" required multiple accept="image/*" {...imgReg('imageFile', { required: true })} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <ActionButton variant="secondary" onClick={() => setIsAddImageOpen(false)}>Cancel</ActionButton>
                        <ActionButton variant="primary" type="submit" disabled={isAdding}>Upload</ActionButton>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isAddVideoOpen} onClose={() => setIsAddVideoOpen(false)} title="Add Video Link">
                <form onSubmit={vidSubmit(onAddVideo)} className="space-y-4">
                    <Input 
                        label="Title (Optional)"
                        {...vidReg('title')}
                        placeholder="Video description"
                    />
                    <Input 
                        label={<span>YouTube URL <span className="text-red-500">*</span></span>}
                        {...vidReg('videoUrl', { 
                            required: 'URL YouTube wajib diisi', 
                            validate: (value) => 
                            {
                                // 1. Strict Domain Check
                                if (!value.includes('youtube.com') && !value.includes('youtu.be')) 
                                {
                                    return 'Only YouTube link is accepted.';
                                }
                                // 2. Reject Playlist
                                if (value.includes('/playlist?list=')) 
                                {
                                    return 'Playlist link is not supported. Please provide a specific video link.';
                                }
                                // 3. Ensure valid ID can be extracted (Handles Shorts, Live, Normal)
                                if (!extractYouTubeId(value)) 
                                {
                                    return 'Invalid link format or video ID not found.';
                                }
                                return true;
                            }
                        })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        error={vidErrs.videoUrl?.message}
                    />
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <ActionButton variant="secondary" onClick={() => setIsAddVideoOpen(false)}>Cancel</ActionButton>
                        <ActionButton variant="primary" type="submit" disabled={isAdding}>Add Video</ActionButton>
                    </div>
                </form>
            </Modal>

            <ArchiveFormModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                album={album}
            />

            {/* Mobile FAB */}
            {!(isAddImageOpen || isAddVideoOpen || isEditModalOpen) && (
                <div className="md:hidden fixed bottom-6 right-6 z-50">
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute bottom-16 right-0 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 overflow-hidden mb-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
                                <button onClick={() => 
                                { setIsAddImageOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700 cursor-pointer transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                        <Upload className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="font-medium">Upload Photo</span>
                                </button>
                                <button onClick={() => 
                                { setIsAddVideoOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700 cursor-pointer transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Video className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="font-medium">Add Video</span>
                                </button>
                                <div className="h-px bg-slate-100 my-1 mx-4" />
                                <button onClick={() => 
                                { setIsEditModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700 cursor-pointer transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Edit className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <span className="font-medium">Edit Album</span>
                                </button>
                            </div>
                        </>
                    )}
                    <ActionButton 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        variant="primary"
                        className="w-14 h-14 rounded-full shadow-lg shadow-emerald-900/40 p-0 flex items-center justify-center transition-transform active:scale-95 cursor-pointer relative z-50"
                    >
                        <Plus className={cn("w-6 h-6 transition-transform duration-200", isMenuOpen && "rotate-45")} />
                    </ActionButton>
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteConfirmId !== null}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={() => 
                    {
                    if (deleteConfirmId) 
                    {
                        deleteMedia(deleteConfirmId);
                    }
                }}
                title="Delete Media"
                message="Are you sure you want to permanently delete this media from the album? This action cannot be undone."
            />
        </div>
    );
};
