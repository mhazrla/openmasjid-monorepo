import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useShortlinks, useCreateShortlink, useDeleteShortlink } from '../../features/shortlink/hooks';
import type { CreateShortlinkRequests } from '../../features/shortlink/types';
import { Plus, Trash2, Link as LinkIcon, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';
import { ActionButton } from '../../components/ui/ActionButton';
import { FormItem } from '../../components/ui/FormLayout';
import { Loader2 } from 'lucide-react';

export const ShortlinkPage = () => 
{
    const { data: shortlinks, isLoading } = useShortlinks();
    const createMutation = useCreateShortlink();
    const deleteMutation = useDeleteShortlink();
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateShortlinkRequests>();

    const onCreateSubmit = (data: CreateShortlinkRequests) =>
    {
        const payload = 
        {
            ...data,
            slug: data.slug.toLowerCase()
        };

        createMutation.mutate(payload, 
        {
            onSuccess: () => 
            {
                toast.success('Shortlink created successfully!');
                setIsModalOpen(false);
                reset();
            },
            onError: () => 
            {
                toast.error('Failed to create shortlink. Slug might already exist.');
            }
        });
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

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Shortlinks</h1>
                    <p className="text-slate-500">Manage QR Code redirects and short URLs.</p>
                </div>
                <ActionButton 
                    variant="primary" 
                    icon={<Plus />} 
                    onClick={() => setIsModalOpen(true)}
                >
                    Add New
                </ActionButton>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
            ) : shortlinks?.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center">
                    <LinkIcon className="w-12 h-12 mb-3 opacity-20" />
                    <p>No shortlinks found. Create one to get started.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Original URL</th>
                                <th className="px-6 py-4 w-24 text-center">Clicks</th>
                                <th className="px-6 py-4 w-32 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {shortlinks?.map((link) => (
                                <tr key={link.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-mono">
                                            /{link.slug}
                                        </span>
                                        <ActionButton 
                                            variant="ghost" 
                                            className="p-1.5 h-auto text-slate-400 hover:text-emerald-600" 
                                            icon={<Copy className="w-3 h-3" />} 
                                            onClick={() => copyToClipboard(link.slug)} 
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={link.originalUrl}>
                                        <a href={link.originalUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-600 hover:underline">
                                            {link.originalUrl}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                        {link.description && <div className="text-xs text-slate-400 mt-0.5">{link.description}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-slate-600">
                                        {link.clicks}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ActionButton 
                                            variant="danger" 
                                            className="p-2" 
                                            icon={<Trash2 className="w-4 h-4" />} 
                                            onClick={() => onDelete(link.id)} 
                                            title="Delete"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Add New Shortlink</h2>
                        </div>
                        <form onSubmit={handleSubmit(onCreateSubmit)} className="p-6 space-y-5">
                            <FormItem 
                                label="Slug" 
                                required 
                                error={errors.slug?.message} 
                                description="Short URL identifier."
                            >
                                <Input
                                    placeholder="e.g. infaq"
                                    autoComplete="off"
                                    {...register('slug', { 
                                        required: 'Slug is required',
                                        pattern: { value: /^[a-z0-9-]+$/, message: 'Only lowercase letters, numbers, and dashes.' }
                                    })}
                                />
                            </FormItem>

                            <FormItem 
                                label="Original URL" 
                                required 
                                error={errors.originalUrl?.message}
                            >
                                <Input
                                    placeholder="https://..."
                                    autoComplete="off"
                                    {...register('originalUrl', { 
                                        required: 'Original URL is required',
                                        pattern: { value: /^https?:\/\/.+/, message: 'Must be a valid URL starting with http/https' }
                                    })}
                                />
                            </FormItem>

                            <FormItem label="Description" className="space-y-1.5">
                                <textarea
                                    className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                    rows={3}
                                    {...register('description')}
                                />
                            </FormItem>

                            <div className="flex justify-end gap-3 pt-4">
                                <ActionButton 
                                    variant="secondary" 
                                    onClick={() => 
                                        {
                                            setIsModalOpen(false);
                                            reset();
                                        }
                                    }
                                    type="button"
                                >
                                    Cancel
                                </ActionButton>
                                <ActionButton 
                                    variant="primary" 
                                    type="submit" 
                                    isLoading={createMutation.isPending} 
                                    icon={<Plus />}
                                >
                                    Create Shortlink
                                </ActionButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
