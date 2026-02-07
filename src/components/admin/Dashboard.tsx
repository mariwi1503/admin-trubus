import React from 'react';
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
  ArrowDownRight
} from 'lucide-react';
import { statisticsData } from '@/data/adminData';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Pendapatan', value: formatCurrency(statisticsData.totalRevenue), icon: TrendingUp, change: '+12.5%', isPositive: true, color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { label: 'Total Pesanan', value: statisticsData.totalOrders.toLocaleString(), icon: ShoppingCart, change: '+8.2%', isPositive: true, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { label: 'Total Pengguna', value: statisticsData.totalUsers.toLocaleString(), icon: Users, change: '+15.3%', isPositive: true, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { label: 'Total Produk', value: statisticsData.totalProducts.toLocaleString(), icon: Package, change: '+3', isPositive: true, color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { label: 'Total Ahli', value: statisticsData.totalExperts.toLocaleString(), icon: UserCog, change: '0', isPositive: true, color: 'bg-gradient-to-br from-teal-500 to-teal-600' },
    { label: 'Total Konsultasi', value: statisticsData.totalConsultations.toLocaleString(), icon: MessageSquare, change: '+23.1%', isPositive: true, color: 'bg-gradient-to-br from-pink-500 to-pink-600' },
    { label: 'Total Artikel', value: statisticsData.totalArticles.toLocaleString(), icon: FileText, change: '+5', isPositive: true, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
    { label: 'Pesanan Pending', value: statisticsData.pendingOrders.toLocaleString(), icon: Clock, change: '-2', isPositive: false, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
  ];

  const maxRevenue = Math.max(...statisticsData.monthlyRevenue.map(m => m.revenue));

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      
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
            <TrendingUp className="w-5 h-5 text-green-500" /> Pendapatan Bulanan (12 Bulan)
          </h3>
          <div className="flex items-end gap-2 h-72 pb-2">
            {statisticsData.monthlyRevenue.map((item, index) => (
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
            {statisticsData.categoryDistribution.map((cat, index) => (
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-opacity-10 ${
                  activity.type === 'order' ? 'bg-blue-600 text-blue-600' :
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
          <h3 className="text-lg font-bold text-gray-800 mb-4">Produk Favorit</h3>
          <div className="space-y-3">
            {statisticsData.topProducts.map((product, index) => (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;