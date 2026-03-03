import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { queryClient } from './lib/react-query';
import { Toaster } from 'sonner';
import { SetupGuard } from './components/guards/SetupGuard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { DisplayWrapper } from './components/layout/DisplayWrapper';

// Lazy load layout and pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const MosqueProfilePage = lazy(() => import('./pages/admin/MosqueProfilePage').then(m => ({ default: m.MosqueProfilePage })));
const PrayerTimePage = lazy(() => import('./pages/admin/PrayerTimePage').then(m => ({ default: m.PrayerTimePage })));
const DisplayConfigPage = lazy(() => import('./pages/admin/DisplayConfigPage').then(m => ({ default: m.DisplayConfigPage })));
const ShortlinkPage = lazy(() => import('./pages/admin/ShortlinkPage').then(m => ({ default: m.ShortlinkPage })));
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const StandbyView = lazy(() => import('./pages/display/StandbyView').then(m => ({ default: m.StandbyView })));
const RamadanPage = lazy(() => import('./pages/admin/RamadanPage').then(m => ({ default: m.RamadanPage })));
const KajianManagerPage = lazy(() => import('./pages/admin/KajianManagerPage').then(m => ({ default: m.KajianManagerPage })));
const PeopleManagerPage = lazy(() => import('./pages/admin/PeopleManagerPage').then(m => ({ default: m.PeopleManagerPage })));
const FinanceManagerPage = lazy(() => import('./pages/admin/FinanceManagerPage').then(m => ({ default: m.FinanceManagerPage })));
const ArchiveList = lazy(() => import('./pages/admin/archive/ArchiveList').then(m => ({ default: m.ArchiveList })));
const ArchiveEditor = lazy(() => import('./pages/admin/archive/ArchiveEditor').then(m => ({ default: m.ArchiveEditor })));

function App() 
{
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <BrowserRouter basename="/display">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* 1. Root / Display Route (Guarded for Setup/Error) */}
            <Route path="/" element={
              <SetupGuard>
                <DisplayWrapper>
                  <StandbyView />
                </DisplayWrapper>
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
                   <Route path="display-config" element={<DisplayConfigPage />} />
                   <Route path="shortlinks" element={<ShortlinkPage />} />
                   <Route path="kajian" element={<KajianManagerPage />} />
                   <Route path="archive" element={<ArchiveList />} />
                   <Route path="archive/:id" element={<ArchiveEditor />} />
                   <Route path="ramadan" element={<RamadanPage />} />
                   <Route path="people" element={<PeopleManagerPage />} />
                   <Route path="finance" element={<FinanceManagerPage />} />
                </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
