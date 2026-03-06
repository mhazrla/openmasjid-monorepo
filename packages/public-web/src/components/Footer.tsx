export const Footer = () => 
{
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4"> {import.meta.env.VITE_APP_NAME}</h3>
            <p className="text-sm leading-relaxed max-w-xs">
              Sistem manajemen dan tampilan cerdas untuk operasional harian masjid yang lebih modern dan transparan.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Tautan</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Jadwal Shalat</a></li>
              <li><a href="/archive" className="hover:text-emerald-400 transition-colors">Galeri Kegitan</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Laporan Keuangan</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Kontak</h4>
            <p className="text-sm">
              Sindangmulya,<br />
              Kec. Cibarusah, Kabupaten Bekasi, <br />
              Jawa Barat 17340
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
