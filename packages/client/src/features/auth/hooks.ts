import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../lib/axios'; 

const AUTH_KEY = 'masjid_display_auth_token';

interface LoginResponse 
{
    token: string;
    user: {
        id: number;
        username: string;
        role: string;
    };
}

export const useAuth = () => 
{
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => 
    {
        return !!localStorage.getItem(AUTH_KEY);
    });

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const login = async (username: string, pass: string) => 
    {
        setIsLoading(true);
        try 
        {
            const { data: response } = await api.post<{ data: LoginResponse }>('/auth/login', 
            {
                username,
                password: pass
            });

            const token = response.data?.token;

            if (!token || String(token) === 'undefined' || String(token) === 'null') 
            {
                throw new Error("Invalid Auth Token: The server returned an invalid or missing token.");
            }

            localStorage.setItem(AUTH_KEY, token);
            localStorage.setItem('user_info', JSON.stringify(response.data.user));
            
            setIsAuthenticated(true);
            toast.success('Login Successful');
            navigate('/admin');

            return true;
        } 
        catch (error: any) 
        {
            console.error('Login Failed:', error);
            throw error; 
        } 
        finally 
        {
            setIsLoading(false);
        }
    };

    const logout = async () => 
    {
        setIsLoading(true);
        try 
        {
            await api.post('/auth/logout');
        } 
        catch (err) 
        {
            console.warn('Logout API call failed', err);
        } 
        finally 
        {
            localStorage.removeItem(AUTH_KEY);
            localStorage.removeItem('user_info');
            setIsAuthenticated(false);
            toast.info('Logged out');
            setIsLoading(false);
            navigate('/login');
        }
    };

    useEffect(() => 
    {
        const handleStorageChange = () => 
        {
             setIsAuthenticated(!!localStorage.getItem(AUTH_KEY));
        };
        window.addEventListener('storage', handleStorageChange);

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return { isAuthenticated, isLoading, login, logout };
};
