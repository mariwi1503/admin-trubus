import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Edit2,
  ImagePlus,
  MapPin,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { isStoreScopedRole } from '@/lib/rbac';
import Modal from './Modal';

interface GalleryImage {
  id: string;
  url: string;
  name: string;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  location: string;
  activityDate: string;
  images: GalleryImage[];
  createdAt: string;
  createdBy: string;
  storeId?: string;
}

const STORAGE_KEY = 'admin_gallery_items';
const dummyGalleryItems: GalleryItem[] = [
  {
    id: 'dummy-gallery-1',
    title: 'Pelatihan Urban Farming',
    description: 'Sesi pelatihan budidaya tanaman pangan di lahan terbatas bersama komunitas pelanggan dan tim toko.',
    location: 'Trubus Cimanggis, Depok',
    activityDate: '2026-03-12',
    images: [
      { id: 'dummy-gallery-1-image-1', url: '/images/gallery-1.jpg', name: 'gallery-1.jpg' },
    ],
    createdAt: '2026-03-12T09:00:00+07:00',
    createdBy: 'Super Admin',
  },
  {
    id: 'dummy-gallery-2',
    title: 'Demo Produk dan Pupuk',
    description: 'Dokumentasi demo penggunaan produk pertanian dan rekomendasi pupuk untuk pelanggan retail.',
    location: 'Trubus Bintaro, Tangerang Selatan',
    activityDate: '2026-03-18',
    images: [
      { id: 'dummy-gallery-2-image-1', url: '/images/gallery-2.jpg', name: 'gallery-2.jpg' },
    ],
    createdAt: '2026-03-18T10:30:00+07:00',
    createdBy: 'Admin Operational',
    storeId: '2',
  },
  {
    id: 'dummy-gallery-3',
    title: 'Kegiatan Komunitas Berkebun',
    description: 'Kunjungan komunitas untuk berbagi pengalaman budidaya dan perawatan tanaman hortikultura.',
    location: 'Trubus Bandung, Jawa Barat',
    activityDate: '2026-03-22',
    images: [
      { id: 'dummy-gallery-3-image-1', url: '/images/gallery-3.jpg', name: 'gallery-3.jpg' },
    ],
    createdAt: '2026-03-22T08:15:00+07:00',
    createdBy: 'Admin Operational',
    storeId: '2',
  },
  {
    id: 'dummy-gallery-4',
    title: 'Aktivasi Event di Toko',
    description: 'Dokumentasi aktivitas promosi dan engagement pelanggan di area toko selama akhir pekan.',
    location: 'Trubus Kelapa Gading, Jakarta',
    activityDate: '2026-03-27',
    images: [
      { id: 'dummy-gallery-4-image-1', url: '/images/gallery-4.jpg', name: 'gallery-4.jpg' },
    ],
    createdAt: '2026-03-27T14:00:00+07:00',
    createdBy: 'Super Admin',
  },
  {
    id: 'dummy-gallery-5',
    title: 'Workshop Perawatan Tanaman',
    description: 'Workshop singkat mengenai pemupukan, penyiraman, dan pengendalian hama untuk pelanggan baru.',
    location: 'Trubus Semarang, Jawa Tengah',
    activityDate: '2026-04-02',
    images: [
      { id: 'dummy-gallery-5-image-1', url: '/images/gallery-5.jpg', name: 'gallery-5.jpg' },
    ],
    createdAt: '2026-04-02T11:00:00+07:00',
    createdBy: 'Tim Marketing',
  },
];

const emptyForm = {
  title: '',
  description: '',
  location: '',
  activityDate: '',
};

