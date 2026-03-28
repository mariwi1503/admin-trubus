import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag, Zap, Plus, Search, Edit2, Trash2, Eye,
  Calendar, Clock, Package, ChevronDown, CheckCircle,
  AlertCircle, Timer, BarChart2, Filter, Save, Copy, LayoutGrid, List as ListIcon, Loader2, RefreshCw, Cloud, CloudOff, Image as ImageIcon
} from 'lucide-react';
import {
  Promo, dummyPromos, dummyProducts,
  calculateDiscountedPrice
} from '../../data/adminData';
import Modal from './Modal';
import Cropper, { Point, Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const toInputDatetime = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// --- Countdown Timer Component ---
const CountdownTimer: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Berakhir'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <span className="font-mono text-orange-600 font-bold text-sm flex items-center gap-1">
      <Timer className="w-3.5 h-3.5" />
      {timeLeft}
    </span>
  );
};

// --- Status Badge ---
const StatusBadge: React.FC<{ status: Promo['status'] }> = ({ status }) => {
  const config = {
    active:    { label: 'Aktif',      className: 'bg-green-100 text-green-700' },
    scheduled: { label: 'Terjadwal', className: 'bg-blue-100 text-blue-700' },
    ended:     { label: 'Berakhir',  className: 'bg-gray-100 text-gray-700' },
    draft:     { label: 'Draft',     className: 'bg-amber-100 text-amber-700' },
  };
  const { label, className } = config[status];
  return <span className={`text-xs font-medium px-3 py-1 rounded-full ${className}`}>{label}</span>;
};

// --- Type Badge ---
const TypeBadge: React.FC<{ type: Promo['type'] }> = ({ type }) => (
  type === 'flash_sale'
    ? <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700"><Zap className="w-3 h-3" />Flash Sale</span>
    : <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700"><Tag className="w-3 h-3" />Promo</span>
);

// --- Empty Form State ---
const emptyForm = (): Omit<Promo, 'id'> => ({
  name: '',
  description: '',
  type: 'promo',
  discountType: 'percentage',
  discountValue: 10,
  maxDiscountAmount: undefined,
  minOrderAmount: undefined,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  status: 'draft',
  applicableProducts: [],
  storeId: undefined,
  usageLimit: undefined,
  usageCount: 0,
  banner: '',
});

