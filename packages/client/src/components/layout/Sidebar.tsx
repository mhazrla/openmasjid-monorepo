import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Building2, 
    CalendarClock, 
    Settings, 
    Link as LinkIcon, 
    LogOut,
    Moon,
    BookOpen,
    User,
    PanelLeftClose,
    X,
    Wallet
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../features/auth/hooks';
import { ActionButton } from '../ui/ActionButton';

const MENU_ITEMS = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Mosque Profile', path: '/admin/mosque', icon: Building2 },
    { label: 'Prayer Times', path: '/admin/prayer', icon: CalendarClock },
    { label: 'Display Config', path: '/admin/display', icon: Settings },
    { label: 'Shortlinks', path: '/admin/shortlinks', icon: LinkIcon },
    { label: 'Ramadan', path: '/admin/ramadan', icon: Moon },
    { label: 'Kajian', path: '/admin/kajian', icon: BookOpen },
    { label: 'People', path: '/admin/people', icon: User },
    { label: 'Financial Report', path: '/admin/finance', icon: Wallet }
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const location = useLocation();
    const { logout, isLoading } = useAuth();

    return (
        <aside 
            className={cn(
                "bg-white border-r border-slate-200 fixed inset-y-0 left-0 z-20 transition-all duration-300 transform flex flex-col shadow-lg md:shadow-none",
                // Mobile: slide in/out
                isOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop: always visible, but width changes
                "md:relative md:translate-x-0",
                isOpen ? "md:w-64" : "md:w-20"
            )}
        >
            <div className={cn(
                "h-16 flex items-center border-b border-slate-100 shrink-0 transition-all duration-300 relative",
                isOpen ? "px-6 justify-between" : "px-0 justify-center"
            )}>
                {isOpen ? (
                    <div className="flex items-center">
                        <span className="text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent truncate">
                            OpenMasjid
                        </span>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="text-xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors focus:outline-none cursor-pointer"
                    >
                        OM
                    </button>
                )}
                
                {/* Desktop Toggle Button - Only visible when OPEN */}
                {isOpen && (
                    <div className="hidden md:block">
                         <ActionButton
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-slate-600"
                            icon={<PanelLeftClose className="w-5 h-5" />}
                        />
                    </div>
                )}

                {/* Mobile Close Button */}
                <button 
                    onClick={() => setIsOpen(false)}
                    className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="p-4 space-y-1 flex-1 overflow-y-auto overflow-x-hidden">
                {MENU_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                    const Icon = item.icon;
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 768 && setIsOpen(false)} // Auto-close on mobile only
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                                isActive 
                                    ? "bg-emerald-50 text-emerald-700" 
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                                !isOpen && "justify-center px-2"
                            )}
                            title={!isOpen ? item.label : undefined}
                        >
                            <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-emerald-600" : "text-slate-400")} />
                            <span className={cn(
                                "transition-all duration-300",
                                !isOpen && "w-0 opacity-0 overflow-hidden"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 shrink-0">
                <ActionButton
                    variant="ghost"
                    onClick={logout}
                    isLoading={isLoading}
                    icon={<LogOut className="w-5 h-5 shrink-0" />}
                    className={cn(
                        "w-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-all",
                        isOpen ? "justify-start" : "justify-center px-0"
                    )}
                    // Only remove title if open? No, title is good for tooltip when closed.
                    title={!isOpen ? "Logout" : undefined} 
                >
                     <span className={cn(
                        "transition-all duration-300 ml-2",
                        !isOpen && "hidden" // Use hidden to completely remove from layout flow when closed, clearer than w-0
                    )}>
                        Logout
                    </span>
                </ActionButton>
            </div>
        </aside>
    );
};
