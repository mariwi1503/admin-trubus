import React, { useState } from 'react';
import { Search, FileText, Download, Eye, Calendar, Tag, Plus, Upload, Building2, Trash2, X, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import Modal from './Modal';

interface Archive {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
  status: 'published' | 'draft' | 'archived';
  clientName?: string;
  startDate?: string;
  endDate?: string;
}

const dummyArchives: Archive[] = [
  {
    id: '1',
    title: 'Kontrak Kerja Sama PT Tani Makmur',
    type: 'Kontrak',
    date: '2024-02-01',
    size: '2.4 MB',
    status: 'published',
    clientName: 'PT Tani Makmur',
    startDate: '2024-02-01',
    endDate: '2025-02-01',
  },
  {
    id: '2',
    title: 'Laporan Keuangan Q1 2024',
    type: 'Laporan',
    date: '2024-01-15',
    size: '5.1 MB',
    status: 'archived',
    clientName: 'Internal',
  },
  {
    id: '3',
    title: 'Proposal Proyek Green House',
    type: 'Proposal',
    date: '2024-02-05',
    size: '1.8 MB',
    status: 'draft',
    clientName: 'CV Hijau Daun',
  },
  {
    id: '4',
    title: 'Dokumen Legalitas Perusahaan',
    type: 'Legal',
    date: '2023-12-20',
    size: '3.2 MB',
    status: 'published',
    clientName: 'Pemerintah Kota',
  },
  {
    id: '5',
    title: 'Panduan Operasional Standar',
    type: 'SOP',
    date: '2024-01-10',
    size: '4.5 MB',
    status: 'published',
    clientName: 'Internal',
  },
];

const ArchiveManagement: React.FC = () => {
  const [archives, setArchives] = useState<Archive[]>(dummyArchives);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);

  // Form states
  const [generateForm, setGenerateForm] = useState({
    type: 'Kontrak',
    clientName: '',
    title: '',
    startDate: '',
    endDate: '',
  });

  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    type: 'Laporan',
    clientName: '',
    title: '',
  });

  const filteredArchives = archives.filter(archive =>
    archive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    archive.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (archive.clientName && archive.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      published: 'Terbit',
      draft: 'Draft',
      archived: 'Diarsipkan',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleGenerate = () => {
    const newArchive: Archive = {
      id: (archives.length + 1).toString(),
      title: generateForm.title || `${generateForm.type} - ${generateForm.clientName}`,
      type: generateForm.type,
      date: new Date().toISOString().split('T')[0],
      size: '15 KB',
      status: 'draft',
      clientName: generateForm.clientName,
      startDate: generateForm.startDate,
      endDate: generateForm.endDate,
    };
    setArchives([newArchive, ...archives]);
    setIsGenerateModalOpen(false);
    resetForms();
  };

  const handleUpload = () => {
    const newArchive: Archive = {
      id: (archives.length + 1).toString(),
      title: uploadForm.title || uploadForm.file?.name || 'Dokumen Tanpa Judul',
      type: uploadForm.type,
      date: new Date().toISOString().split('T')[0],
      size: uploadForm.file ? `${(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB` : '1 MB',
      status: 'published',
      clientName: uploadForm.clientName,
    };
    setArchives([newArchive, ...archives]);
    setIsUploadModalOpen(false);
    resetForms();
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      setArchives(archives.filter(a => a.id !== id));
      if (isPreviewModalOpen) setIsPreviewModalOpen(false);
    }
  };

  const resetForms = () => {
    setGenerateForm({
      type: 'Kontrak',
      clientName: '',
      title: '',
      startDate: '',
      endDate: '',
    });
    setUploadForm({
      file: null,
      type: 'Laporan',
      clientName: '',
      title: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari dokumen, tipe, atau klien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Generate Dokumen</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Dokumen</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nama Dokumen</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Klien</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tipe</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tanggal</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredArchives.map((archive) => (
                <tr
                  key={archive.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedArchive(archive);
                    setIsPreviewModalOpen(true);
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${archive.type === 'Kontrak' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{archive.title}</p>
                        <p className="text-xs text-gray-500">{archive.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      {archive.clientName || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="w-4 h-4" />
                      {archive.type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {archive.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(archive.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedArchive(archive);
                          setIsPreviewModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Dokumen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(archive.id)}
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

        {filteredArchives.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada dokumen ditemukan</p>
          </div>
        )}
      </div>

      {/* Generate Document Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Dokumen Baru"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Dokumen</label>
            <select
              value={generateForm.type}
              onChange={(e) => setGenerateForm({ ...generateForm, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Kontrak">Kontrak Kerja Sama</option>
              <option value="Surat">Surat Penawaran</option>
              <option value="Invoice">Invoice Tagihan</option>
              <option value="Berita Acara">Berita Acara</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Klien</label>
            <input
              type="text"
              value={generateForm.clientName}
              onChange={(e) => setGenerateForm({ ...generateForm, clientName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan nama klien"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Dokumen (Opsional)</label>
            <input
              type="text"
              value={generateForm.title}
              onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Otomatis jika kosong"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai (Efektif)</label>
              <input
                type="date"
                value={generateForm.startDate}
                onChange={(e) => setGenerateForm({ ...generateForm, startDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berakhir</label>
              <input
                type="date"
                value={generateForm.endDate}
                onChange={(e) => setGenerateForm({ ...generateForm, endDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Buat Dokumen
            </button>
          </div>
        </div>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Dokumen"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2 font-medium">Klik atau seret file ke sini</p>
            <p className="text-xs text-gray-400">PDF, DOCX, JPG (Max. 10MB)</p>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files ? e.target.files[0] : null })}
            />
          </div>
          {uploadForm.file && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded-lg flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {uploadForm.file.name}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Klien (Opsional)</label>
            <input
              type="text"
              value={uploadForm.clientName}
              onChange={(e) => setUploadForm({ ...uploadForm, clientName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Dokumen</label>
            <select
              value={uploadForm.type}
              onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Laporan">Laporan</option>
              <option value="Legal">Legalitas</option>
              <option value="SOP">SOP</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleUpload}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Upload
            </button>
          </div>
        </div>
      </Modal>

      {/* Document Preview Modal */}
      {selectedArchive && isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedArchive.title}</h3>
                  <p className="text-xs text-gray-400">{selectedArchive.size} • {selectedArchive.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Print">
                  <Printer className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Download">
                  <Download className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-gray-600 mx-1"></div>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Viewer Area */}
            <div className="flex-1 bg-gray-100 overflow-y-auto p-8 flex justify-center">
              <div className="bg-white shadow-lg w-full max-w-2xl min-h-[800px] p-12">
                <div className="mb-8 flex justify-between items-start border-b pb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedArchive.type}</h1>
                    <p className="text-gray-500">No: DOC/{selectedArchive.id}/2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700 text-xl">TRUBUS</p>
                    <p className="text-sm text-gray-500">Agriculture & Farming</p>
                  </div>
                </div>

                <div className="space-y-6 text-gray-700 font-serif leading-relaxed">
                  <p>
                    <strong>PERHATIAN:</strong> Ini adalah pratinjau dokumen dummy untuk tujuan demonstrasi.
                  </p>
                  <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Pasal 1: Definisi</h2>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>

                  <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Pasal 2: Ruang Lingkup</h2>
                  <p>
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                  </p>

                  {selectedArchive.clientName && (
                    <div className="mt-8 p-4 bg-gray-50 border border-gray-100 rounded-lg text-sm font-sans">
                      <p className="mb-1"><strong>Pihak Pertama:</strong> PT Trubus Indonesia</p>
                      <p><strong>Pihak Kedua:</strong> {selectedArchive.clientName}</p>
                    </div>
                  )}

                  <div className="mt-16 flex justify-between text-center">
                    <div>
                      <p className="mb-16">Pihak Pertama</p>
                      <p className="font-bold border-t border-gray-400 pt-2 px-4">Direktur Utama</p>
                    </div>
                    <div>
                      <p className="mb-16">Pihak Kedua</p>
                      <p className="font-bold border-t border-gray-400 pt-2 px-4">{selectedArchive.clientName || 'Klien'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Pagination */}
            <div className="bg-white border-t border-gray-200 p-3 flex items-center justify-center gap-4 text-sm text-gray-600">
              <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Halaman 1 dari 5</span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveManagement;
