import { useQuery } from '@tanstack/react-query';

let baseURL = '/api/';
if (import.meta.env.PROD && import.meta.env.VITE_API_URL) 
{
    const apiUrl = import.meta.env.VITE_API_URL as string;
    baseURL = apiUrl.endsWith('/api/') ? apiUrl : apiUrl.replace(/\/$/, '') + '/api/';
}

const fetchDisplayConfig = async () => 
{
    const response = await fetch(`${baseURL}display-config`);
    if (!response.ok) throw new Error('Gagal mengambil data konfigurasi dari server');
    const { data } = await response.json();
    return data;
};

export const LiveStreamBanner = () => 
{
  const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
  const { data: config } = useQuery({
      queryKey: ['displayConfig', 'internal'],
      queryFn: fetchDisplayConfig,
      staleTime: 1000 * 60 * 60 * 6,
  });
  
  if (!config?.isYoutubeLiveActive || !channelId) return null;

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20 mt-8 mb-4">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-lg border border-slate-200">

        <p className="absolute text-slate-500 text-sm font-medium z-0">
          Menunggu siaran langsung...
        </p>
        
        <iframe
          src={`https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=0`}
          className="absolute top-0 left-0 w-full h-full border-0 z-10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Masjid Live Stream"
        ></iframe>
      </div>
    </section>
  );
};
