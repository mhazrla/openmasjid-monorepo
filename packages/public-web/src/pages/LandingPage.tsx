import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Image as ImageIcon, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PrayerTimesBar } from '../components/PrayerTimesBar';
import { AlbumCard } from '../components/AlbumCard';
import { useAlbums } from '../hooks/useArchive';
import type { ArchiveAlbum } from '../types/archive.types';
import { getImageUrl } from '../lib/utils';

import heroBanner from '../assets/banner_1.jpg';

let baseURL = '/api/';
if (import.meta.env.PROD && import.meta.env.VITE_API_URL) 
{
    const apiUrl = import.meta.env.VITE_API_URL as string;
    baseURL = apiUrl.endsWith('/api/') ? apiUrl : apiUrl.replace(/\/$/, '') + '/api/';
}

const fetchFinanceSummary = async () => 
{
    const response = await fetch(`${baseURL}finance/summary`);
    if (!response.ok) throw new Error('Failed to fetch finance summary');
    const { data } = await response.json();
    return data;
};

const formatIDR = (amount: number) => 
{
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export const LandingPage = () => 
{
  const { data: apiAlbums, isLoading } = useAlbums();
  const { data: financeInfo, isLoading: isFinanceLoading } = useQuery({
    queryKey: ['financeSummary'],
    queryFn: fetchFinanceSummary,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const recentAlbums = (apiAlbums || []).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative h-[85vh] sm:h-[75vh] min-h-[500px] flex items-center justify-center pt-16">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={heroBanner} 
            alt="Mosque Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-50" />
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mt-[-5vh]">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg leading-tight lg:leading-tight">
            Selamat Datang di <br /><span className="text-emerald-400">Masjid Jami At-Tadzkirah</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-slate-200 font-medium max-w-2xl mx-auto drop-shadow-md">
            Membangun peradaban umat melalui pusat informasi, dokumentasi, dan layanan masjid digital.
          </p>
         
        </div>
      </section>

      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <PrayerTimesBar />
      </section>

      {/* Laporan Keuangan Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Transparansi Keuangan</h2>
            <p className="text-slate-500 mt-2 font-medium">Ringkasan kas masjid untuk bulan ini.</p>
          </div>
          <Link to="#" className="inline-flex items-center gap-2 group text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
            Lihat Laporan Lengkap
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isFinanceLoading ? (
            <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Total Kas Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform text-blue-500">
                        <Wallet className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs uppercase tracking-wider mb-4">
                            <Wallet className="w-4 h-4" /> Total Kas Masjid
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-900">{formatIDR(financeInfo?.totalBalance || 0)}</h3>
                    </div>
                </div>

                {/* Pemasukan Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform text-emerald-500">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs uppercase tracking-wider mb-4">
                            <TrendingUp className="w-4 h-4" /> Pemasukan Bulan Ini
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-900">{formatIDR(financeInfo?.monthlyIncome || 0)}</h3>
                    </div>
                </div>

                {/* Pengeluaran Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform text-red-500">
                        <TrendingDown className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 font-semibold text-xs uppercase tracking-wider mb-4">
                            <TrendingDown className="w-4 h-4" /> Pengeluaran Bulan Ini
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-900">{formatIDR(financeInfo?.monthlyExpense || 0)}</h3>
                    </div>
                </div>
            </div>
        )}
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Kegiatan Terbaru</h2>
            <p className="text-slate-500 mt-2 font-medium">Dokumentasi momen berharga komunitas kita.</p>
          </div>
          <Link to="/archive" className="inline-flex items-center gap-2 group text-amber-500 hover:text-amber-600 font-bold transition-colors">
            Lihat Semua Galeri
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          </div>
        ) : recentAlbums.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>Belum ada dokumentasi kegiatan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {recentAlbums.map((album: ArchiveAlbum) => (
              <AlbumCard 
                key={album.id} 
                id={album.id!}
                title={album.title}
                date={album.eventDate ? new Date(album.eventDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Tanggal tidak tersedia'}
                coverImage={getImageUrl(album.coverImageUrl) || 'https://via.placeholder.com/800x600?text=No+Image'}
                itemCount={album.mediaCount || 0}
              />
            ))}
          </div>
        )}
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <MapPin className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Lokasi Masjid</h2>
            <p className="text-slate-500 mt-1 font-medium">Kunjungi kami untuk beribadah dan bersilaturahmi.</p>
          </div>
        </div>
        
        <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1982.4126641841106!2d107.08665043115614!3d-6.416484722170981!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69970a62a78f97%3A0x7e819bd400fb8a85!2sMasjid%20Jami&#39;%20At-Tadzkirah!5e0!3m2!1sid!2sid!4v1772531574723!5m2!1sid!2sid" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

    </div>
  );
};