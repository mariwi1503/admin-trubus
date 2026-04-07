import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Leaf,
  Archive,
  Briefcase,
  QrCode,
  Store,
  Tag,
  MessageCircleQuestion,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
  userRole?: 'super_admin' | 'store_admin' | 'customer' | 'admin';
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles?: string[]; // Allowed roles
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stores', label: 'Kelola Toko', icon: Store, roles: ['super_admin'] },
  { id: 'users', label: 'Pengguna', icon: Users, roles: ['super_admin'] },
  { id: 'experts', label: 'Ahli Pertanian', icon: UserCog, roles: ['super_admin'] },
  { id: 'articles', label: 'Artikel', icon: FileText, roles: ['super_admin'] },
  { id: 'products', label: 'Produk', icon: Package },
  { id: 'analytics', label: 'Analitik', icon: BarChart3 },
  { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
  { id: 'promos', label: 'Promo & Flash Sale', icon: Tag, roles: ['super_admin'] },
  { id: 'careers', label: 'Lowongan Kerja', icon: Briefcase, roles: ['super_admin'] },
  { id: 'faqs', label: 'FAQ', icon: MessageCircleQuestion, roles: ['super_admin'] },
  { id: 'qrcode', label: 'QR Code', icon: QrCode },
  { id: 'arsip', label: 'Arsip', icon: Archive, roles: ['super_admin'] },
  { id: 'clients', label: 'Klien', icon: Briefcase, roles: ['super_admin'] },
  { id: 'settings', label: 'Pengaturan', icon: Settings, roles: ['super_admin'] },
];

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  isCollapsed,
  setIsCollapsed,
  onLogout,
  userRole
}) => {
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true; // Available for all if roles not specified
    if (!userRole) return false;
    // Map 'admin' to 'super_admin' for backward compatibility if needed, or stick to strict checking
    return item.roles.includes(userRole);
  });

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-green-800 to-green-900 text-white transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-green-700">
        <div className="flex items-center gap-3">
          {isCollapsed ? (
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
          ) : (
            <div className="pl-4 w-full flex items-center justify-center">
              <img src="/images/logo-white.png" alt="Trubus" className="h-10 object-contain" />
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-green-700 rounded-lg transition-colors"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${isActive
                ? 'bg-white text-green-800 shadow-lg'
                : 'hover:bg-green-700 text-green-100'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : ''}`} />
                {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors text-red-200 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Keluar</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
