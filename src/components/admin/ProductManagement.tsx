import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Star, CheckCircle, Package, Download, AlertTriangle, Loader2, RefreshCw, Cloud, CloudOff, LayoutGrid, List, Filter, Image as ImageIcon } from 'lucide-react';
import { Product, dummyStores, dummyPromos, getActivePromoForProduct, calculateDiscountedPrice } from '@/data/adminData';
import { productsService } from '@/lib/supabaseService';
import Modal from './Modal';
import Cropper, { Point, Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [filterDisplay, setFilterDisplay] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  
  // Image crop states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    image: '',
    status: 'active' as 'active' | 'inactive' | 'out_of_stock',
    sku: '',
    uom: '',
    isDisplayed: true,
  });

  const categories = ['Benih', 'Pupuk', 'Alat', 'Pestisida', 'Perlengkapan'];
  const uoms = ['Pcs', 'Kg', 'Pack', 'Botol', 'Liter', 'Zak'];

  useEffect(() => {
    loadProducts();

    const subscription = productsService.subscribe((updatedProducts) => {
      // Inject dummy data if missing
      const productsWithDummyData = updatedProducts.map(p => ({
        ...p,
        sku: p.sku || `TRB-12345-XXXX`,
        uom: p.uom || uoms[Math.floor(Math.random() * uoms.length)],
        isDisplayed: p.isDisplayed !== undefined ? p.isDisplayed : true,
        storeId: p.storeId || (Math.floor(Math.random() * 3) + 1).toString(), // Inject dummy storeId
      }));
      setProducts(productsWithDummyData);
      setIsConnected(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productsService.getAll();
      // Inject dummy data
      const productsWithDummyData = data.map(p => ({
        ...p,
        sku: p.sku || `TRB-${p.id.padStart(4, '0')}`,
        uom: p.uom || uoms[Math.floor(Math.random() * uoms.length)],
        isDisplayed: p.isDisplayed !== undefined ? p.isDisplayed : true,
        storeId: p.storeId || (Math.floor(Math.random() * 3) + 1).toString(), // Inject dummy storeId
      }));
      setProducts(productsWithDummyData);
      setIsConnected(true);
    } catch (error) {
      console.error('Error loading products:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesDisplay = filterDisplay === 'all'
      ? true
      : filterDisplay === 'displayed'
        ? product.isDisplayed === true
        : product.isDisplayed === false;

    const matchesStore = filterStore === 'all' || product.storeId === filterStore;

    return matchesSearch && matchesStatus && matchesCategory && matchesDisplay && matchesStore;
  });

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
      const croppedImage = await getCroppedImg(
        imageSrc as string,
        croppedAreaPixels as Area
      );
      setFormData({ ...formData, image: croppedImage as string });
      setIsCropModalOpen(false);
    } catch (e) {
      console.error(e);
      alert('Gagal memotong gambar');
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        image: product.image,
        status: product.status,
        sku: product.sku || '',
        uom: product.uom || 'Pcs',
        isDisplayed: product.isDisplayed ?? true,
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        category: '',
        price: 0,
        description: '',
        image: '',
        status: 'active',
        sku: `TRB-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        uom: 'Pcs',
        isDisplayed: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const productData = { ...formData };

      if (selectedProduct) {
        await productsService.update(selectedProduct.id, productData);
      } else {
        await productsService.create({
          ...productData,
          sold: 0,
          rating: 0,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      setIsSaving(true);
      try {
        await productsService.delete(selectedProduct.id);
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Gagal menghapus data. Silakan coba lagi.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      out_of_stock: 'bg-red-100 text-red-700',
    };
    const labels = {
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      out_of_stock: 'Stok Habis',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

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
            <button onClick={loadProducts} className="ml-2 underline">Coba lagi</button>
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
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-colors h-11 ${
                [filterStore, filterStatus, filterDisplay, filterCategory].filter(f => f !== 'all').length > 0 
                  ? 'border-green-500 text-green-700 bg-green-50' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
              {[filterStore, filterStatus, filterDisplay, filterCategory].filter(f => f !== 'all').length > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full ml-1 font-semibold">
                  {[filterStore, filterStatus, filterDisplay, filterCategory].filter(f => f !== 'all').length}
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
                <List className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={loadProducts}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg h-11 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg h-11 hover:bg-gray-50 transition-colors hidden sm:flex">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
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
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Berdasarkan Toko</label>
              <select
                value={filterStore}
                onChange={(e) => setFilterStore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-gray-50"
              >
                <option value="all">Semua Toko</option>
                {dummyStores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Status Produk</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-gray-50"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
                <option value="out_of_stock">Stok Habis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Tampilan Layar</label>
              <select
                value={filterDisplay}
                onChange={(e) => setFilterDisplay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-gray-50"
              >
                <option value="all">Semua Tampil</option>
                <option value="displayed">Tampil di Toko</option>
                <option value="hidden">Tidak tampil di toko</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-gray-50"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-500">Memuat data...</span>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpenModal(product)}
            >
              <div className="relative h-48">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <div>{getStatusBadge(product.status)}</div>
                </div>
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${product.isDisplayed ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {product.isDisplayed ? 'Tampil' : 'Sembunyikan'}
                  </span>
                  {(() => {
                    const activePromo = getActivePromoForProduct(product.id, dummyPromos);
                    if (!activePromo) return null;
                    const badge = activePromo.type === 'flash_sale' ? '⚡ Flash Sale' : '🏷️ Promo';
                    const disc = activePromo.discountType === 'percentage' ? `${activePromo.discountValue}%` : `Rp${(activePromo.discountValue/1000).toFixed(0)}K`;
                    return (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                        {badge} -{disc}
                      </span>
                    );
                  })()}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    {product.category}
                  </span>
                  <div className="text-right">
                    {(() => {
                      const activePromo = getActivePromoForProduct(product.id, dummyPromos);
                      if (activePromo) {
                        const discPrice = calculateDiscountedPrice(product.price, activePromo);
                        return (
                          <>
                            <div className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</div>
                            <div className="font-bold text-red-600">{formatCurrency(discPrice)}</div>
                          </>
                        );
                      }
                      return <span className="font-bold text-gray-800">{formatCurrency(product.price)}</span>;
                    })()}
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-800 mt-2 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500 flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">Terjual</span>
                      <span className="font-medium text-gray-700">{product.sold}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Produk</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Kategori</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Harga</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Terjual</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tampil di Toko</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleOpenModal(product)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {(() => {
                        const activePromo = getActivePromoForProduct(product.id, dummyPromos);
                        if (activePromo) {
                          const discPrice = calculateDiscountedPrice(product.price, activePromo);
                          const badge = activePromo.type === 'flash_sale' ? '⚡' : '🏷️';
                          return (
                            <div>
                              <div className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</div>
                              <div className="font-bold text-red-600">{formatCurrency(discPrice)}</div>
                              <div className="text-xs text-orange-600 font-semibold mt-0.5">
                                {badge} {activePromo.discountType === 'percentage' ? `-${activePromo.discountValue}%` : `-${formatCurrency(activePromo.discountValue)}`}
                              </div>
                            </div>
                          );
                        }
                        return formatCurrency(product.price);
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product.sold}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.isDisplayed
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {product.isDisplayed ? 'Iya' : 'Tidak'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada produk ditemukan</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Masukkan nama produk"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Kode SKU"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UOM (Satuan)</label>
                  <select
                    value={formData.uom}
                    onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {uoms.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDisplayed"
                  checked={formData.isDisplayed}
                  onChange={(e) => setFormData({ ...formData, isDisplayed: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isDisplayed" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                  Tampilkan di Toko
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'out_of_stock' })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                    <option value="out_of_stock">Stok Habis</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors bg-gray-50">
              <div className="space-y-1 text-center">
                {formData.image ? (
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden border border-gray-200">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-1 right-1 p-1 bg-white rounded-full text-red-600 shadow-sm hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                  >
                    <span>Upload file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={onFileChange} />
                  </label>
                  <p className="pl-1">&nbsp;atau drag & drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
            {/* Fallback url input */}
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
              <span>Atau URL:</span>
              <input
                type="text"
                value={formData.image.startsWith('http') ? formData.image : ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Deskripsi produk"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {selectedProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-700 mb-6">
            Apakah Anda yakin ingin menghapus produk <strong>"{selectedProduct?.name}"</strong>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Hapus
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Crop Modal */}
      <Modal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        title="Potong Gambar Produk (1:1)"
        size="lg"
      >
        <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden" style={{ touchAction: 'none' }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </div>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 w-16">Zoom</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 rounded-lg"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setIsCropModalOpen(false)}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleCropImage}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Terapkan
          </button>
        </div>
      </Modal>
    </div>
  );
};
