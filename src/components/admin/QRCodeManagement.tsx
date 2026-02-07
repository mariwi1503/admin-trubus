import React, { useState, useEffect, useRef } from 'react';
import { Search, Printer, Download, QrCode, X, Edit2, Eye, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Product } from '@/data/adminData';
import { productsService } from '@/lib/supabaseService';
import Modal from './Modal';
import { useReactToPrint } from 'react-to-print';

interface ProductWithQR extends Product {
    qrCode?: string;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const QRCodeManagement: React.FC = () => {
    const [products, setProducts] = useState<ProductWithQR[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductWithQR | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(true);
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
    const [isSaving, setIsSaving] = useState(false);


    const categories = ['Benih', 'Pupuk', 'Alat', 'Pestisida', 'Perlengkapan'];
    const uoms = ['Pcs', 'Kg', 'Pack', 'Botol', 'Liter', 'Zak'];
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadProducts();
        const subscription = productsService.subscribe((updatedProducts) => {
            setProducts(prevProducts => {
                return updatedProducts.map(p => ({
                    ...p,
                    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${p.id}`,
                    sku: p.sku || `TRB-12345-XXXX-120AAA`,
                    uom: p.uom || uoms[Math.floor(Math.random() * uoms.length)],
                    isDisplayed: p.isDisplayed !== undefined ? p.isDisplayed : true,
                }));
            });
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
            const productsWithQR = data.map(p => ({
                ...p,
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${p.id}`,
                sku: p.sku || `TRB-12345-XXXX-120AAA`,
                uom: p.uom || uoms[Math.floor(Math.random() * uoms.length)],
                isDisplayed: p.isDisplayed !== undefined ? p.isDisplayed : true,
            }));
            setProducts(productsWithQR);
            setIsConnected(true);
        } catch (error) {
            console.error('Error loading products:', error);
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
    });

    const handleDownload = async () => {
        if (selectedProduct?.qrCode) {
            try {
                const response = await fetch(selectedProduct.qrCode);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `qrcode-${selectedProduct.name.replace(/\s+/g, '-').toLowerCase()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading QR code:', error);
            }
        }
    };

    const handleEditClick = (product: ProductWithQR) => {
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
        setIsEditModalOpen(true);
    }

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const productData = {
                ...formData,
                status: formData.stock === 0 ? 'out_of_stock' as const : formData.status,
            };

            if (selectedProduct) {
                await productsService.update(selectedProduct.id, productData);
            }
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Gagal menyimpan data. Silakan coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

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

                <button
                    onClick={loadProducts}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Kode Barang/SKU</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nama Barang</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">UOM</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Kategori</th>
                                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((product) => (
                                <tr
                                    key={product.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setIsDetailModalOpen(true);
                                    }}
                                >


                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-700 font-mono">
                                            {product.sku}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            /> */}
                                            <div>
                                                <p className="font-medium text-gray-800">{product.name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{product.uom}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleEditClick(product)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setIsDetailModalOpen(true);
                                                    // setTimeout(() => handlePrint(), 500); // Optional: auto print
                                                }}
                                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                title="Print QR"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail QR Code Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail QR Code"
                size="md"
            >
                <div className="flex flex-col items-center">
                    {/* Printable Area */}
                    <div className="w-full flex justify-center mb-6">
                        <div ref={printRef} className="print-area p-8 bg-white flex flex-col items-center w-full max-w-[350px]">
                            <div className="border border-gray-200 p-6 rounded-xl w-full text-center relative overflow-hidden shadow-sm">
                                {/* Background Pattern */}
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-green-600"></div>

                                <h2 className="text-2xl font-bold text-green-800 mb-1 tracking-wider">TRUBUS</h2>
                                <p className="text-[10px] font-semibold text-green-600 mb-6 uppercase tracking-widest">Solusi Pertanian Anda</p>

                                <div className="bg-white inline-block mb-4">
                                    {selectedProduct?.qrCode && (
                                        <img
                                            src={selectedProduct?.qrCode}
                                            alt="QR Code"
                                            className="w-40 h-40 object-contain mix-blend-multiply"
                                        />
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{selectedProduct?.name}</h3>
                                <div className="flex flex-col items-center gap-1 mb-4">
                                    <p className="text-sm font-bold text-gray-600">SKU: {selectedProduct?.sku}</p>
                                    <p className="text-sm font-medium text-gray-500">Satuan: {selectedProduct?.uom}</p>
                                    <p className="text-xs font-medium text-gray-400 mt-1">
                                        {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                    </p>
                                </div>

                                <p className="text-[10px] text-gray-400 mt-2 pt-3 border-t border-gray-100">
                                    Scan untuk detail produk dan pemesanan
                                </p>
                                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-green-600"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full">
                        <button
                            // @ts-ignore
                            onClick={handlePrint}
                            className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Print Label
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal (reused form) */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Produk"
                size="lg"
            >
                <div className="space-y-4">
                    <div className="space-y-4">
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

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDisplayedQR"
                                checked={formData.isDisplayed}
                                onChange={(e) => setFormData({ ...formData, isDisplayed: e.target.checked })}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <label htmlFor="isDisplayedQR" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
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
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isSaving}
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            Import Perubahan
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Helper for loading icon
function Loader2(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}

export default QRCodeManagement;
