import React, { useState, useEffect } from 'react';
import { User, dummyOrders } from '@/data/adminData';
import { ChevronLeft, Save, User as UserIcon, Phone, Mail, Shield, ShieldCheck, Activity, ShoppingBag, Coins, MessageSquare, ExternalLink, MapPin } from 'lucide-react';

interface UserDetailProps {
    user: User | null;
    onBack: () => void;
    onSave: (userData: Partial<User>, isEdit: boolean) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

// Simulate random consultation history
const generateDummyConsultations = (userId: string) => {
    const hasConsultations = parseInt(userId) % 2 === 0; // Just for variation
    if (!hasConsultations) return [];
    
    return [
        { id: '1', date: '2024-03-20', expert: 'Dr. Agus Setiawan', topic: 'Cara Menanam Padi Organik', status: 'Selesai' },
        { id: '2', date: '2024-02-15', expert: 'Prof. Bambang Kusuma', topic: 'Penanganan Hama Wereng', status: 'Selesai' },
    ];
};

const UserDetail: React.FC<UserDetailProps> = ({ user, onBack, onSave }) => {
    const isEditMode = !!user;
    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        status: 'active',
        province: '',
        city: '',
        district: '',
        subdistrict: '',
        address: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                province: user.province || '',
                city: user.city || '',
                district: user.district || '',
                subdistrict: user.subdistrict || '',
                address: user.address || '',
            });
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, isEditMode);
    };

    // Simulated data
    const userOrders = user ? dummyOrders.filter(o => o.customerEmail === user.email || o.customerName === user.name) : [];
    const simulatedCoins = user ? Math.floor(user.totalSpent / 10000) : 0;
    const userConsultations = user ? generateDummyConsultations(user.id) : [];

    const generateDummyActivities = () => {
        return [
            { id: '1', date: 'Hari ini, 14:30', description: 'Login ke aplikasi dashboard' },
            { id: '2', date: 'Kemarin, 09:15', description: 'Mengubah profil pengguna' },
            { id: '3', date: '24 Mar 2024, 16:20', description: 'Menyelesaikan pesanan belanja' },
        ];
    };
    const userActivities = user ? generateDummyActivities() : [];

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
                    <div className="flex items-center gap-3">
                        {user && (
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=22c55e&color=fff`}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-green-100"
                            />
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditMode ? 'Detail Pengguna' : 'Tambah Pengguna Baru'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {isEditMode ? 'Lihat dan edit informasi lengkap pengguna' : 'Lengkapi informasi untuk menambahkan user'}
                            </p>
                        </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Form Fields & Profile */}
                <div className="lg:col-span-1 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-gray-800">Profil Utama</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" /> Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                    placeholder="email@contoh.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" /> No. Telepon
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                    placeholder="0812-xxxx-xxxx"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-gray-400" /> Hak Akses (Role)
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'customer' | 'super_admin' | 'store_admin' })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                >
                                    <option value="customer">Customer</option>
                                    <option value="store_admin">Admin Toko</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-gray-400" /> Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'banned' })}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium
                                        ${formData.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 
                                          formData.status === 'inactive' ? 'bg-gray-50 border-gray-200 text-gray-700' : 
                                          'bg-red-50 border-red-200 text-red-700'}
                                    `}
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                    <option value="banned">Diblokir (Banned)</option>
                                </select>
                            </div>
                        </div>

                        <div className="border-y border-gray-100 bg-gray-50/50 p-4 flex items-center gap-2 mt-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-gray-800">Alamat Lengkap</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                        Provinsi
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.province || ''}
                                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                        placeholder="Contoh: Jawa Barat"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                        Kabupaten/Kota
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city || ''}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                        placeholder="Contoh: Depok"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                        Kecamatan
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.district || ''}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                        placeholder="Contoh: Cimanggis"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                        Kelurahan/Desa
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subdistrict || ''}
                                        onChange={(e) => setFormData({ ...formData, subdistrict: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all"
                                        placeholder="Contoh: Mekarsari"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                    Detail Alamat
                                </label>
                                <textarea
                                    value={formData.address || ''}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 focus:bg-white transition-all resize-none"
                                    placeholder="Nama jalan, gedung, no. rumah, blok/unit, dll."
                                ></textarea>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Column: Summaries & Histories */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Key Metrics Dashboard */}
                    {isEditMode ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-sm flex flex-col justify-between h-32 transform transition-transform hover:-translate-y-1">
                                <div className="flex items-center justify-between opacity-80">
                                    <span className="text-sm font-medium">Total Belanja</span>
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold">{formatCurrency(user?.totalSpent || 0)}</h4>
                                    <p className="text-xs opacity-75 mt-1">{user?.totalOrders || 0} kali transaksi selesai</p>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-5 text-white shadow-sm flex flex-col justify-between h-32 transform transition-transform hover:-translate-y-1">
                                <div className="flex items-center justify-between opacity-80">
                                    <span className="text-sm font-medium">Koin Trubus</span>
                                    <Coins className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold">{simulatedCoins.toLocaleString('id-ID')}</h4>
                                    <p className="text-xs opacity-75 mt-1">Estimasi koin dikumpulkan</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-100 p-6 rounded-xl flex items-center justify-center text-green-700 h-32">
                            <p className="font-medium text-center">Metrik analitik akan muncul setelah pengguna memiliki aktivitas transaksi.</p>
                        </div>
                    )}

                    {/* Order History */}
                    {isEditMode && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-gray-500" />
                                    <h3 className="font-semibold text-gray-800">Riwayat Pesanan Terbaru</h3>
                                </div>
                            </div>
                            {userOrders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Order ID</th>
                                                <th className="px-4 py-3 font-semibold">Tanggal</th>
                                                <th className="px-4 py-3 font-semibold">Total</th>
                                                <th className="px-4 py-3 font-semibold">Status</th>
                                                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {userOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-blue-600">{order.orderNumber}</td>
                                                    <td className="px-4 py-3 text-gray-600">{order.orderDate}</td>
                                                    <td className="px-4 py-3 font-bold text-gray-800">{formatCurrency(order.total)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                                            ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                                              'bg-amber-100 text-amber-700'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button className="text-blue-500 hover:text-blue-700 transition-colors" title="Lihat Order">
                                                            <ExternalLink className="w-4 h-4 mx-auto" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <ShoppingBag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                    <p>Belum ada riwayat pesanan.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Consultation History */}
                    {isEditMode && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-500" />
                                    <h3 className="font-semibold text-gray-800">Riwayat Konsultasi Agronomi</h3>
                                </div>
                            </div>
                            {userConsultations.length > 0 ? (
                                <div className="p-4 space-y-3">
                                    {userConsultations.map(consult => (
                                        <div key={consult.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-800">{consult.topic}</span>
                                                <span className="text-xs text-gray-500 mt-1">Bersama: {consult.expert}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-gray-400 mb-1">{consult.date}</span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">
                                                    {consult.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                    <p>Belum pernah melakukan konsultasi dengan pakar.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Activity Log */}
                    {isEditMode && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-gray-500" />
                                    <h3 className="font-semibold text-gray-800">Log Aktifitas</h3>
                                </div>
                            </div>
                            {userActivities.length > 0 ? (
                                <div className="p-4 space-y-1 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                    {userActivities.map((activity, idx) => (
                                        <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-green-50 text-slate-500 group-[.is-active]:text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className="font-bold text-slate-800 text-sm">{activity.description}</div>
                                                </div>
                                                <div className="text-slate-500 text-xs">{activity.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <Activity className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                    <p>Belum ada riwayat aktifitas.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
