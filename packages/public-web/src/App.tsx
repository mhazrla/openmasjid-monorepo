import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ArchiveExplorer } from './pages/ArchiveExplorer';
import { ArchiveDetail } from './pages/ArchiveDetail';
import { FinanceReportPage } from './pages/FinanceReportPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() 
{
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/archive" element={<ArchiveExplorer />} />
            <Route path="/archive/:id" element={<ArchiveDetail />} />
            <Route path="/keuangan" element={<FinanceReportPage />} />
          </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;