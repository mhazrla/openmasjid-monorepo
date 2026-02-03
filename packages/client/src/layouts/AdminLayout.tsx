import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarClock, Settings, Link as LinkIcon, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

const MENU_ITEMS = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Mosque Profile', path: '/admin/mosque', icon: Building2 },
    { label: 'Prayer Times', path: '/admin/prayer', icon: CalendarClock },
    { label: 'Display Config', path: '/admin/display', icon: Settings },
    { label: 'Shortlinks', path: '/admin/shortlinks', icon: LinkIcon },
];

export const AdminLayout = () => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside 
                className={cn(
                    "bg-white border-r border-slate-200 fixed inset-y-0 left-0 z-20 w-64 transition-transform duration-300 transform",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    "md:relative md:translate-x-0"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                        OpenMasjid
                    </span>
                    <span className="ml-2 text-xs font-medium text-slate-400">Admin</span>
                </div>

                <nav className="p-4 space-y-1">
                    {MENU_ITEMS.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        const Icon = item.icon;
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)} // Auto-close on mobile
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
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 text-slate-600">
                         <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-4 font-bold text-slate-800">Admin</span>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
