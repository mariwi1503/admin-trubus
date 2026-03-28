import React, { useState, useEffect } from 'react';
import { Store } from '@/data/adminData';
import { ChevronLeft, Save, MapPin, Store as StoreIcon, User, Phone, Info } from 'lucide-react';

interface StoreDetailProps {
    store: Store | null;
    onBack: () => void;
    onSave: (store: Partial<Store>, isEdit: boolean) => void;
}

const StoreDetail: React.FC<StoreDetailProps> = ({ store, onBack, onSave }) => {
    const isEditMode = !!store;
    const [formData, setFormData] = useState<Partial<Store>>({
        name: '',
        location: '',
        managerName: '',
        contactPhone: '',
        status: 'active',
        mapUrl: ''
    });

    useEffect(() => {
        if (store) {
            setFormData({
                name: store.name,
                location: store.location,
                managerName: store.managerName,
                contactPhone: store.contactPhone,
                status: store.status,
                mapUrl: store.mapUrl || ''
            });
        }
    }, [store]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, isEditMode);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                        title="Kembali"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {isEditMode ? 'Detail Toko' : 'Tambah Toko Baru'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isEditMode ? 'Lihat dan edit informasi lengkap toko' : 'Lengkapi informasi untuk menambahkan toko baru'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Form Fields */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-gray-800">Informasi Dasar</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                        <StoreIcon className="w-4 h-4 text-gray-400" /> Nama Toko
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                        placeholder="Contoh: Toko Trubus Pusat"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" /> Manager Toko
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.managerName}
                                        onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                        placeholder="Nama Lengkap Manager"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" /> Kontak Telepon
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.contactPhone}
                                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                        placeholder="Contoh: 0812-3456-7890"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" /> Alamat Lengkap
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all resize-none"
                                        placeholder="Masukkan alamat lengkap dengan jalan, nomor, kota, provinsi dan kode pos"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center gap-2">
                            <StoreIcon className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-gray-800">Status Operasional</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg flex-1 hover:bg-gray-50">
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        value="active" 
                                        checked={formData.status === 'active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-green-700">Aktif</p>
                                        <p className="text-xs text-gray-500">Toko beroperasi normal</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg flex-1 hover:bg-gray-50">
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        value="inactive" 
                                        checked={formData.status === 'inactive'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-red-700">Tidak Aktif</p>
                                        <p className="text-xs text-gray-500">Toko ditutup sementara/permanen</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Map Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-600" />
                                <h3 className="font-semibold text-gray-800">Pratinjau Peta</h3>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {(formData.name || formData.location || formData.mapUrl) ? (
                                <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.mapUrl || (formData.name + ' ' + formData.location))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="w-full h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 px-6 text-center">
                                    <MapPin className="w-10 h-10 mb-2 opacity-50" />
                                    <p className="text-sm font-medium">Isi Nama dan Alamat</p>
                                    <p className="text-xs mt-1">Peta akan otomatis muncul berdasar nama/alamat yang diisi</p>
                                </div>
                            )}
                            
                            <div className="pt-2 border-t border-gray-100">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                                    <span>Tautan Maps Manual</span>
                                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Opsional</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.mapUrl || ''}
                                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                    placeholder="Tempel tautan Google Maps di sini..."
                                />
                                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                    Jika lokasi otomatis kurang akurat, Anda bisa menyalin tautan dari Google Maps dan menempelkannya di sini.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default StoreDetail;
