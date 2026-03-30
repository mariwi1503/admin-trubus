import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Pin,
  PinOff,
  MessageCircleQuestion,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FAQ, dummyFAQs } from '@/data/adminData';
import Modal from './Modal';

const emptyForm = {
  question: '',
  answer: '',
  category: 'Umum',
  status: 'draft' as FAQ['status'],
  isFeatured: false,
  order: 1,
};

const FAQManagement: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>(dummyFAQs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | FAQ['status']>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(dummyFAQs[0]?.id ?? null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const categories = useMemo(() => {
    const baseCategories = Array.from(new Set(faqs.map((faq) => faq.category))).sort();
    return ['all', ...baseCategories];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return [...faqs]
      .filter((faq) => {
        const keyword = searchTerm.toLowerCase();
        const matchesSearch =
          faq.question.toLowerCase().includes(keyword) ||
          faq.answer.toLowerCase().includes(keyword) ||
          faq.category.toLowerCase().includes(keyword);
        const matchesStatus = filterStatus === 'all' || faq.status === filterStatus;
        const matchesCategory = filterCategory === 'all' || faq.category === filterCategory;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return Number(b.isFeatured) - Number(a.isFeatured);
        return a.order - b.order;
      });
  }, [faqs, searchTerm, filterStatus, filterCategory]);

  const stats = useMemo(() => {
    const published = faqs.filter((faq) => faq.status === 'published').length;
    const drafts = faqs.filter((faq) => faq.status === 'draft').length;
    const featured = faqs.filter((faq) => faq.isFeatured).length;

    return [
      { label: 'Total FAQ', value: faqs.length, tone: 'text-slate-700 bg-slate-100' },
      { label: 'Dipublikasikan', value: published, tone: 'text-green-700 bg-green-100' },
      { label: 'Draft', value: drafts, tone: 'text-amber-700 bg-amber-100' },
      { label: 'Unggulan', value: featured, tone: 'text-blue-700 bg-blue-100' },
    ];
  }, [faqs]);

  const openCreateModal = () => {
    setSelectedFAQ(null);
    setFormData({
      ...emptyForm,
      order: faqs.length + 1,
    });
    setIsFormOpen(true);
  };

  const openEditModal = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      status: faq.status,
      isFeatured: faq.isFeatured,
      order: faq.order,
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const payload = {
      ...formData,
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      category: formData.category.trim(),
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    if (!payload.question || !payload.answer || !payload.category) return;

    if (selectedFAQ) {
      setFaqs((prev) =>
        prev.map((faq) => (faq.id === selectedFAQ.id ? { ...faq, ...payload } : faq))
      );
    } else {
      setFaqs((prev) => [
        {
          id: String(Date.now()),
          ...payload,
        },
        ...prev,
      ]);
    }

    setIsFormOpen(false);
    setSelectedFAQ(null);
  };

  const handleDelete = () => {
    if (!selectedFAQ) return;
    setFaqs((prev) => prev.filter((faq) => faq.id !== selectedFAQ.id));
    setIsDeleteOpen(false);
    setSelectedFAQ(null);
  };

  const toggleFeatured = (faq: FAQ) => {
    setFaqs((prev) =>
      prev.map((item) =>
        item.id === faq.id
          ? {
              ...item,
              isFeatured: !item.isFeatured,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
  };

  const statusBadge = (status: FAQ['status']) =>
    status === 'published'
      ? 'bg-green-100 text-green-700'
      : 'bg-amber-100 text-amber-700';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stat.tone}`}>
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="p-5 border-b border-gray-100 space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pertanyaan, jawaban, kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                  filterStatus !== 'all' || filterCategory !== 'all'
                    ? 'border-green-500 text-green-700 bg-green-50'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filter
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterCategory('all');
                }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Tambah FAQ
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | FAQ['status'])}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                >
                  <option value="all">Semua status</option>
                  <option value="published">Dipublikasikan</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Kategori
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Semua kategori' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;

              return (
                <div key={faq.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="p-4 sm:p-5 bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(faq.status)}`}>
                            {faq.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {faq.category}
                          </span>
                          {faq.isFeatured && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              FAQ Unggulan
                            </span>
                          )}
                          <span className="text-xs text-gray-400">Urutan #{faq.order}</span>
                        </div>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                {faq.question}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                Diperbarui {new Date(faq.lastUpdated).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="pt-1">
                            <p className="text-sm leading-7 text-gray-600">{faq.answer}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 lg:pl-4">
                        <button
                          onClick={() => toggleFeatured(faq)}
                          className={`p-2.5 rounded-lg transition-colors ${
                            faq.isFeatured
                              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}
                          title={faq.isFeatured ? 'Batalkan unggulan' : 'Jadikan unggulan'}
                        >
                          {faq.isFeatured ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFAQ(faq);
                            setIsPreviewOpen(true);
                          }}
                          className="p-2.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-2.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFAQ(faq);
                            setIsDeleteOpen(true);
                          }}
                          className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="py-16 px-6 border border-dashed border-gray-200 rounded-2xl text-center">
                <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto">
                  <MessageCircleQuestion className="w-7 h-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Belum ada FAQ yang cocok</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Coba ubah kata kunci pencarian atau tambahkan FAQ baru untuk tim operasional.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedFAQ ? 'Edit FAQ' : 'Tambah FAQ'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pertanyaan</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan pertanyaan FAQ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jawaban</label>
            <textarea
              rows={6}
              value={formData.answer}
              onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Masukkan jawaban yang akan tampil ke pengguna"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Contoh: Pembayaran"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as FAQ['status'] }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Dipublikasikan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urutan Tampil</label>
              <input
                type="number"
                min={1}
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order: Number(e.target.value) > 0 ? Number(e.target.value) : 1,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <label className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">Tandai sebagai FAQ unggulan</p>
                <p className="text-xs text-gray-500">FAQ unggulan akan diprioritaskan di daftar.</p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Simpan FAQ
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus FAQ"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-600">
            FAQ <span className="font-semibold text-gray-900">{selectedFAQ?.question}</span> akan dihapus dari daftar.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Preview FAQ"
        size="md"
      >
        {selectedFAQ && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(selectedFAQ.status)}`}>
                {selectedFAQ.status === 'published' ? 'Dipublikasikan' : 'Draft'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {selectedFAQ.category}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{selectedFAQ.question}</h3>
            <p className="text-sm leading-7 text-gray-600">{selectedFAQ.answer}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FAQManagement;
