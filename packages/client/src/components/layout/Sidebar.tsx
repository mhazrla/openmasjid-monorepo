import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Building2, 
    CalendarClock, 
    Settings, 
    Link as LinkIcon, 
    LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../features/auth/hooks';
import { ActionButton } from '../ui/ActionButton';

const MENU_ITEMS = 
[
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Mosque Profile', path: '/admin/mosque', icon: Building2 },
    { label: 'Prayer Times', path: '/admin/prayer', icon: CalendarClock },
    { label: 'Display Config', path: '/admin/display', icon: Settings },
    { label: 'Shortlinks', path: '/admin/shortlinks', icon: LinkIcon },
];

interface SidebarProps 
{
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => 
{
    const location = useLocation();
    const { logout, isLoading } = useAuth();

    return (
        <aside 
            className={cn(
                "bg-white border-r border-slate-200 fixed inset-y-0 left-0 z-20 w-64 transition-transform duration-300 transform flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full",
                "md:relative md:translate-x-0"
            )}
        >
            <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    OpenMasjid
                </span>
                <span className="ml-2 text-xs font-medium text-slate-400">Admin</span>
            </div>

            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                {MENU_ITEMS.map((item) => 
                {
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                    const Icon = item.icon;
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)} // Auto-close on mobile
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive 
                                    ? "bg-emerald-50 text-emerald-700" 
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-slate-400")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 shrink-0">
                <ActionButton
                    variant="ghost"
                    onClick={logout}
                    isLoading={isLoading}
                    icon={<LogOut className="w-5 h-5" />}
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                    Logout
                </ActionButton>
            </div>
        </aside>
    );
};
