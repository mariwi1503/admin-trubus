import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Star, Package, Download, AlertTriangle, Loader2, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Product } from '@/data/adminData';
import { productsService } from '@/lib/supabaseService';
import Modal from './Modal';

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
  const [filterDisplay, setFilterDisplay] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
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

    return matchesSearch && matchesStatus && matchesCategory && matchesDisplay;
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
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
        stock: 0,
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
      const productData = {
        ...formData,
        status: formData.stock === 0 ? 'out_of_stock' as const : formData.status,
      };

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

  const handleStockUpdate = async (product: Product, newStock: number) => {
    try {
      await productsService.update(product.id, {
        stock: newStock,
        status: newStock === 0 ? 'out_of_stock' : product.status
      });
    } catch (error) {
      console.error('Error updating stock:', error);
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

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);

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

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Peringatan Stok Rendah</p>
            <p className="text-sm text-amber-700 mt-1">
              {lowStockProducts.length} produk memiliki stok rendah (≤10): {lowStockProducts.map(p => p.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
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

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="out_of_stock">Stok Habis</option>
          </select>

          <select
            value={filterDisplay}
            onChange={(e) => setFilterDisplay(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Semua Tampilan</option>
            <option value="displayed">Tampil di Toko</option>
            <option value="hidden">Disembunyikan</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadProducts}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-500">Memuat data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Produk</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Kategori</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Harga</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Stok</th>
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
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          value={product.stock}
                          onChange={(e) => handleStockUpdate(product, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          min="0"
                        />
                        {product.stock <= 10 && product.stock > 0 && (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
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
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>

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

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://example.com/image.jpg"
            />
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
    </div>
  );
};
