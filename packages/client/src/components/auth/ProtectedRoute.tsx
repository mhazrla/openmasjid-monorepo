import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => 
{
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) 
    {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!isAuthenticated) 
    {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
