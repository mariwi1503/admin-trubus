import React, { useState, useEffect } from 'react';
import { Save, Plus, Edit2, Trash2, CreditCard, Building, Wallet, Truck, Settings, Globe, Loader2, Cloud, CloudOff } from 'lucide-react';
import { PaymentMethod, SystemSettings as SystemSettingsType, defaultSystemSettings } from '@/data/adminData';
import { paymentMethodsService, settingsService } from '@/lib/supabaseService';
import Modal from './Modal';

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'shipping'>('general');
  const [settings, setSettings] = useState<SystemSettingsType>(defaultSystemSettings);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [paymentFormData, setPaymentFormData] = useState({
    name: '',
    type: 'bank_transfer' as 'bank_transfer' | 'e_wallet' | 'cod',
    accountNumber: '',
    accountName: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
    
    const paymentSubscription = paymentMethodsService.subscribe((updatedPayments) => {
      setPaymentMethods(updatedPayments);
      setIsConnected(true);
    });

    const settingsSubscription = settingsService.subscribe((updatedSettings) => {
      setSettings(updatedSettings);
      setIsConnected(true);
    });

    return () => {
      paymentSubscription.unsubscribe();
      settingsSubscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, paymentsData] = await Promise.all([
        settingsService.get(),
        paymentMethodsService.getAll(),
      ]);
      setSettings(settingsData);
      setPaymentMethods(paymentsData);
      setIsConnected(true);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await settingsService.update(settings);
      setSaveMessage('Pengaturan berhasil disimpan!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPaymentModal = (payment?: PaymentMethod) => {
    if (payment) {
      setSelectedPayment(payment);
      setPaymentFormData({
        name: payment.name,
        type: payment.type,
        accountNumber: payment.accountNumber || '',
        accountName: payment.accountName || '',
        isActive: payment.isActive,
      });
    } else {
      setSelectedPayment(null);
      setPaymentFormData({
        name: '',
        type: 'bank_transfer',
        accountNumber: '',
        accountName: '',
        isActive: true,
      });
    }
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async () => {
    setIsSaving(true);
    try {
      if (selectedPayment) {
        await paymentMethodsService.update(selectedPayment.id, paymentFormData);
      } else {
        await paymentMethodsService.create({
          ...paymentFormData,
          logo: '',
        });
      }
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert('Gagal menyimpan metode pembayaran. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    if (selectedPayment) {
      setIsSaving(true);
      try {
        await paymentMethodsService.delete(selectedPayment.id);
        setIsDeleteModalOpen(false);
        setSelectedPayment(null);
      } catch (error) {
        console.error('Error deleting payment method:', error);
        alert('Gagal menghapus metode pembayaran. Silakan coba lagi.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleTogglePaymentActive = async (payment: PaymentMethod) => {
    try {
      await paymentMethodsService.update(payment.id, { isActive: !payment.isActive });
    } catch (error) {
      console.error('Error toggling payment status:', error);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer': return <Building className="w-5 h-5" />;
      case 'e_wallet': return <Wallet className="w-5 h-5" />;
      case 'cod': return <Truck className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const tabs = [
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'payment', label: 'Pembayaran', icon: CreditCard },
    { id: 'shipping', label: 'Pengiriman', icon: Truck },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-500">Memuat pengaturan...</span>
      </div>
    );
  }

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
            <button onClick={loadData} className="ml-2 underline">Coba lagi</button>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Pengaturan Umum</h3>
              <p className="text-sm text-gray-500">Konfigurasi dasar untuk toko Anda</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Kontak</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon Kontak</label>
                <input
                  type="tel"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Komisi (%)</label>
                <input
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Toko</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order (Rp)</label>
                <input
                  type="number"
                  value={settings.minOrderAmount}
                  onChange={(e) => setSettings({ ...settings, minOrderAmount: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gratis Ongkir Mulai (Rp)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              {saveMessage && (
                <p className="text-sm text-green-600 font-medium">{saveMessage}</p>
              )}
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 ml-auto"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Metode Pembayaran</h3>
              <p className="text-sm text-gray-500">Kelola metode pembayaran yang tersedia</p>
            </div>
            <button
              onClick={() => handleOpenPaymentModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Metode</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((payment) => (
              <div 
                key={payment.id}
                className={`bg-white rounded-xl shadow-sm border p-5 ${
                  payment.isActive ? 'border-green-200' : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    payment.type === 'bank_transfer' ? 'bg-blue-100 text-blue-600' :
                    payment.type === 'e_wallet' ? 'bg-purple-100 text-purple-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {getPaymentIcon(payment.type)}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payment.isActive}
                      onChange={() => handleTogglePaymentActive(payment)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <h4 className="font-semibold text-gray-800">{payment.name}</h4>
                <p className="text-sm text-gray-500 capitalize">{payment.type.replace('_', ' ')}</p>
                
                {payment.accountNumber && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">No. Rekening/Akun</p>
                    <p className="text-sm font-medium text-gray-700">{payment.accountNumber}</p>
                    {payment.accountName && (
                      <p className="text-xs text-gray-500 mt-1">a.n. {payment.accountName}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleOpenPaymentModal(payment)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {paymentMethods.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada metode pembayaran</p>
            </div>
          )}
        </div>
      )}

      {/* Shipping Settings */}
      {activeTab === 'shipping' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Pengaturan Pengiriman</h3>
              <p className="text-sm text-gray-500">Konfigurasi opsi pengiriman</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">JNE Regular</h4>
                  <p className="text-sm text-gray-500">Estimasi 2-3 hari kerja</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">J&T Express</h4>
                  <p className="text-sm text-gray-500">Estimasi 2-4 hari kerja</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">SiCepat</h4>
                  <p className="text-sm text-gray-500">Estimasi 1-2 hari kerja</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Pos Indonesia</h4>
                  <p className="text-sm text-gray-500">Estimasi 3-5 hari kerja</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={selectedPayment ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Metode</label>
            <input
              type="text"
              value={paymentFormData.name}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Contoh: Bank BCA"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
            <select
              value={paymentFormData.type}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, type: e.target.value as 'bank_transfer' | 'e_wallet' | 'cod' })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="bank_transfer">Transfer Bank</option>
              <option value="e_wallet">E-Wallet</option>
              <option value="cod">COD (Bayar di Tempat)</option>
            </select>
          </div>
          
          {paymentFormData.type !== 'cod' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Rekening/Akun</label>
                <input
                  type="text"
                  value={paymentFormData.accountNumber}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, accountNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Masukkan nomor rekening"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Atas Nama</label>
                <input
                  type="text"
                  value={paymentFormData.accountName}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, accountName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nama pemilik rekening"
                />
              </div>
            </>
          )}
          
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentFormData.isActive}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
            <span className="text-sm text-gray-700">Aktifkan metode pembayaran ini</span>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Batal
            </button>
            <button
              onClick={handleSavePayment}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {selectedPayment ? 'Simpan Perubahan' : 'Tambah Metode'}
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
            Apakah Anda yakin ingin menghapus metode pembayaran <strong>"{selectedPayment?.name}"</strong>?
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
              onClick={handleDeletePayment}
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

export default SystemSettings;
