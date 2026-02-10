
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { Code2, Construction, MessageCircle } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <AppProvider>
      {/* <AppLayout /> */}
      <MaintenancePage />
    </AppProvider>
  );
};

const MaintenancePage = () => {
  const whatsappNumber = "6285338714313";
  const waLink = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full text-center">
        
        {/* Icon Maintenance */}
        <div className="mb-8 flex justify-center">
          <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
            <Construction className="h-12 w-12 text-green-500" />
          </div>
        </div>

        {/* Header Section */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Website Sedang <span className="text-green-500">Maintenance</span>
        </h1>
        <p className="text-gray-600 text-lg mb-10">
          Kami sedang memperbarui sistem untuk meningkatkan kualitas layanan. 
          Silakan hubungi pengembang jika ada kendala mendesak.
        </p>

        {/* Developer Contact Button */}
        <a 
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-2xl transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-green-200"
        >
          <MessageCircle size={22} />
          Hubungi Developer via WhatsApp
        </a>

        <hr className="my-12 border-gray-200" />

        {/* Jasa Iklan Section */}
        <div className="bg-white border-2 border-dashed border-green-200 rounded-3xl p-8 relative overflow-hidden">
          {/* Dekorasi Background */}
          <div className="absolute -right-4 -bottom-4 opacity-5 text-green-500">
            <Code2 size={120} />
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">
            Ingin Membangun Website atau Aplikasi?
          </h3>
          <p className="text-gray-500 mb-6 relative z-10">
            Kami melayani jasa pembuatan website landing page, sistem informasi, hingga aplikasi mobile custom sesuai kebutuhan bisnis Anda.
          </p>
          <a 
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 font-bold hover:text-green-700 underline flex items-center justify-center gap-1 group"
          >
            Konsultasi Proyek Anda Sekarang 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        {/* Footer */}
        <p className="mt-10 text-gray-400 text-xs uppercase tracking-widest">
          &copy; 2026 Developer Support
        </p>
      </div>
    </div>
  );
};

export default Index;