const GalleryManagement: React.FC = () => {
  const { user } = useAppContext();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedImages, setSelectedImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    if (!savedItems) {
      setGalleryItems(dummyGalleryItems);
      return;
    }

    try {
      const parsedItems = JSON.parse(savedItems) as GalleryItem[];
      setGalleryItems(Array.isArray(parsedItems) && parsedItems.length > 0 ? parsedItems : dummyGalleryItems);
    } catch (error) {
      console.error('Gagal membaca data galeri dari localStorage:', error);
      setGalleryItems(dummyGalleryItems);
    }
  }, []);

  const persistGalleryItems = (items: GalleryItem[]) => {
    setGalleryItems(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const visibleGalleryItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return galleryItems
      .filter((item) => {
        const matchesStore =
          !isStoreScopedRole(user?.role) || item.storeId === user?.storeId;

        const matchesSearch =
          normalizedSearch.length === 0 ||
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.location.toLowerCase().includes(normalizedSearch) ||
          item.description.toLowerCase().includes(normalizedSearch);

        return matchesStore && matchesSearch;
      })
      .sort((a, b) => b.activityDate.localeCompare(a.activityDate));
  }, [galleryItems, searchTerm, user?.role, user?.storeId]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`Gagal membaca file ${file.name}`));
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      const nextImages = await Promise.all(
        files.map(async (file, index) => ({
          id: `${Date.now()}-${index}-${file.name}`,
          url: await readFileAsDataUrl(file),
          name: file.name,
        }))
      );

      setSelectedImages((prev) => [...prev, ...nextImages]);
      event.target.value = '';
    } catch (error) {
      console.error(error);
      alert('Ada file yang gagal diproses. Silakan coba lagi.');
    }
  };

  const handleOpenModal = (item?: GalleryItem) => {
    if (item) {
      setSelectedGallery(item);
      setFormData({
        title: item.title,
        description: item.description,
        location: item.location,
        activityDate: item.activityDate,
      });
      setSelectedImages(item.images);
    } else {
      setSelectedGallery(null);
      setFormData(emptyForm);
      setSelectedImages([]);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGallery(null);
    setFormData(emptyForm);
    setSelectedImages([]);
  };

  const removeImage = (imageId: string) => {
    setSelectedImages((prev) => prev.filter((image) => image.id !== imageId));
  };

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.location || !formData.activityDate) {
      alert('Mohon lengkapi title, deskripsi, lokasi, dan tanggal kegiatan.');
      return;
    }

    if (selectedImages.length === 0) {
      alert('Mohon upload minimal satu gambar kegiatan.');
      return;
    }

    if (!user) return;

    const nextItem: GalleryItem = selectedGallery
      ? {
          ...selectedGallery,
          ...formData,
          images: selectedImages,
        }
      : {
          id: crypto.randomUUID(),
          ...formData,
          images: selectedImages,
          createdAt: new Date().toISOString(),
          createdBy: user.name,
          storeId: user.storeId,
        };

    const nextItems = selectedGallery
      ? galleryItems.map((item) => (item.id === selectedGallery.id ? nextItem : item))
      : [nextItem, ...galleryItems];

    persistGalleryItems(nextItems);
    handleCloseModal();
  };

  const handleDelete = () => {
    if (!selectedGallery) return;

    const nextItems = galleryItems.filter((item) => item.id !== selectedGallery.id);
    persistGalleryItems(nextItems);
    setSelectedGallery(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-green-100">Galeri Kegiatan</p>
            <h1 className="mt-2 text-3xl font-bold">Dokumentasikan kegiatan toko dan komunitas dengan rapi.</h1>
            <p className="mt-3 text-sm text-green-50/90">
              Upload beberapa foto sekaligus, lalu lengkapi title, deskripsi, lokasi, dan tanggal kegiatan agar dokumentasi lebih mudah dicari.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-green-800 shadow-sm transition hover:bg-green-50"
          >
            <Plus className="h-5 w-5" />
            Tambah Galeri
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Daftar Dokumentasi</h2>
            <p className="text-sm text-gray-500">
              {visibleGalleryItems.length} kegiatan siap ditampilkan
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari title, lokasi, atau deskripsi..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>
      </div>

      {visibleGalleryItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700">
            <ImagePlus className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-900">Belum ada galeri kegiatan</h3>
          <p className="mt-2 text-sm text-gray-500">
            Tambahkan dokumentasi pertama agar kegiatan tim lebih mudah dipantau.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            <Upload className="h-5 w-5" />
            Upload Kegiatan
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleGalleryItems.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img
                  src={item.images[0]?.url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                  {item.images.length} foto
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{item.description}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-700" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-700" />
                    <span>{item.activityDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-gray-400">Diunggah oleh {item.createdBy}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 hover:text-green-700"
                      title="Edit galeri"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGallery(item);
                        setIsDeleteModalOpen(true);
                      }}
                      className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                      title="Hapus galeri"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {item.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {item.images.slice(1, 5).map((image) => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt={image.name}
                        className="h-16 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedGallery ? 'Edit Galeri Kegiatan' : 'Tambah Galeri Kegiatan'}
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Title Kegiatan</label>
              <input
                type="text"
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Contoh: Pelatihan Budidaya Cabai Organik"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tanggal Kegiatan</label>
              <input
                type="date"
                value={formData.activityDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, activityDate: event.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Lokasi</label>
            <input
              type="text"
              value={formData.location}
              onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
              placeholder="Contoh: Trubus Cimanggis, Depok"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Tuliskan ringkasan kegiatan, peserta, atau hasil utamanya."
              rows={5}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Upload Gambar</label>
                <p className="text-xs text-gray-500">Bisa pilih beberapa file sekaligus.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100">
                <Upload className="h-4 w-4" />
                Pilih Gambar
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {selectedImages.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {selectedImages.map((image) => (
                  <div key={image.id} className="overflow-hidden rounded-2xl border border-gray-200">
                    <div className="relative h-40 bg-gray-100">
                      <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute right-3 top-3 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-red-600"
                        title="Hapus gambar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="truncate px-3 py-2 text-xs text-gray-500">{image.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                Belum ada gambar yang dipilih.
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button
              onClick={handleCloseModal}
              className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              {selectedGallery ? 'Simpan Perubahan' : 'Simpan Galeri'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Galeri"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm leading-6 text-gray-600">
            Galeri <span className="font-semibold text-gray-900">{selectedGallery?.title}</span> akan dihapus dari daftar dokumentasi.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GalleryManagement;
