import React, { useState } from 'react';
import { Search, Building2, Phone, Mail, MapPin, MoreVertical, Plus, Trash2, Edit, Eye, X, Calendar, FileText } from 'lucide-react';
import Modal from './Modal';

interface CooperationHistory {
    id: string;
    title: string;
    type: 'Kontrak' | 'Laporan' | 'Invoice' | 'Lainnya';
    date: string;
    status: 'active' | 'completed' | 'pending';
}

interface Client {
    id: string;
    name: string;
    type: 'Perusahaan' | 'Ritel' | 'Pemerintahan';
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive';
    history: CooperationHistory[];
}

const dummyClients: Client[] = [
    {
        id: '1',
        name: 'PT Maju Bersama',
        type: 'Perusahaan',
        contactPerson: 'Budi Santoso',
        email: 'contact@majubersama.com',
        phone: '0812-3456-7890',
        address: 'Jl. Sudirman No. 45, Jakarta Selatan',
        status: 'active',
        history: [
            { id: 'h1', title: 'Kontrak Suplai Pupuk 2023', type: 'Kontrak', date: '2023-01-10', status: 'completed' },
            { id: 'h2', title: 'Kontrak Suplai Pupuk 2024', type: 'Kontrak', date: '2024-01-15', status: 'active' },
        ]
    },
    {
        id: '2',
        name: 'Toko Tani Sejahtera',
        type: 'Ritel',
        contactPerson: 'Siti Aminah',
        email: 'info@tanisejahtera.com',
        phone: '0813-9876-5432',
        address: 'Jl. Raya Bogor KM 25, Depok',
        status: 'active',
        history: [
            { id: 'h3', title: 'Invoice Pembelian Maret', type: 'Invoice', date: '2024-03-01', status: 'completed' },
        ]
    },
    {
        id: '3',
        name: 'Dinas Pertanian Kota Bandung',
        type: 'Pemerintahan',
        contactPerson: 'Dr. Asep Hidayat',
        email: 'dinas@bandung.go.id',
        phone: '022-4567890',
        address: 'Jl. Soekarno Hatta No. 100, Bandung',
        status: 'active',
        history: []
    },
    {
        id: '4',
        name: 'CV Berkah Alam',
        type: 'Perusahaan',
        contactPerson: 'Rudi Wijaya',
        email: 'berkahalam@gmail.com',
        phone: '0896-1234-5678',
        address: 'Jl. Kaliurang KM 5, Yogyakarta',
        status: 'inactive',
        history: []
    },
];

const ClientManagement: React.FC = () => {
    const [clients, setClients] = useState<Client[]>(dummyClients);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals & State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form Data
    const [formData, setFormData] = useState<Omit<Client, 'id' | 'history'> & { id?: string }>({
        name: '',
        type: 'Perusahaan',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
    });

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Aktif</span>
        ) : (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Tidak Aktif</span>
        );
    };

    const handleAdd = () => {
        setIsEditMode(false);
        setFormData({
            name: '',
            type: 'Perusahaan',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            status: 'active',
        });
        setIsFormModalOpen(true);
    };

    const handleEdit = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditMode(true);
        setFormData({
            id: client.id,
            name: client.name,
            type: client.type,
            contactPerson: client.contactPerson,
            email: client.email,
            phone: client.phone,
            address: client.address,
            status: client.status,
        });
        setIsFormModalOpen(true);
    };

    const handleSave = () => {
        if (isEditMode && formData.id) {
            setClients(clients.map(c => c.id === formData.id ? { ...c, ...formData } as Client : c));
        } else {
            const newClient: Client = {
                id: (clients.length + 1).toString(),
                history: [],
                ...(formData as Omit<Client, 'id' | 'history'>)
            };
            setClients([...clients, newClient]);
        }
        setIsFormModalOpen(false);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Apakah Anda yakin ingin menghapus klien ini?')) {
            setClients(clients.filter(c => c.id !== id));
            setIsDetailModalOpen(false); // Close detail if open
        }
    };

    const handleRowClick = (client: Client) => {
        setSelectedClient(client);
        setIsDetailModalOpen(true);
    };

    const getHistoryStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {status === 'active' ? 'Berjalan' : status === 'completed' ? 'Selesai' : 'Pending'}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari klien, CP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Tambah Klien</span>
                </button>
            </div>

            {/* Table View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nama Perusahaan</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tipe</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Kontak (CP)</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email / Telepon</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredClients.map((client) => (
                                <tr
                                    key={client.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleRowClick(client)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <Building2 className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{client.name}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{client.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">{client.type}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{client.contactPerson}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-gray-400" />
                                                {client.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-gray-400" />
                                                {client.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(client.status)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => handleEdit(client, e)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(client.id, e)}
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
                {filteredClients.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Tidak ada klien ditemukan</p>
                    </div>
                )}
            </div>

            {/* Form Modal (Add/Edit) */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={isEditMode ? "Edit Klien" : "Tambah Klien Baru"}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Klien / Perusahaan</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Contoh: PT Sumber Makmur"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="Perusahaan">Perusahaan</option>
                                <option value="Ritel">Ritel</option>
                                <option value="Pemerintahan">Pemerintahan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person (CP)</label>
                        <input
                            type="text"
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Nama Lengkap CP"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="0812..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows={3}
                            placeholder="Alamat kantor/lokasi"
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => setIsFormModalOpen(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Simpan Klien
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Detail Modal */}
            {selectedClient && (
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    title="Detail Klien"
                >
                    <div className="space-y-6">
                        {/* Header Profile */}
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <Building2 className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{selectedClient.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{selectedClient.type}</p>
                                {getStatusBadge(selectedClient.status)}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Contact Person</p>
                                <p className="font-medium text-gray-900">{selectedClient.contactPerson}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Telepon</p>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {selectedClient.phone}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    {selectedClient.email}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Alamat</p>
                                <div className="flex items-start gap-2 text-gray-900">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    {selectedClient.address}
                                </div>
                            </div>
                        </div>

                        {/* Cooperation History */}
                        <div className="pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-600" />
                                Riwayat Kerjasama
                            </h4>

                            {selectedClient.history.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedClient.history.map(history => (
                                        <div key={history.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-medium text-gray-900">{history.title}</p>
                                                {getHistoryStatusBadge(history.status)}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {history.date}
                                                </span>
                                                <span>{history.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <p className="text-gray-500 text-sm">Belum ada riwayat kerjasama</p>
                                    <button className="mt-2 text-sm text-green-600 font-medium hover:underline">
                                        + Buat Kontrak Baru
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-gray-100">
                            <button
                                onClick={(e) => handleDelete(selectedClient.id, e as any)}
                                className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex justify-center items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Hapus Klien
                            </button>
                            <button
                                onClick={(e) => handleEdit(selectedClient, e as any)}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Data
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ClientManagement;
