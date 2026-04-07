import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Briefcase, Calendar, MapPin, List as ListIcon } from 'lucide-react';
import { Career, dummyCareers } from '@/data/adminData';
import Modal from './Modal';

const CareerManagement: React.FC = () => {
  const [careers, setCareers] = useState<Career[]>(dummyCareers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    deadline: '',
    status: 'draft' as 'open' | 'close' | 'draft',
    type: 'fulltime' as 'fulltime' | 'parttime' | 'freelance',
    description: '',
    qualifications: '' // Will store as newline separated string for simple textarea
  });

  const filteredCareers = careers.filter(career =>
    career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    career.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (career?: Career) => {
    if (career) {
      setSelectedCareer(career);
      setFormData({
        title: career.title,
        location: career.location,
        deadline: career.deadline,
        status: career.status,
        type: career.type,
        description: career.description,
        qualifications: career.qualifications.join('\n')
      });
    } else {
      setSelectedCareer(null);
      setFormData({
        title: '',
        location: '',
        deadline: '',
        status: 'open',
        type: 'fulltime',
        description: '',
        qualifications: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const qualificationsList = formData.qualifications.split('\n').filter(q => q.trim() !== '');
    
    if (selectedCareer) {
      setCareers(careers.map(c => 
        c.id === selectedCareer.id 
          ? { ...c, ...formData, qualifications: qualificationsList } 
          : c
      ));
    } else {
      const newCareer: Career = {
        id: (careers.length + 1).toString(),
        ...formData,
        qualifications: qualificationsList
      };
      setCareers([...careers, newCareer]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedCareer) {
      setCareers(careers.filter(c => c.id !== selectedCareer.id));
      setIsDeleteModalOpen(false);
      setSelectedCareer(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-green-100 text-green-700',
      close: 'bg-red-100 text-red-700',
      draft: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      open: 'Aktif',
      close: 'Ditutup',
      draft: 'Draft',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      fulltime: 'bg-blue-100 text-blue-700',
      parttime: 'bg-orange-100 text-orange-700',
      freelance: 'bg-purple-100 text-purple-700',
    };
    const labels = {
      fulltime: 'Full Time',
      parttime: 'Part Time',
      freelance: 'Freelance',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari lowongan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Lowongan</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Posisi</th>
                <th className="px-6 py-4 font-semibold">Lokasi</th>
                <th className="px-6 py-4 font-semibold">Jenis Pekerjaan</th>
                <th className="px-6 py-4 font-semibold">Batas Waktu</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCareers.length > 0 ? (
                filteredCareers.map(career => (
                  <tr key={career.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{career.title}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{career.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {career.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(career.type)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {career.deadline}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(career.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(career)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedCareer(career); setIsDeleteModalOpen(true); }} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data lowongan pekerjaan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCareer ? 'Edit Lowongan' : 'Tambah Lowongan Baru'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posisi / Pekerjaan</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex. Agronomist Senior"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Penempatan</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex. Jakarta Pusat"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pekerjaan</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'fulltime' | 'parttime' | 'freelance' })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="fulltime">Full Time</option>
                <option value="parttime">Part Time</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'open' | 'close' | 'draft' })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="open">Aktif (Buka)</option>
                <option value="close">Ditutup</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat / Tanggung Jawab</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Deskripsikan tanggung jawab atau gambaran pekerjaan secara singkat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kualifikasi (Satu per baris)</label>
            <textarea
              rows={5}
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Minimal S1 Pertanian...&#10;Pengalaman minimal 2 tahun...&#10;Bersedia ditempatkan di Bandung..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
            >
              {selectedCareer ? 'Simpan Perubahan' : 'Simpan Lowongan'}
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
            Apakah Anda yakin ingin menghapus lowongan <strong>"{selectedCareer?.title}"</strong>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CareerManagement;
