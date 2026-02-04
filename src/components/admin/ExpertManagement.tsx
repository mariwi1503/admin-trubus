import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Star, Phone, Mail, Download, Loader2, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Expert } from '@/data/adminData';
import { expertsService } from '@/lib/supabaseService';
import Modal from './Modal';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const ExpertManagement: React.FC = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: 0,
    bio: '',
    price: 0,
    status: 'available' as 'available' | 'busy' | 'offline',
  });

  const specializations = ['Tanaman Pangan', 'Hortikultura', 'Hama & Penyakit', 'Tanah & Pupuk', 'Irigasi & Air', 'Perkebunan', 'Peternakan', 'Pertanian Organik'];

  useEffect(() => {
    loadExperts();
    
    const subscription = expertsService.subscribe((updatedExperts) => {
      setExperts(updatedExperts);
      setIsConnected(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadExperts = async () => {
    setIsLoading(true);
    try {
      const data = await expertsService.getAll();
      setExperts(data);
      setIsConnected(true);
    } catch (error) {
      console.error('Error loading experts:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || expert.status === filterStatus;
    const matchesSpec = filterSpecialization === 'all' || expert.specialization === filterSpecialization;
    return matchesSearch && matchesStatus && matchesSpec;
  });

  const handleOpenModal = (expert?: Expert) => {
    if (expert) {
      setSelectedExpert(expert);
      setFormData({
        name: expert.name,
        email: expert.email,
        phone: expert.phone,
        specialization: expert.specialization,
        experience: expert.experience,
        bio: expert.bio,
        price: expert.price,
        status: expert.status,
      });
    } else {
      setSelectedExpert(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        experience: 0,
        bio: '',
        price: 0,
        status: 'available',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedExpert) {
        await expertsService.update(selectedExpert.id, formData);
      } else {
        await expertsService.create({
          ...formData,
          rating: 0,
          totalConsultations: 0,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=22c55e&color=fff`,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving expert:', error);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedExpert) {
      setIsSaving(true);
      try {
        await expertsService.delete(selectedExpert.id);
        setIsDeleteModalOpen(false);
        setSelectedExpert(null);
      } catch (error) {
        console.error('Error deleting expert:', error);
        alert('Gagal menghapus data. Silakan coba lagi.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleStatusChange = async (expert: Expert, newStatus: 'available' | 'busy' | 'offline') => {
    try {
      await expertsService.update(expert.id, { status: newStatus });
      if (selectedExpert?.id === expert.id) {
        setSelectedExpert({ ...selectedExpert, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-700',
      busy: 'bg-amber-100 text-amber-700',
      offline: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      available: 'Tersedia',
      busy: 'Sibuk',
      offline: 'Offline',
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
            <button onClick={loadExperts} className="ml-2 underline">Coba lagi</button>
          </>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ahli..."
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
            <option value="available">Tersedia</option>
            <option value="busy">Sibuk</option>
            <option value="offline">Offline</option>
          </select>
          
          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Semua Spesialisasi</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={loadExperts}
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
            <span>Tambah Ahli</span>
          </button>
        </div>
      </div>

      {/* Expert Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-500">Memuat data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredExperts.map((expert) => (
            <div 
              key={expert.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <img 
                    src={expert.avatar} 
                    alt={expert.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {getStatusBadge(expert.status)}
                </div>
                
                <h3 className="font-semibold text-gray-800 text-lg">{expert.name}</h3>
                <p className="text-sm text-green-600 font-medium">{expert.specialization}</p>
                
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium text-gray-700">{expert.rating}</span>
                  <span className="text-sm text-gray-400">({expert.totalConsultations} konsultasi)</span>
                </div>
                
                <p className="text-sm text-gray-500 mt-2">{expert.experience} tahun pengalaman</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(expert.price)}</p>
                  <p className="text-xs text-gray-500">per sesi konsultasi</p>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => {
                      setSelectedExpert(expert);
                      setIsDetailModalOpen(true);
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Detail
                  </button>
                  <button 
                    onClick={() => handleOpenModal(expert)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedExpert(expert);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredExperts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Tidak ada ahli ditemukan</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedExpert ? 'Edit Ahli' : 'Tambah Ahli Baru'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan nama"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan email"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan nomor telepon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spesialisasi</label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Pilih Spesialisasi</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pengalaman (tahun)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga Konsultasi</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'busy' | 'offline' })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="available">Tersedia</option>
                <option value="busy">Sibuk</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Deskripsi singkat tentang ahli"
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
              {selectedExpert ? 'Simpan Perubahan' : 'Tambah Ahli'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Ahli"
        size="md"
      >
        {selectedExpert && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img 
                src={selectedExpert.avatar} 
                alt={selectedExpert.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{selectedExpert.name}</h3>
                <p className="text-green-600 font-medium">{selectedExpert.specialization}</p>
                {getStatusBadge(selectedExpert.status)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-xl font-bold text-gray-800">{selectedExpert.rating}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Konsultasi</p>
                <p className="text-xl font-bold text-gray-800">{selectedExpert.totalConsultations}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Pengalaman</p>
                <p className="text-xl font-bold text-gray-800">{selectedExpert.experience} tahun</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Harga Konsultasi</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(selectedExpert.price)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Bio</p>
              <p className="text-gray-700">{selectedExpert.bio}</p>
            </div>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{selectedExpert.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{selectedExpert.phone}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Ubah Status</p>
              <div className="flex gap-2">
                {(['available', 'busy', 'offline'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedExpert, status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedExpert.status === status
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'available' ? 'Tersedia' : status === 'busy' ? 'Sibuk' : 'Offline'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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
            Apakah Anda yakin ingin menghapus ahli <strong>{selectedExpert?.name}</strong>?
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

export default ExpertManagement;
