import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import CryptoPage from '@/pages/index';
import NotFound from '@/pages/NotFound';

export default function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<CryptoPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}