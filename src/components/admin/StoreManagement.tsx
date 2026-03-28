import React, { useState } from 'react';
import { Store, dummyStores } from '@/data/adminData';
import {
    Plus, Search, MapPin, Phone, User, Store as StoreIcon,
    MoreHorizontal, Edit, Trash2, XCircle, ChevronLeft, ChevronRight,
    ExternalLink
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Modal from './Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StoreDetail from './StoreDetail';

const StoreManagement: React.FC = () => {
    // Initialize with dummyStores for simulation
    const [stores, setStores] = useState<Store[]>(dummyStores);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // View State
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleOpenAddPage = () => {
        setSelectedStore(null);
        setViewMode('detail');
    };

    const handleOpenEditPage = (store: Store) => {
        setSelectedStore(store);
        setViewMode('detail');
    };

    const handleOpenDeleteModal = (store: Store) => {
        setSelectedStore(store);
        setShowDeleteModal(true);
    };

    const handleSaveStore = (formData: Partial<Store>, isEdit: boolean) => {
        if (isEdit && selectedStore) {
            // Simulate Update
            const updatedStores = stores.map(store =>
                store.id === selectedStore.id
                    ? { ...store, ...formData } as Store
                    : store
            );
            setStores(updatedStores);
            toast({
                title: "Toko Diperbarui",
                description: `${formData.name} telah berhasil diperbarui (Simulasi).`,
            });
        } else {
            // Simulate Create
            const newStore: Store = {
                id: (Math.max(...stores.map(s => parseInt(s.id))) + 1).toString(),
                ...formData as Omit<Store, 'id'>
            };
            setStores([newStore, ...stores]);
            toast({
                title: "Toko Ditambahkan",
                description: `${formData.name} telah berhasil ditambahkan (Simulasi).`,
            });
        }
        setViewMode('list');
    };

    const handleDelete = () => {
        if (!selectedStore) return;

        // Simulate Delete
        const updatedStores = stores.filter(store => store.id !== selectedStore.id);
        setStores(updatedStores);

        toast({
            title: "Toko Dihapus",
            description: `${selectedStore.name} telah berhasil dihapus (Simulasi).`,
        });
        setShowDeleteModal(false);
    };

    const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
    const paginatedStores = filteredStores.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (viewMode === 'detail') {
        return (
            <StoreDetail 
                store={selectedStore} 
                onSave={handleSaveStore} 
                onBack={() => setViewMode('list')} 
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Manajemen Toko</h2>
                    <p className="text-gray-500">Kelola daftar toko dan cabang (Mode Simulasi)</p>
                </div>
                <button
                    onClick={handleOpenAddPage}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Toko</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari toko atau lokasi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Store List as Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[250px] font-semibold">Nama Toko</TableHead>
                            <TableHead className="font-semibold">Lokasi</TableHead>
                            <TableHead className="font-semibold">Manager</TableHead>
                            <TableHead className="font-semibold">Telepon</TableHead>
                            <TableHead className="w-[100px] text-center font-semibold">Status</TableHead>
                            <TableHead className="text-right font-semibold">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedStores.map((store) => (
                            <TableRow key={store.id} className="hover:bg-gray-50 transition-colors">
                                <TableCell className="font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <StoreIcon className="w-4 h-4 text-green-600" />
                                        </div>
                                        {store.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 max-w-[300px]">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-1">
                                            <span className="line-clamp-2" title={store.location}>{store.location}</span>
                                            <a 
                                                href={store.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.location)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Lihat di Peta
                                            </a>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                                        {store.managerName}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                        {store.contactPhone}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                        store.status === 'active' 
                                            ? 'bg-green-100 text-green-700 border border-green-200' 
                                            : 'bg-red-100 text-red-700 border border-red-200'
                                    }`}>
                                        {store.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => handleOpenEditPage(store)}
                                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded bg-gray-50 border border-gray-100/50 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleOpenDeleteModal(store)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded bg-gray-50 border border-gray-100/50 transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredStores.length === 0 && (
                    <div className="py-12 text-center text-gray-500 bg-white">
                        <StoreIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p>Tidak ada toko yang ditemukan</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <div className="text-sm text-gray-500">
                            Menampilkan <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> hingga{' '}
                            <span className="font-medium text-gray-900">
                                {Math.min(currentPage * itemsPerPage, filteredStores.length)}
                            </span>{' '}
                            dari <span className="font-medium text-gray-900">{filteredStores.length}</span> toko
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === page
                                                ? 'bg-green-600 text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Hapus Toko"
            >
                <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Konfirmasi Hapus</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Apakah Anda yakin ingin menghapus toko <span className="font-bold">{selectedStore?.name}</span>?
                            Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex justify-center items-center gap-2"
                        >
                            Hapus Toko
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StoreManagement;
