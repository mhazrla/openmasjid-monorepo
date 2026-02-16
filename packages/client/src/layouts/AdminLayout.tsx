import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';

export const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

    return (
        <div className="min-h-screen bg-slate-100 flex">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

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
