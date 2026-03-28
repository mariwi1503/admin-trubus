import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Calendar, Download, Image, Loader2, RefreshCw, Cloud, CloudOff, LayoutGrid, List, Filter } from 'lucide-react';
import { Article } from '@/data/adminData';
import { articlesService } from '@/lib/supabaseService';
import Modal from './Modal';
import Cropper, { Point, Area } from 'react-easy-crop';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getCroppedImg } from '@/lib/cropImage';

const ArticleManagement: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Image crop states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    author: '',
    status: 'draft' as 'published' | 'draft' | 'archived',
    image: '',
  });

  const categories = ['Tanaman Pangan', 'Hortikultura', 'Hama & Penyakit', 'Pupuk & Tanah', 'Irigasi', 'Tips & Trik', 'Teknologi', 'Bisnis'];

  useEffect(() => {
    loadArticles();
    
    const subscription = articlesService.subscribe((updatedArticles) => {
      setArticles(updatedArticles);
      setIsConnected(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const data = await articlesService.getAll();
      setArticles(data);
      setIsConnected(true);
    } catch (error) {
      console.error('Error loading articles:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setIsCropModalOpen(true);
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageSrc as string,
        croppedAreaPixels as Area
      );
      setFormData({ ...formData, image: croppedImage });
      setIsCropModalOpen(false);
    } catch (e) {
      console.error(e);
      alert('Gagal memotong gambar.');
    }
  };

  const handleOpenModal = (article?: Article) => {
    if (article) {
      setSelectedArticle(article);
      setFormData({
        title: article.title,
        category: article.category,
        content: article.content,
        author: article.author,
        status: article.status,
        image: article.image,
      });
    } else {
      setSelectedArticle(null);
      setFormData({
        title: '',
        category: '',
        content: '',
        author: '',
        status: 'draft',
        image: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedArticle) {
        await articlesService.update(selectedArticle.id, formData);
      } else {
        await articlesService.create({
          ...formData,
          publishDate: new Date().toISOString().split('T')[0],
          views: 0,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedArticle) {
      setIsSaving(true);
      try {
        await articlesService.delete(selectedArticle.id);
        setIsDeleteModalOpen(false);
        setSelectedArticle(null);
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Gagal menghapus data. Silakan coba lagi.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleStatusChange = async (article: Article, newStatus: 'published' | 'draft' | 'archived') => {
    try {
      await articlesService.update(article.id, { status: newStatus });
      if (selectedArticle?.id === article.id) {
        setSelectedArticle({ ...selectedArticle, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-amber-100 text-amber-700',
      archived: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      published: 'Dipublikasikan',
      draft: 'Draft',
      archived: 'Diarsipkan',
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
            <button onClick={loadArticles} className="ml-2 underline">Coba lagi</button>
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
                placeholder="Cari artikel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-colors h-11 ${
                [filterStatus, filterCategory].filter(f => f !== 'all').length > 0 
                  ? 'border-green-500 text-green-700 bg-green-50' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
              {[filterStatus, filterCategory].filter(f => f !== 'all').length > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full ml-1 font-semibold">
                  {[filterStatus, filterCategory].filter(f => f !== 'all').length}
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
              onClick={loadArticles}
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
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Status Artikel</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-gray-50"
              >
                <option value="all">Semua Status</option>
                <option value="published">Dipublikasikan</option>
                <option value="draft">Draft</option>
                <option value="archived">Diarsipkan</option>
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

      {/* Articles Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-500">Memuat data...</span>
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredArticles.map((article) => (
              <div 
                key={article.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(article.status)}
                  </div>
                </div>
                
                <div className="p-5">
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    {article.category}
                  </span>
                  
                  <h3 className="font-semibold text-gray-800 mt-3 line-clamp-2">{article.title}</h3>
                  
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.content}</p>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      <p className="font-medium text-gray-700">{article.author}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {article.publishDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          setSelectedArticle(article);
                          setIsPreviewModalOpen(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(article)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedArticle(article);
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
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Artikel</th>
                    <th className="px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Penulis</th>
                    <th className="px-6 py-4 font-semibold">Publish</th>
                    <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredArticles.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={article.image} alt={article.title} className="w-16 h-12 rounded object-cover" />
                          <div className="font-semibold text-gray-800 line-clamp-2 max-w-[200px] xl:max-w-xs">{article.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">{article.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{article.author}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {article.publishDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => { setSelectedArticle(article); setIsPreviewModalOpen(true); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Preview"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleOpenModal(article)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => { setSelectedArticle(article); setIsDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {!isLoading && filteredArticles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Tidak ada artikel ditemukan</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Artikel</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan judul artikel"
            />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Penulis</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nama penulis"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Artikel (Rekomendasi 16:9)</label>
            <div className="flex flex-col gap-2">
              {formData.image && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {!formData.image && (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-green-400 transition-colors">
                    <Image className="w-8 h-8 mb-2 text-gray-400" />
                    <span>Klik atau seret gambar ke sini</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden pb-12">
              <ReactQuill 
                theme="snow" 
                value={formData.content} 
                onChange={(val) => setFormData({ ...formData, content: val })} 
                className="h-64"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'draft' | 'archived' })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Dipublikasikan</option>
              <option value="archived">Diarsipkan</option>
            </select>
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
              {selectedArticle ? 'Simpan Perubahan' : 'Tambah Artikel'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Preview Artikel"
        size="lg"
      >
        {selectedArticle && (
          <div>
            <img 
              src={selectedArticle.image} 
              alt={selectedArticle.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {selectedArticle.category}
              </span>
              {getStatusBadge(selectedArticle.status)}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedArticle.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span>Oleh: {selectedArticle.author}</span>
              <span>{selectedArticle.publishDate}</span>
              <span>{selectedArticle.views} views</span>
            </div>
            <div 
              className="prose prose-green max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />
            
            <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => handleStatusChange(selectedArticle, 'published')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedArticle.status === 'published'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Publikasikan
              </button>
              <button
                onClick={() => handleStatusChange(selectedArticle, 'draft')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedArticle.status === 'draft'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Jadikan Draft
              </button>
              <button
                onClick={() => handleStatusChange(selectedArticle, 'archived')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedArticle.status === 'archived'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Arsipkan
              </button>
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
            Apakah Anda yakin ingin menghapus artikel <strong>"{selectedArticle?.title}"</strong>?
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
        title="Potong Gambar Banner (16:9)"
        size="lg"
      >
        <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden" style={{ touchAction: 'none' }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
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
            className="flex-1"
          />
        </div>
        <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
          <button
            onClick={() => setIsCropModalOpen(false)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={showCroppedImage}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Simpan Potongan
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ArticleManagement;
