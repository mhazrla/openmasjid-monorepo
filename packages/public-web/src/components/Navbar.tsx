import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navbar = () => 
{
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';
  
  const navClasses = isHome 
    ? "fixed w-full z-50 transition-all duration-300 bg-black/20 backdrop-blur-md border-b border-white/10 text-white" 
    : "sticky top-0 w-full z-50 bg-emerald-600 shadow-md text-white";

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold tracking-tight">{import.meta.env.VITE_APP_NAME}</Link>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="hover:text-amber-400 transition-colors font-medium">Beranda</Link>
            <Link to="/archive" className="hover:text-amber-400 transition-colors font-medium">Galeri Arsip</Link>
            <Link to="#" className="hover:text-amber-400 transition-colors font-medium">Tentang Kami</Link>
            {/* <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-5 py-2 rounded-full font-semibold transition-colors shadow-sm">
              Donasi
            </button> */}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-emerald-700/95 backdrop-blur-xl absolute w-full border-b border-emerald-600/50">
          <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium hover:bg-emerald-600/50 hover:text-amber-400"
            >
              Beranda
            </Link>
            <Link 
              to="/archive" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium hover:bg-emerald-600/50 hover:text-amber-400"
            >
              Galeri Arsip
            </Link>
            {/* <button className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-3 rounded-xl font-bold transition-colors shadow-sm">
              Donasi Sekarang
            </button> */}
          </div>
        </div>
      )}
    </nav>
  );
};
