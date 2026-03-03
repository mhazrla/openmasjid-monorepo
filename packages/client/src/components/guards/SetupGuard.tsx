import { Navigate, Outlet } from 'react-router-dom';
import { useDisplayConfig } from '../../features/display-config/hooks';
import { Loader2, WifiOff, RefreshCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { ActionButton } from '../ui/ActionButton';

interface SetupGuardProps 
{
    children?: ReactNode;
}

export const SetupGuard = ({ children }: SetupGuardProps) => 
{
    const { data: config, isLoading, isError, refetch } = useDisplayConfig();

    if (isLoading) 
    {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        );
    }

    // Network Error Handling
    if (isError) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-6 text-center px-4">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                    <WifiOff className="w-10 h-10 text-red-500" />
                </div>
                <div className="max-w-md space-y-2">
                    <h1 className="text-2xl font-bold">Connection Failed</h1>
                    <p className="text-slate-400">
                        Unable to load display configuration. Please check your internet connection or server status.
                    </p>
                </div>
                <ActionButton 
                    variant="primary" 
                    onClick={() => refetch()}
                    icon={<RefreshCcw className="w-4 h-4" />}
                >
                    Retry Connection
                </ActionButton>
            </div>
        );
    }

    if (!config || !config.cityId) 
    {
        return <Navigate to="/admin/display-config" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};
