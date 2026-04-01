import React, { useState, useEffect } from 'react';
import {
  Clock, Package, Truck, CheckCircle, XCircle,
  Cloud, CloudOff, Search, RefreshCw, Download,
  Loader2, Eye, Filter
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Order, dummyStores, dummyOrders, dummyPromos } from '@/data/adminData';
import { ordersService } from '@/lib/supabaseService';
import { formatDateOnly } from '@/lib/date';
import Modal from './Modal';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const getOrderTypeMeta = (orderType: Order['orderType']) => {
  if (orderType === 'pickup') {
    return {
      label: 'Jemput di Toko',
      badge: 'bg-sky-100 text-sky-700',
    };
  }

  return {
    label: 'Dikirim',
    badge: 'bg-emerald-100 text-emerald-700',
  };
};

const OrderManagement: React.FC = () => {
  const { user } = useAppContext();
  // Inisialisasi dengan data dummy agar UI langsung terisi
  const [orders, setOrders] = useState<Order[]>(dummyOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    loadOrders();

    const subscription = ordersService.subscribe((updatedOrders) => {
      setOrders(updatedOrders);
      setIsConnected(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await ordersService.getAll();
      setOrders(data);
      setIsConnected(true);
    } catch (error) {
      console.error('Error loading orders:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };


  const filteredOrders = orders.filter(order => {
    // RBAC Filter: If store_admin, only show orders from their store
    if (user?.role === 'store_admin' && user.storeId && order.storeId !== user.storeId) {
      return false;
    }

    // Store Filter (Super Admin)
    if (user?.role !== 'store_admin' && selectedStore !== 'all' && order.storeId !== selectedStore) {
      return false;
    }

    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleStatusChange = async (order: Order, newStatus: Order['status']) => {
    try {
      await ordersService.update(order.id, { status: newStatus });

      // Update local state untuk feedback instan
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));

      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePaymentStatusChange = async (order: Order, newStatus: Order['paymentStatus']) => {
    try {
      await ordersService.update(order.id, { paymentStatus: newStatus });

      // Update local state
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, paymentStatus: newStatus } : o));

      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pending: 'Menunggu',
      processing: 'Diproses',
      shipped: 'Dikirim',
      delivered: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      unpaid: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
    };
    const labels: Record<string, string> = {
      paid: 'Lunas',
      unpaid: 'Belum Bayar',
      refunded: 'Dikembalikan',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'processing': return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const getStoreName = (storeId: string) => {
    return dummyStores.find((store) => store.id === storeId)?.name ?? 'Toko tidak diketahui';
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Connection Status */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors duration-300 ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {isConnected ? (
          <>
            <Cloud className="w-4 h-4" />
            <span>Terhubung ke database - Real-time sync aktif</span>
          </>
        ) : (
          <>
            <CloudOff className="w-4 h-4" />
            <span>Mode Offline - Menampilkan data lokal/dummy</span>
            <button onClick={loadOrders} className="ml-2 underline font-bold">Coba lagi</button>
          </>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Menunggu', count: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Diproses', count: stats.processing, icon: Package, color: 'blue' },
          { label: 'Dikirim', count: stats.shipped, icon: Truck, color: 'purple' },
          { label: 'Selesai', count: stats.delivered, icon: CheckCircle, color: 'green' },
          { label: 'Dibatalkan', count: stats.cancelled, icon: XCircle, color: 'red' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${item.color}-100 rounded-lg`}>
                <item.icon className={`w-5 h-5 text-${item.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{item.count}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari No. Pesanan atau Nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all h-11"
              />
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-colors h-11 ${
                [user?.role !== 'store_admin' ? selectedStore : 'all', filterStatus, filterPayment].filter(f => f !== 'all').length > 0 
                  ? 'border-green-500 text-green-700 bg-green-50' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
              {[user?.role !== 'store_admin' ? selectedStore : 'all', filterStatus, filterPayment].filter(f => f !== 'all').length > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full ml-1 font-semibold">
                  {[user?.role !== 'store_admin' ? selectedStore : 'all', filterStatus, filterPayment].filter(f => f !== 'all').length}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadOrders}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg h-11 hover:bg-gray-50 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg h-11 hover:bg-green-700 transition-colors">
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Filter Drawer */}
        {showFilters && (
          <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
            {user?.role !== 'store_admin' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Toko</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-gray-50"
                >
                  <option value="all">Semua Toko</option>
                  {dummyStores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Status Pesanan</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-gray-50"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="processing">Diproses</option>
                <option value="shipped">Dikirim</option>
                <option value="delivered">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Status Pembayaran</label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-gray-50"
              >
                <option value="all">Semua Pembayaran</option>
                <option value="paid">Lunas</option>
                <option value="unpaid">Belum Bayar</option>
                <option value="refunded">Dikembalikan</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
            <span className="ml-3 text-gray-500 font-medium">Sinkronisasi data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">No. Pesanan</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Pelanggan</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tanggal</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Jenis Pesanan</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Diskon</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Pembayaran</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{order.items.length} item dipesan</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateOnly(order.orderDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getOrderTypeMeta(order.orderType).badge}`}>
                        {getOrderTypeMeta(order.orderType).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const promo = order.promoId ? dummyPromos.find(p => p.id === order.promoId) : null;
                        if (promo || order.discountAmount) {
                          return (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-red-600">
                                -{formatCurrency(order.discountAmount || 0)}
                              </span>
                              {promo && (
                                <span className="text-xs text-orange-600">
                                  {promo.type === 'flash_sale' ? '⚡' : '🏷️'} {promo.name}
                                </span>
                              )}
                            </div>
                          );
                        }
                        return <span className="text-xs text-gray-400">-</span>;
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {getPaymentBadge(order.paymentStatus)}
                        <span className="text-[10px] text-gray-400 font-medium uppercase">{order.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        {getStatusBadge(order.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredOrders.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium">Pesanan tidak ditemukan</h3>
            <p className="text-gray-500 text-sm">Coba ubah kata kunci atau filter Anda.</p>
          </div>
        )}
      </div>

      {/* Modal Detail tetap sama seperti kode Anda sebelumnya */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Transaksi"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-200">
            {/* ... bagian dalam modal ... */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">{selectedOrder.orderNumber}</h3>
                <p className="text-sm text-gray-500">{formatDateOnly(selectedOrder.orderDate)}</p>
              </div>
              <div className="text-right">
                {getStatusBadge(selectedOrder.status)}
                <p className="text-xs text-gray-400 mt-1">{selectedOrder.paymentMethod}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Informasi Pembeli</p>
                <p className="font-bold text-gray-800">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-600">{selectedOrder.customerEmail}</p>
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase">Jenis Pesanan</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getOrderTypeMeta(selectedOrder.orderType).badge}`}>
                    {getOrderTypeMeta(selectedOrder.orderType).label}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    {selectedOrder.orderType === 'pickup' ? 'Lokasi Penjemputan' : 'Alamat Pengiriman'}
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    {selectedOrder.orderType === 'pickup'
                      ? `${getStoreName(selectedOrder.storeId)} - ${selectedOrder.shippingAddress}`
                      : selectedOrder.shippingAddress}
                  </p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-600 uppercase mb-2">Ringkasan Pembayaran</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  {getPaymentBadge(selectedOrder.paymentStatus)}
                </div>
                {selectedOrder.originalTotal && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Harga Asal:</span>
                    <span className="text-sm text-gray-400 line-through">{formatCurrency(selectedOrder.originalTotal)}</span>
                  </div>
                )}
                {selectedOrder.discountAmount && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Diskon Promo:</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Total Tagihan:</span>
                  <span className="font-bold text-green-700">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Item yang dibeli</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-3 border rounded-lg bg-white">
                    <span>{item.name} <b className="text-green-600">x{item.qty}</b></span>
                    <span className="font-medium">{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Ubah Status Pesanan:</p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedOrder, s as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${selectedOrder.status === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