// --- Main Component ---
const PromoManagement: React.FC = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'flash_sale' | 'promo'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Promo['status']>('all');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [viewingPromo, setViewingPromo] = useState<Promo | null>(null);
  const [form, setForm] = useState<Omit<Promo, 'id'>>(emptyForm());
  const [productSearch, setProductSearch] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Image Crop States
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setIsCropModalOpen(true);
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropImage = async () => {
    try {
      setIsCropping(true);
      const croppedImage = await getCroppedImg(
        imageSrc as string,
        croppedAreaPixels as Area
      );
      setForm(f => ({ ...f, banner: croppedImage }));
      setIsCropModalOpen(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCropping(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    setIsLoading(true);
    // Mock DB fetch for promos
    setTimeout(() => {
      setPromos(dummyPromos);
      setIsConnected(true);
      setIsLoading(false);
    }, 500);
  };

  // Filter promos
  const filtered = promos.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || p.type === filterType;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    active: promos.filter(p => p.status === 'active').length,
    scheduled: promos.filter(p => p.status === 'scheduled').length,
    flashSale: promos.filter(p => p.type === 'flash_sale' && p.status === 'active').length,
    totalUsage: promos.reduce((a, p) => a + p.usageCount, 0),
  };

  const openCreate = () => {
    setEditingPromo(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (promo: Promo) => {
    setEditingPromo(promo);
    setForm({ ...promo } as Omit<Promo, 'id'>);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    setIsSaving(true);
    setTimeout(() => {
      if (editingPromo) {
        setPromos(prev => prev.map(p => p.id === editingPromo.id ? { ...form, id: editingPromo.id } : p));
      } else {
        const newPromo: Promo = { ...form, id: String(Date.now()) };
        setPromos(prev => [newPromo, ...prev]);
      }
      setShowForm(false);
      setEditingPromo(null);
      setIsSaving(false);
    }, 400);
  };

  const handleDelete = (id: string) => {
    setIsSaving(true);
    setTimeout(() => {
      setPromos(prev => prev.filter(p => p.id !== id));
      setShowDeleteConfirm(null);
      setIsSaving(false);
    }, 400);
  };

  const handleDuplicate = (promo: Promo) => {
    const dup: Promo = { ...promo, id: String(Date.now()), name: `${promo.name} (Salinan)`, status: 'draft', usageCount: 0 };
    setPromos(prev => [dup, ...prev]);
  };

  const toggleProductInForm = (productId: string) => {
    if (form.applicableProducts === 'all') return;
    const list = form.applicableProducts as string[];
    setForm(f => ({
      ...f,
      applicableProducts: list.includes(productId) ? list.filter(id => id !== productId) : [...list, productId]
    }));
  };

  const selectedProductIds = form.applicableProducts === 'all' ? [] : form.applicableProducts as string[];
  const filteredProducts = dummyProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {isConnected ? (
          <>
            <Cloud className="w-4 h-4" />
            <span>Terhubung ke database - Real-time sync aktif</span>
          </>
        ) : (
          <>
            <CloudOff className="w-4 h-4" />
            <span>Tidak terhubung ke database</span>
            <button onClick={loadPromos} className="ml-2 underline">Coba lagi</button>
          </>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari promo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-colors h-11 ${
                [filterType, filterStatus].filter(f => f !== 'all').length > 0 
                  ? 'border-green-500 text-green-700 bg-green-50' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
              {[filterType, filterStatus].filter(f => f !== 'all').length > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full ml-1 font-semibold">
                  {[filterType, filterStatus].filter(f => f !== 'all').length}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <div className="flex xl:items-center bg-gray-100 rounded-lg p-1 border border-gray-200 h-11 hidden sm:flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Tampilan List"
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={loadPromos}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg h-11 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors h-11"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Tambah</span>
            </button>
          </div>
        </div>

        {/* Filter Drawer */}
        {showFilters && (
          <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Tipe Promo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-gray-50"
              >
                <option value="all">Semua Tipe</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="promo">Promo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Status Promo</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-gray-50"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="scheduled">Terjadwal</option>
                <option value="draft">Draft</option>
                <option value="ended">Berakhir</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Promo Aktif', value: stats.active, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'Flash Sale Aktif', value: stats.flashSale, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'Terjadwal', value: stats.scheduled, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Total Penggunaan', value: stats.totalUsage, icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-xl p-4 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 font-medium">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-500">Memuat data...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Tidak ada promo ditemukan</p>
          <p className="text-gray-400 text-sm mt-1">Coba ubah filter atau buat promo baru</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(promo => {
            const isFlashSale = promo.type === 'flash_sale';
            const productCount = promo.applicableProducts === 'all' ? dummyProducts.length : (promo.applicableProducts as string[]).length;
            const usagePercent = promo.usageLimit ? Math.round((promo.usageCount / promo.usageLimit) * 100) : null;

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer overflow-hidden ${isFlashSale && promo.status === 'active' ? 'border-orange-200' : 'border-gray-100'}`}
                onClick={() => setViewingPromo(promo)}
              >
                {/* Top Banner like Article */}
                <div className="relative h-48 bg-gray-50 shrink-0 border-b border-gray-100">
                  {promo.banner ? (
                    <img src={promo.banner} alt={promo.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100/50">
                      <ImageIcon className="w-12 h-12 mb-2 text-gray-300" />
                      <span className="text-sm font-medium text-gray-400">Tanpa Banner</span>
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <TypeBadge type={promo.type} />
                    <StatusBadge status={promo.status} />
                  </div>
                  {/* Flash sale accent */}
                  {isFlashSale && promo.status === 'active' && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400" />
                  )}
                  {isFlashSale && promo.status === 'active' && (
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm border border-orange-100">
                      <CountdownTimer targetDate={promo.endDate} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <h3 className="font-semibold text-gray-800 line-clamp-2">{promo.name}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-[40px]">{promo.description}</p>
                  
                  {/* Discount label */}
                  <div className="mt-4 inline-flex items-start gap-1.5">
                    <span className="text-lg font-bold text-green-700">
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}%`
                        : formatRupiah(promo.discountValue)}
                    </span>
                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest leading-none mt-1.5">
                      {promo.discountType === 'percentage' ? 'OFF' : 'Potongan'}
                      {promo.maxDiscountAmount && <><br /><span className="text-[10px] font-medium text-green-600/70 lowercase tracking-normal">maks {formatRupiah(promo.maxDiscountAmount)}</span></>}
                    </span>
                  </div>

                  {/* Footer: Info & Actions */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5" />
                          {productCount} Produk
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BarChart2 className="w-3.5 h-3.5" />
                          {promo.usageCount} digunakan {promo.usageLimit ? `(maks ${promo.usageLimit})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(promo.endDate)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(promo)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(promo)}
                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Duplikasi"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(promo.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Usage progress bar */}
                  {usagePercent !== null && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Penggunaan Kuota</span>
                        <span className={usagePercent >= 80 ? 'text-red-500 font-semibold' : ''}>{usagePercent}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${usagePercent >= 80 ? 'bg-red-400' : usagePercent >= 50 ? 'bg-amber-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Min order */}
                  {promo.minOrderAmount && (
                    <div className="mt-2 text-xs text-gray-400">
                      Min. belanja: <span className="font-semibold text-gray-600">{formatRupiah(promo.minOrderAmount)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Promo</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Diskon</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Periode</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(promo => {
                  return (
                    <tr
                      key={promo.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setViewingPromo(promo)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <p className="font-semibold text-gray-800 line-clamp-1">{promo.name}</p>
                          <div className="flex flex-wrap gap-2">
                            <TypeBadge type={promo.type} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-green-700">
                          {promo.discountType === 'percentage'
                            ? `${promo.discountValue}%`
                            : formatRupiah(promo.discountValue)}
                        </div>
                        {promo.maxDiscountAmount && (
                          <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                            Maks {formatRupiah(promo.maxDiscountAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 min-w-[150px]">
                        <div className="text-sm text-gray-700 whitespace-nowrap">
                          {formatDate(promo.startDate)}
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(promo.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={promo.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEdit(promo)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(promo)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Duplikasi"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(promo.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================== CREATE / EDIT FORM MODAL ======================== */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingPromo ? 'Edit Promo' : 'Buat Promo Baru'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Promo <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Flash Sale Hari Tani"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Jelaskan detail promo..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-[134px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Promo</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors bg-gray-50 h-[100px] items-center">
                  <div className="space-y-1 text-center w-full">
                    {form.banner ? (
                      <div className="relative w-full h-24 mx-auto rounded-lg overflow-hidden border border-gray-200">
                        <img src={form.banner} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, banner: '' })}
                          className="absolute top-1 right-1 p-1 bg-white rounded-full text-red-600 shadow-sm hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none px-2 py-1 flex flex-col items-center"
                          >
                            <ImageIcon className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                            <span>Upload Banner</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={onFileChange} />
                          </label>
                        </div>
                        <p className="text-[10px] text-gray-500">16:9 (aspect ratio)</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Fallback url input */}
                <div className="mt-1 text-[11px] text-gray-500 flex items-center gap-2">
                  <span>URL:</span>
                  <input
                    type="text"
                    value={form.banner && form.banner.startsWith('http') ? form.banner : ''}
                    onChange={(e) => setForm({ ...form, banner: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Promo</label>
                <div className="flex gap-2">
                  {(['promo', 'flash_sale'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.type === t ? (t === 'flash_sale' ? 'bg-orange-500 text-white border-orange-500' : 'bg-indigo-600 text-white border-indigo-600') : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      {t === 'flash_sale' ? '⚡ Flash Sale' : '🏷️ Promo'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Promo['status'] }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Terjadwal</option>
                    <option value="active">Aktif</option>
                    <option value="ended">Berakhir</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diskon</label>
              <div className="flex gap-2 mb-2">
                {(['percentage', 'fixed'] as const).map(dt => (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, discountType: dt }))}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${form.discountType === dt ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    {dt === 'percentage' ? 'Persentase (%)' : 'Nominal (Rp)'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))}
                    placeholder={form.discountType === 'percentage' ? 'Contoh: 20' : 'Contoh: 50000'}
                    min={0}
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">
                    {form.discountType === 'percentage' ? '%' : 'Rp'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={form.maxDiscountAmount ?? ''}
                    onChange={e => setForm(f => ({ ...f, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Maks. potongan (opsional)"
                    min={0}
                    className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    disabled={form.discountType === 'fixed'}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Belanja (Rp)</label>
                <input
                  type="number"
                  value={form.minOrderAmount ?? ''}
                  onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="Opsional"
                  min={0}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batas Penggunaan</label>
                <input
                  type="number"
                  value={form.usageLimit ?? ''}
                  onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="Batas kuota, opsional"
                  min={0}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
                <input
                  type="datetime-local"
                  value={toInputDatetime(form.startDate)}
                  onChange={e => setForm(f => ({ ...f, startDate: new Date(e.target.value).toISOString() }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Berakhir</label>
                <input
                  type="datetime-local"
                  value={toInputDatetime(form.endDate)}
                  onChange={e => setForm(f => ({ ...f, endDate: new Date(e.target.value).toISOString() }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Berlaku untuk Produk</label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, applicableProducts: 'all' }))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.applicableProducts === 'all' ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Semua Produk
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, applicableProducts: [] }))}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.applicableProducts !== 'all' ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Pilih Produk Khusus
                </button>
              </div>

              {form.applicableProducts !== 'all' && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari produk..."
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">{selectedProductIds.length} produk dipilih</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 bg-white">
                    {filteredProducts.map(prod => {
                      const isSelected = selectedProductIds.includes(prod.id);
                      return (
                        <label
                          key={prod.id}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-green-50/50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProductInForm(prod.id)}
                            className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <img src={prod.image} alt={prod.name} className="w-8 h-8 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">{prod.name}</div>
                            <div className="text-xs text-gray-500">{formatRupiah(prod.price)}</div>
                          </div>
                          {isSelected && (
                            <div className="text-xs text-green-600 font-semibold px-2 py-1 bg-green-100 rounded">
                              → {formatRupiah(calculateDiscountedPrice(prod.price, { ...(form as unknown as Promo), id: '0' }))}
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim() || isSaving}
              className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingPromo ? 'Simpan Perubahan' : 'Buat Promo'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================== VIEW DETAIL MODAL ======================== */}
      <Modal
        isOpen={!!viewingPromo}
        onClose={() => setViewingPromo(null)}
        title="Detail Promo"
        size="lg"
      >
        {viewingPromo && (
          <div className="space-y-4">
            {viewingPromo.banner && (
              <div className="w-full h-40 sm:h-56 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                <img src={viewingPromo.banner} alt={viewingPromo.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <TypeBadge type={viewingPromo.type} />
              <StatusBadge status={viewingPromo.status} />
              {viewingPromo.status === 'active' && viewingPromo.type === 'flash_sale' && (
                <CountdownTimer targetDate={viewingPromo.endDate} />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{viewingPromo.name}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{viewingPromo.description}</p>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 py-2">
              {[
                { label: 'Jenis Diskon', value: viewingPromo.discountType === 'percentage' ? `${viewingPromo.discountValue}%` : formatRupiah(viewingPromo.discountValue) },
                { label: 'Maks. Potongan', value: viewingPromo.maxDiscountAmount ? formatRupiah(viewingPromo.maxDiscountAmount) : '-' },
                { label: 'Min. Belanja', value: viewingPromo.minOrderAmount ? formatRupiah(viewingPromo.minOrderAmount) : '-' },
                { label: 'Penggunaan', value: viewingPromo.usageLimit ? `${viewingPromo.usageCount} / ${viewingPromo.usageLimit}` : `${viewingPromo.usageCount} (tanpa batas)` },
                { label: 'Mulai', value: formatDate(viewingPromo.startDate) },
                { label: 'Berakhir', value: formatDate(viewingPromo.endDate) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-500 font-medium">{label}</div>
                  <div className="text-sm font-semibold text-gray-800 mt-1">{value}</div>
                </div>
              ))}
            </div>

            {/* Produk terlibat */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-green-600" />
                Daftar Produk yang Berlaku
              </p>
              {viewingPromo.applicableProducts === 'all' ? (
                <p className="text-sm text-green-700 font-medium bg-green-50 px-4 py-2.5 rounded-lg border border-green-100 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Berlaku untuk Semua Produk
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50">
                  {(viewingPromo.applicableProducts as string[]).map(pid => {
                    const prod = dummyProducts.find(p => p.id === pid);
                    if (!prod) return null;
                    const discounted = calculateDiscountedPrice(prod.price, viewingPromo);
                    return (
                      <div key={pid} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
                        <img src={prod.image} alt={prod.name} className="w-8 h-8 rounded border border-gray-200 object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{prod.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 line-through">{formatRupiah(prod.price)}</span>
                            <span className="text-xs font-bold text-green-600">{formatRupiah(discounted)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => { setViewingPromo(null); openEdit(viewingPromo); }}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Edit Promo
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================== DELETE CONFIRM MODAL ======================== */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-700 mb-6 font-medium">
            Hapus promo ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3">
            <button 
              disabled={isSaving}
              onClick={() => setShowDeleteConfirm(null)} 
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button 
              disabled={isSaving}
              onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)} 
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex justify-center items-center gap-2 transition-colors"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Hapus
            </button>
          </div>
        </div>
      </Modal>
      {/* ======================== CROP MODAL ======================== */}
      <Modal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        title="Potong Banner"
        size="md"
      >
        <div className="relative h-64 sm:h-80 w-full bg-gray-900 rounded-lg overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setIsCropModalOpen(false)}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleCropImage}
            disabled={isCropping}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isCropping && <Loader2 className="w-4 h-4 animate-spin" />}
            Terapkan
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PromoManagement;
