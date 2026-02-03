import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { queryClient } from './lib/react-query';
import { AdminLayout } from './layouts/AdminLayout';
import { MosqueProfilePage } from './pages/admin/MosqueProfilePage';
import { PrayerTimePage } from './pages/admin/PrayerTimePage';
import { Toaster } from 'sonner';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Display Route */}
          <Route path="/" element={<div className="p-10 text-4xl font-bold text-center">Display TV Page (Coming Soon)</div>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
             <Route index element={<Navigate to="/admin/mosque" replace />} />
             <Route path="mosque" element={<MosqueProfilePage />} />
             <Route path="prayer" element={<PrayerTimePage />} />
             
             {/* Placeholders for future routes */}
             <Route path="display" element={<div>Display Config</div>} />
             <Route path="shortlinks" element={<div>Shortlinks Manager</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
