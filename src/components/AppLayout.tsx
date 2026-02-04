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

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Check for existing session
  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (session) {
      const sessionData = JSON.parse(session);
      setIsLoggedIn(true);
      setAdminName(sessionData.name || 'Admin');
      // Initialize database with seed data if needed
      initializeDatabase();
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsInitializing(true);
    
    // Save session
    const sessionData = {
      email,
      name: 'Administrator',
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem('admin_session', JSON.stringify(sessionData));
    
    // Initialize database with seed data
    await initializeDatabase();
    
    setIsLoggedIn(true);
    setAdminName('Administrator');
    setIsInitializing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      users: 'Kelola User',
      experts: 'Kelola Ahli',
      articles: 'Kelola Artikel',
      products: 'Kelola Produk',
      orders: 'Kelola Pesanan',
      settings: 'Pengaturan Sistem',
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
      case 'orders':
        return <OrderManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <Dashboard />;
    }
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
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
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <Header 
          pageTitle={getPageTitle()} 
          adminName={adminName}
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
