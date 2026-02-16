import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { queryClient } from './lib/react-query';
import { AdminLayout } from './layouts/AdminLayout';
import { MosqueProfilePage } from './pages/admin/MosqueProfilePage';
import { PrayerTimePage } from './pages/admin/PrayerTimePage';
import { DisplayConfigPage } from './pages/admin/DisplayConfigPage';
import { ShortlinkPage } from './pages/admin/ShortlinkPage';
import { LoginPage } from './pages/auth/LoginPage';
import { Toaster } from 'sonner';
import { StandbyView } from './pages/display/StandbyView';
import { SetupGuard } from './components/guards/SetupGuard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RamadanPage } from './pages/admin/RamadanPage';
import { KajianManagerPage } from './pages/admin/KajianManagerPage';
import { PeopleManagerPage } from './pages/admin/PeopleManagerPage';

function App() 
{
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* 1. Root / Display Route (Guarded for Setup/Error) */}
          <Route path="/" element={
            <SetupGuard>
              <StandbyView />
            </SetupGuard>
          } />
          
          {/* Redirect legacy path */}
          <Route path="/display" element={<Navigate to="/" replace />} />
          
          {/* 2. Secure Admin Routes */}
          <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                 <Route index element={<Navigate to="/admin/mosque" replace />} />
                 <Route path="mosque" element={<MosqueProfilePage />} />
                 <Route path="prayer" element={<PrayerTimePage />} />
                 <Route path="display" element={<DisplayConfigPage />} />
                 <Route path="shortlinks" element={<ShortlinkPage />} />
                 <Route path="kajian" element={<KajianManagerPage />} />
                 <Route path="ramadan" element={<RamadanPage />} />
                 <Route path="people" element={<PeopleManagerPage />} />
              </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
