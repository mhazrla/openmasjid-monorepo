import { useForm } from 'react-hook-form';
import { useAuth } from '../../features/auth/hooks';
import { ActionButton } from '../../components/ui/ActionButton';
import { Input } from '../../components/ui/Input';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { handleFormError } from '../../utils/form-error';

export const LoginPage = () => 
{
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, setError, formState: { errors } } = useForm({
        defaultValues: 
        {
            username: '',
            password: ''
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => 
    {
        if (isAuthenticated) 
        {
            navigate('/admin', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data: any) =>
    {
        setIsSubmitting(true);
        try 
        {
            await login(data.username, data.password);
        } 
        catch (error: any) 
        {
             handleFormError(error, setError);
        } 
        finally 
        {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-200">
                         <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                    <p className="text-slate-500">Sign in to manage your mosque display</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Username</label>
                            <Input
                                id="username"
                                placeholder="Enter username"
                                {...register('username', { required: 'Username is required' })}
                            />
                            {errors.username && (
                                <p className="text-xs text-red-500 font-medium">{errors.username.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter password"
                                {...register('password', { required: 'Password is required' })}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    <ActionButton 
                        variant="primary" 
                        className="w-full justify-center py-3 text-base"
                        isLoading={isSubmitting}
                        type="submit"
                        icon={<LogIn className="w-5 h-5" />}
                    >
                        Sign In
                    </ActionButton>
                </form>

                <div className="text-center">
                    <p className="text-xs text-slate-400">
                        Default Credentials: admin / admin123
                    </p>
                </div>
            </div>
        </div>
    );
};
