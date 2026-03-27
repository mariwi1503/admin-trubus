import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  UserCog,
  MessageSquare,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Store
} from 'lucide-react';
import { statisticsData, dummyOrders, dummyProducts, dummyStores, dummyUsers, dummyExperts, dummyArticles } from '@/data/adminData';
import { useAppContext } from '@/contexts/AppContext';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const Dashboard: React.FC = () => {
  const { user } = useAppContext();
  const [selectedStore, setSelectedStore] = useState<string>(user?.storeId || 'all');

  // Filter Data based on selectedStore
  const {
    filteredOrders,
    filteredProducts,
    filteredRevenue,
    filteredPendingOrders,
    monthlyRevenueData,
    categoryDistributionData,
    topProductsData
  } = useMemo(() => {
    let orders = dummyOrders;
    let products = dummyProducts;

    // Default dummy products don't have storeId in definition unless I added it. 
    // I added it in adminData.ts in previous step.

    if (selectedStore !== 'all') {
      orders = dummyOrders.filter(o => o.storeId === selectedStore);
      products = dummyProducts.filter(p => p.storeId === selectedStore);
    }

    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pending = orders.filter(o => o.status === 'pending').length;

    // Calculate Monthly Revenue
    const monthlyRevenue = Array(12).fill(0).map((_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      revenue: 0
    }));

    orders.forEach(order => {
      const date = new Date(order.orderDate);
      const monthIndex = date.getMonth(); // 0-11
      // For dummy data, ensure date is parseable. format is 'YYYY-MM-DD' or similar in dummyOrders
      if (!isNaN(monthIndex)) {
        monthlyRevenue[monthIndex].revenue += order.total;
      }
    });

    // Calculate Category Distribution
    const categoryCounts: Record<string, number> = {};
    products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
    const totalProd = products.length || 1;
    const categoryDistribution = Object.entries(categoryCounts).map(([cat, count], index) => ({
      category: cat,
      percentage: Math.round((count / totalProd) * 100),
      color: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'][index % 5]
    })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

    // Calculate Top Products (based on Orders)
    const productSales: Record<string, { sold: number, revenue: number }> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = { sold: 0, revenue: 0 };
        }
        productSales[item.name].sold += item.qty;
        productSales[item.name].revenue += item.qty * item.price;
      });
    });
    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      filteredOrders: orders,
      filteredProducts: products,
      filteredRevenue: revenue,
      filteredPendingOrders: pending,
      monthlyRevenueData: monthlyRevenue,
      categoryDistributionData: categoryDistribution,
      topProductsData: topProducts
    };
  }, [selectedStore]);

  const stats = [
    { label: 'Total Pendapatan', value: formatCurrency(filteredRevenue), icon: TrendingUp, change: '+12.5%', isPositive: true, color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { label: 'Total Pesanan', value: filteredOrders.length.toLocaleString(), icon: ShoppingCart, change: '+8.2%', isPositive: true, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { label: 'Total Pengguna', value: dummyUsers.length.toLocaleString(), icon: Users, change: '+15.3%', isPositive: true, color: 'bg-gradient-to-br from-purple-500 to-purple-600' }, // Users are global for now
    { label: 'Total Produk', value: filteredProducts.length.toLocaleString(), icon: Package, change: '+3', isPositive: true, color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { label: 'Total Ahli', value: dummyExperts.length.toLocaleString(), icon: UserCog, change: '0', isPositive: true, color: 'bg-gradient-to-br from-teal-500 to-teal-600' }, // Experts are global
    { label: 'Total Konsultasi', value: statisticsData.totalConsultations.toLocaleString(), icon: MessageSquare, change: '+23.1%', isPositive: true, color: 'bg-gradient-to-br from-pink-500 to-pink-600' },
    { label: 'Total Artikel', value: dummyArticles.length.toLocaleString(), icon: FileText, change: '+5', isPositive: true, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' }, // Articles are global
    { label: 'Pesanan Pending', value: filteredPendingOrders.toLocaleString(), icon: Clock, change: '-2', isPositive: false, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
  ];

  const maxRevenue = Math.max(...monthlyRevenueData.map(m => m.revenue), 1);

  return (
    <div className="space-y-6">

      {/* Header with Store Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* Maybe add welcome message here or leave empty if handled by header component */}
        </div>
        {user?.role !== 'store_admin' ? (
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
            <Store className="w-4 h-4 text-gray-500" />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
            >
              <option value="all">Semua Toko</option>
              {dummyStores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
            <Store className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {dummyStores.find(s => s.id === user.storeId)?.name || 'Toko Saya'}
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${stat.color} shadow-lg shadow-opacity-20`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" /> Pendapatan Bulanan (2024)
          </h3>
          <div className="flex items-end gap-2 h-72 pb-2">
            {monthlyRevenueData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-500 group-hover:from-green-600 group-hover:to-green-500 relative"
                  style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Distribusi Kategori</h3>
          <div className="space-y-5">
            {categoryDistributionData.map((cat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-600">{cat.category}</span>
                  <span className="text-sm font-black text-gray-800">{cat.percentage}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
            {categoryDistributionData.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Tidak ada data produk</p>
            )}
          </div>
        </div>
      </div>

      {/* Activities & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Aktivitas Real-time</h3>
          <div className="space-y-4">
            {statisticsData.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-opacity-10 ${activity.type === 'order' ? 'bg-blue-600 text-blue-600' :
                    activity.type === 'payment' ? 'bg-green-600 text-green-600' :
                      'bg-purple-600 text-purple-600'
                  }`}>
                  <div className="bg-white p-1 rounded-full shadow-sm">
                    {activity.type === 'order' ? <ShoppingCart className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 font-medium leading-tight">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Produk Terlaris</h3>
          <div className="space-y-3">
            {topProductsData.map((product, index) => (
              <div key={index} className="flex items-center gap-4 p-3 hover:bg-green-50/50 rounded-xl transition-all border border-transparent hover:border-green-100 group">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center font-black text-green-600 bg-green-100 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{product.sold} unit terjual</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
            {topProductsData.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada data penjualan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;