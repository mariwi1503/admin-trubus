import React from 'react';
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
  Leaf
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Pengguna', icon: Users },
  { id: 'experts', label: 'Ahli Pertanian', icon: UserCog },
  { id: 'articles', label: 'Artikel', icon: FileText },
  { id: 'products', label: 'Produk', icon: Package },
  { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  setCurrentPage, 
  isCollapsed, 
  setIsCollapsed,
  onLogout 
}) => {
  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-green-800 to-green-900 text-white transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-green-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg">Trubus</h1>
              <p className="text-xs text-green-300">Admin Panel</p>
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
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-white text-green-800 shadow-lg' 
                  : 'hover:bg-green-700 text-green-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : ''}`} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
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
