import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { initializeDatabase } from '@/lib/supabaseService';

// Admin Components
import LoginPage from './admin/LoginPage';
import Sidebar from './admin/Sidebar';
import Header from './admin/Header';
import Dashboard from './admin/Dashboard';
import UserManagement from './admin/UserManagement';
import ExpertManagement from './admin/ExpertManagement';
import ArticleManagement from './admin/ArticleManagement';
import ProductManagement from './admin/ProductManagement';
import OrderManagement from './admin/OrderManagement';
import SystemSettings from './admin/SystemSettings';
import ArchiveManagement from './admin/ArchiveManagement';
import ClientManagement from './admin/ClientManagement';
import Analytics from './admin/Analytics';
import QRCodeManagement from './admin/QRCodeManagement';
import PromoManagement from './admin/PromoManagement';
import FAQManagement from './admin/FAQManagement';
import LiveChatManagement from './admin/LiveChatManagement';
import StoreManagement from './admin/StoreManagement';
import CareerManagement from './admin/CareerManagement';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar, user, login, logout } = useAppContext();
  const isMobile = useIsMobile();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initial check is handled in AppContext

  const handleLogin = async (email: string, password: string) => {
    setIsInitializing(true);

    // Allow any password for demo purposes as long as email matches a user in dummyUsers
    // In a real app, strict password checking would be here
    const success = login(email);

    if (success) {
      // Initialize database with seed data if needed
      await initializeDatabase();
    } else {
      // Error handling is managed in AppContext login function (toast) or LoginPage
    }

    setIsInitializing(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('dashboard');
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      users: 'Kelola User',
      experts: 'Kelola Ahli',
      articles: 'Kelola Artikel',
      products: 'Kelola Produk',
      analytics: 'Analitik',
      'live-chat': 'Live Chat',
      'products-all': 'Semua Produk',
      'products-store': 'Produk di Toko',
      orders: 'Kelola Pesanan',
      promos: 'Promo & Flash Sale',
      faqs: 'Manajemen FAQ',
      stores: 'Kelola Toko', // New title
      settings: 'Pengaturan Sistem',
      arsip: 'Arsip Dokumen',
      clients: 'Kelola Klien',
      qrcode: 'Manajemen QR Code',
      careers: 'Kelola Karir',
    };
    return titles[currentPage] || 'Dashboard';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'experts':
        return <ExpertManagement />;
      case 'articles':
        return <ArticleManagement />;
      case 'products':
        return <ProductManagement />;
      case 'analytics':
        return <Analytics />;
      case 'live-chat':
        return <LiveChatManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'promos':
        return <PromoManagement />;
      case 'faqs':
        return <FAQManagement />;
      case 'stores':
        return <StoreManagement />;
      case 'settings':
        return <SystemSettings />;
      case 'arsip':
        return <ArchiveManagement />;
      case 'clients':
        return <ClientManagement />;
      case 'qrcode':
        return <QRCodeManagement />;
      case 'careers':
        return <CareerManagement />;
      default:
        return <Dashboard />;
    }
  };

  // Show login page if not logged in
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout}
        userRole={user.role}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <Header
          pageTitle={getPageTitle()}
          adminName={user.name}
          onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="p-6">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="p-6 border-t border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; 2024 Trubus Admin Dashboard. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                Bantuan
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                Dokumentasi
              </a>
              <a href="https://toko-tani-ten.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
                Lihat Toko
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {isMobile && !isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default AppLayout;
