import React, { useState, useMemo, useEffect } from 'react';
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
  Store,
  Globe,
  MousePointerClick,
  Smartphone,
  BarChart3
} from 'lucide-react';
import { statisticsData, dummyOrders, dummyProducts, dummyStores, dummyUsers, dummyExperts, dummyArticles } from '@/data/adminData';
import { useAppContext } from '@/contexts/AppContext';
import { fetchPortalAnalyticsSnapshot, PortalAnalyticsSnapshot } from '@/lib/portalAnalyticsService';
import { fetchMobileAnalyticsSnapshot, MobileAnalyticsSnapshot } from '@/lib/mobileAnalyticsService';
import { isStoreScopedRole } from '@/lib/rbac';

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
  const [portalSnapshot, setPortalSnapshot] = useState<PortalAnalyticsSnapshot | null>(null);
  const [mobileSnapshot, setMobileSnapshot] = useState<MobileAnalyticsSnapshot | null>(null);

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

  useEffect(() => {
    let active = true;

    const loadPortalAnalytics = async () => {
      const snapshot = await fetchPortalAnalyticsSnapshot(30);
      if (active) {
        setPortalSnapshot(snapshot);
      }
    };

    void loadPortalAnalytics();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadMobileAnalytics = async () => {
      const snapshot = await fetchMobileAnalyticsSnapshot(30);
      if (active) {
        setMobileSnapshot(snapshot);
      }
    };

    void loadMobileAnalytics();

    return () => {
      active = false;
    };
  }, []);

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
  const portalStats = portalSnapshot ? [
    { label: 'Visitor Unik', value: portalSnapshot.summary.uniqueVisitors.toLocaleString('id-ID'), helper: `${portalSnapshot.summary.avgViewsPerVisitor} halaman per visitor`, icon: Users, color: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
    { label: 'Masuk Detail Produk', value: `${portalSnapshot.summary.productDetailVisitorRate}%`, helper: `${portalSnapshot.summary.productDetailVisitors.toLocaleString('id-ID')} visitor dari total pengunjung`, icon: Package, color: 'bg-gradient-to-br from-orange-500 to-amber-600' },
    { label: 'Klik CTA', value: `${portalSnapshot.summary.ctaVisitorRate}%`, helper: `${portalSnapshot.summary.ctaVisitors.toLocaleString('id-ID')} visitor lanjut klik CTA`, icon: MousePointerClick, color: 'bg-gradient-to-br from-violet-500 to-fuchsia-600' },
    { label: 'Device Dominan', value: portalSnapshot.deviceBreakdown[0]?.label || '-', helper: `${portalSnapshot.deviceBreakdown[0]?.share || 0}% traffic portal`, icon: Smartphone, color: 'bg-gradient-to-br from-emerald-500 to-green-600' },
  ] : [];

  return (
    <div className="space-y-6">

      {/* Header with Store Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {!isStoreScopedRole(user?.role) ? (
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

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Snapshot Analitik Portal
            </h3>
            <p className="text-sm text-gray-500">
              Ringkasan performa pengunjung portal untuk kebutuhan marketing.
            </p>
          </div>
        </div>

        {portalSnapshot ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {portalStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="mt-2 text-sm text-gray-500">{stat.helper}</p>
                      </div>
                      <div className={`rounded-2xl p-3 ${stat.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm xl:col-span-2">
                <h4 className="text-base font-bold text-gray-800">Halaman Paling Sering Dikunjungi</h4>
                <div className="mt-4 space-y-3">
                  {portalSnapshot.topPages.slice(0, 3).map((page, index) => (
                    <div key={page.path} className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{page.label}</p>
                        <p className="text-sm text-gray-500 truncate">{page.path}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{page.value.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-500">{page.share}% traffic</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
                <h4 className="text-base font-bold text-gray-800">CTA Paling Diminati</h4>
                <div className="mt-4 space-y-4">
                  {portalSnapshot.ctaPerformance.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-700">{item.label}</span>
                        <span className="font-bold text-gray-900">{item.value.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-100">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                          style={{ width: `${item.share}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{item.share}% dari seluruh klik CTA</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-500">Total Visitor</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {portalSnapshot.summary.uniqueVisitors.toLocaleString('id-ID')}
                </p>
                <p className="mt-2 text-sm text-gray-500">Baseline funnel pengunjung portal</p>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 shadow-sm">
                <p className="text-sm font-semibold text-orange-700">Visitor ke Detail Produk</p>
                <p className="mt-2 text-3xl font-bold text-orange-950">
                  {portalSnapshot.summary.productDetailVisitorRate}%
                </p>
                <p className="mt-2 text-sm text-orange-800">
                  {portalSnapshot.summary.productDetailVisitors.toLocaleString('id-ID')} dari total visitor membuka detail produk
                </p>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 shadow-sm">
                <p className="text-sm font-semibold text-violet-700">Visitor Sampai CTA</p>
                <p className="mt-2 text-3xl font-bold text-violet-950">
                  {portalSnapshot.summary.ctaVisitorRate}%
                </p>
                <p className="mt-2 text-sm text-violet-800">
                  {portalSnapshot.summary.ctaVisitors.toLocaleString('id-ID')} visitor lanjut klik CTA
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl border border-white bg-white/80" />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-sky-600" />
              Snapshot Analitik Mobile
            </h3>
            <p className="text-sm text-gray-500">
              Fokus pada 3 fitur utama mobile: artikel, konsultasi ahli, dan belanja produk.
            </p>
          </div>
        </div>

        {mobileSnapshot ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-500">Active Users</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{mobileSnapshot.summary.activeUsers.toLocaleString('id-ID')}</p>
                <p className="mt-2 text-sm text-gray-500">{mobileSnapshot.summary.avgSessionsPerUser} sesi per user</p>
              </div>
              <div className="rounded-2xl border border-lime-100 bg-lime-50 p-5 shadow-sm">
                <p className="text-sm font-semibold text-lime-700">Artikel</p>
                <p className="mt-2 text-2xl font-bold text-lime-950">{mobileSnapshot.summary.articleVisitorRate}%</p>
                <p className="mt-2 text-sm text-lime-800">{mobileSnapshot.summary.articleVisitors.toLocaleString('id-ID')} user membuka artikel</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5 shadow-sm">
                <p className="text-sm font-semibold text-sky-700">Konsultasi Ahli</p>
                <p className="mt-2 text-2xl font-bold text-sky-950">{mobileSnapshot.summary.consultationVisitorRate}%</p>
                <p className="mt-2 text-sm text-sky-800">{mobileSnapshot.summary.consultationBookings.toLocaleString('id-ID')} booking konsultasi</p>
              </div>
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 shadow-sm">
                <p className="text-sm font-semibold text-orange-700">Belanja Produk</p>
                <p className="mt-2 text-2xl font-bold text-orange-950">{mobileSnapshot.summary.shopVisitorRate}%</p>
                <p className="mt-2 text-sm text-orange-800">{mobileSnapshot.summary.addToCartUsers.toLocaleString('id-ID')} user tambah ke keranjang</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
                <h4 className="text-base font-bold text-gray-800">Distribusi Minat Fitur</h4>
                <div className="mt-4 space-y-4">
                  {mobileSnapshot.featureShare.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-700">{item.label}</span>
                        <span className="font-bold text-gray-900">{item.share}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-100">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                          style={{ width: `${item.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
                <h4 className="text-base font-bold text-gray-800">Tema Artikel Terkuat</h4>
                <div className="mt-4 space-y-3">
                  {mobileSnapshot.articleTopics.slice(0, 3).map((item, index) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                      <div className="w-8 h-8 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.helper}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
                <h4 className="text-base font-bold text-gray-800">Arah Konversi Terbaik</h4>
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                    <p className="text-sm font-semibold text-sky-700">Booking Konsultasi</p>
                    <p className="mt-2 text-2xl font-bold text-sky-950">{mobileSnapshot.summary.bookingRate}%</p>
                    <p className="mt-1 text-sm text-sky-800">dari total active users mobile</p>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                    <p className="text-sm font-semibold text-orange-700">Tambah ke Keranjang</p>
                    <p className="mt-2 text-2xl font-bold text-orange-950">{mobileSnapshot.summary.addToCartRate}%</p>
                    <p className="mt-1 text-sm text-orange-800">dari total active users mobile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl border border-white bg-white/80" />
            ))}
          </div>
        )}
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
