import { Loader2 } from 'lucide-react';
import { useLoadingStore } from '../../store/useLoadingStore';

export const LoadingOverlay = () => 
{
    const { isLoading, message } = useLoadingStore();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-9999 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center gap-4 min-w-[280px] max-w-sm text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-md bg-emerald-500/20 animate-pulse"></div>
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600 relative z-10" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-slate-900 font-semibold text-lg">{message}</h3>
                    <p className="text-slate-500 text-sm">Please wait, this might take a moment.</p>
                </div>
            </div>
        </div>
    );
};
