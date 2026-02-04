// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  avatar: string;
}

export interface Expert {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  rating: number;
  totalConsultations: number;
  status: 'available' | 'busy' | 'offline';
  avatar: string;
  bio: string;
  price: number;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
  publishDate: string;
  views: number;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image: string;
  description: string;
  rating: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  orderDate: string;
  shippingAddress: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'e_wallet' | 'cod';
  accountNumber?: string;
  accountName?: string;
  isActive: boolean;
  logo: string;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  commissionRate: number;
  minOrderAmount: number;
  freeShippingThreshold: number;
}

// Dummy Data
export const dummyUsers: User[] = [
  { id: '1', name: 'Ahmad Sutrisno', email: 'ahmad@email.com', phone: '081234567890', role: 'customer', status: 'active', joinDate: '2024-01-15', totalOrders: 12, totalSpent: 2500000, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: '2', name: 'Siti Rahayu', email: 'siti@email.com', phone: '081234567891', role: 'customer', status: 'active', joinDate: '2024-02-20', totalOrders: 8, totalSpent: 1800000, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: '3', name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567892', role: 'customer', status: 'active', joinDate: '2024-03-10', totalOrders: 15, totalSpent: 3200000, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
  { id: '4', name: 'Dewi Lestari', email: 'dewi@email.com', phone: '081234567893', role: 'customer', status: 'inactive', joinDate: '2024-01-25', totalOrders: 3, totalSpent: 450000, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: '5', name: 'Eko Prasetyo', email: 'eko@email.com', phone: '081234567894', role: 'admin', status: 'active', joinDate: '2023-12-01', totalOrders: 0, totalSpent: 0, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
  { id: '6', name: 'Fitri Handayani', email: 'fitri@email.com', phone: '081234567895', role: 'customer', status: 'active', joinDate: '2024-04-05', totalOrders: 6, totalSpent: 980000, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
  { id: '7', name: 'Gunawan Wijaya', email: 'gunawan@email.com', phone: '081234567896', role: 'customer', status: 'banned', joinDate: '2024-02-14', totalOrders: 2, totalSpent: 150000, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop' },
  { id: '8', name: 'Hana Permata', email: 'hana@email.com', phone: '081234567897', role: 'customer', status: 'active', joinDate: '2024-05-12', totalOrders: 9, totalSpent: 1650000, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  { id: '9', name: 'Irfan Hakim', email: 'irfan@email.com', phone: '081234567898', role: 'customer', status: 'active', joinDate: '2024-03-28', totalOrders: 11, totalSpent: 2100000, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop' },
  { id: '10', name: 'Joko Widodo', email: 'joko@email.com', phone: '081234567899', role: 'customer', status: 'active', joinDate: '2024-06-01', totalOrders: 4, totalSpent: 720000, avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop' },
  { id: '11', name: 'Kartini Sari', email: 'kartini@email.com', phone: '081234567800', role: 'customer', status: 'active', joinDate: '2024-04-18', totalOrders: 7, totalSpent: 1350000, avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop' },
  { id: '12', name: 'Lukman Hakim', email: 'lukman@email.com', phone: '081234567801', role: 'admin', status: 'active', joinDate: '2023-11-15', totalOrders: 0, totalSpent: 0, avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop' },
];

export const dummyExperts: Expert[] = [
  { id: '1', name: 'Dr. Agus Setiawan', email: 'agus@tani.com', phone: '081111111111', specialization: 'Tanaman Pangan', experience: 15, rating: 4.9, totalConsultations: 234, status: 'available', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop', bio: 'Ahli tanaman pangan dengan pengalaman 15 tahun di bidang pertanian berkelanjutan.', price: 150000 },
  { id: '2', name: 'Ir. Maya Putri', email: 'maya@tani.com', phone: '081111111112', specialization: 'Hortikultura', experience: 12, rating: 4.8, totalConsultations: 189, status: 'available', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop', bio: 'Spesialis hortikultura dan budidaya sayuran organik.', price: 125000 },
  { id: '3', name: 'Prof. Bambang Kusuma', email: 'bambang@tani.com', phone: '081111111113', specialization: 'Hama & Penyakit', experience: 20, rating: 4.95, totalConsultations: 312, status: 'busy', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop', bio: 'Profesor di bidang proteksi tanaman dan pengendalian hama terpadu.', price: 200000 },
  { id: '4', name: 'Dr. Citra Dewi', email: 'citra@tani.com', phone: '081111111114', specialization: 'Tanah & Pupuk', experience: 10, rating: 4.7, totalConsultations: 156, status: 'available', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop', bio: 'Ahli kesuburan tanah dan pemupukan berimbang.', price: 135000 },
  { id: '5', name: 'Ir. Dedi Kurniawan', email: 'dedi@tani.com', phone: '081111111115', specialization: 'Irigasi & Air', experience: 8, rating: 4.6, totalConsultations: 98, status: 'offline', avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop', bio: 'Spesialis sistem irigasi dan manajemen air pertanian.', price: 120000 },
  { id: '6', name: 'Dr. Endang Sulistyowati', email: 'endang@tani.com', phone: '081111111116', specialization: 'Perkebunan', experience: 18, rating: 4.85, totalConsultations: 267, status: 'available', avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop', bio: 'Pakar perkebunan kelapa sawit dan karet.', price: 175000 },
  { id: '7', name: 'Ir. Fajar Nugroho', email: 'fajar@tani.com', phone: '081111111117', specialization: 'Peternakan', experience: 14, rating: 4.75, totalConsultations: 201, status: 'available', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop', bio: 'Ahli peternakan unggas dan ternak ruminansia.', price: 140000 },
  { id: '8', name: 'Dr. Gita Puspita', email: 'gita@tani.com', phone: '081111111118', specialization: 'Pertanian Organik', experience: 11, rating: 4.9, totalConsultations: 178, status: 'busy', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop', bio: 'Pionir pertanian organik dan sistem pertanian berkelanjutan.', price: 160000 },
];

export const dummyArticles: Article[] = [
  { id: '1', title: 'Panduan Lengkap Menanam Padi Organik', category: 'Tanaman Pangan', content: 'Artikel lengkap tentang cara menanam padi organik...', author: 'Dr. Agus Setiawan', status: 'published', publishDate: '2024-01-10', views: 1250, image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop' },
  { id: '2', title: 'Tips Memilih Bibit Unggul untuk Pertanian', category: 'Tips & Trik', content: 'Cara memilih bibit yang berkualitas...', author: 'Ir. Maya Putri', status: 'published', publishDate: '2024-01-15', views: 980, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop' },
  { id: '3', title: 'Mengenal Hama Wereng dan Cara Pengendaliannya', category: 'Hama & Penyakit', content: 'Wereng adalah salah satu hama utama...', author: 'Prof. Bambang Kusuma', status: 'published', publishDate: '2024-02-01', views: 2100, image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop' },
  { id: '4', title: 'Cara Membuat Pupuk Kompos dari Limbah Rumah Tangga', category: 'Pupuk & Tanah', content: 'Panduan membuat kompos organik...', author: 'Dr. Citra Dewi', status: 'published', publishDate: '2024-02-10', views: 1560, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop' },
  { id: '5', title: 'Sistem Irigasi Tetes untuk Lahan Kering', category: 'Irigasi', content: 'Irigasi tetes adalah solusi hemat air...', author: 'Ir. Dedi Kurniawan', status: 'draft', publishDate: '2024-02-20', views: 0, image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop' },
  { id: '6', title: 'Budidaya Cabai Rawit yang Menguntungkan', category: 'Hortikultura', content: 'Cabai rawit memiliki nilai ekonomi tinggi...', author: 'Ir. Maya Putri', status: 'published', publishDate: '2024-03-01', views: 1890, image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&h=300&fit=crop' },
  { id: '7', title: 'Mengenal Pertanian Hidroponik Modern', category: 'Teknologi', content: 'Hidroponik adalah metode bercocok tanam...', author: 'Dr. Gita Puspita', status: 'published', publishDate: '2024-03-10', views: 2340, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' },
  { id: '8', title: 'Cara Merawat Tanaman Saat Musim Hujan', category: 'Tips & Trik', content: 'Musim hujan membawa tantangan tersendiri...', author: 'Dr. Agus Setiawan', status: 'published', publishDate: '2024-03-15', views: 1120, image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=300&fit=crop' },
  { id: '9', title: 'Peluang Bisnis Pertanian Vertikal di Perkotaan', category: 'Bisnis', content: 'Urban farming semakin populer...', author: 'Dr. Gita Puspita', status: 'draft', publishDate: '2024-03-20', views: 0, image: 'https://images.unsplash.com/photo-1530836176759-510f58baebf4?w=400&h=300&fit=crop' },
  { id: '10', title: 'Panduan Lengkap Budidaya Jamur Tiram', category: 'Hortikultura', content: 'Jamur tiram adalah komoditas yang menjanjikan...', author: 'Ir. Fajar Nugroho', status: 'published', publishDate: '2024-04-01', views: 1670, image: 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=300&fit=crop' },
  { id: '11', title: 'Teknologi Drone untuk Pertanian Presisi', category: 'Teknologi', content: 'Drone pertanian membantu monitoring...', author: 'Prof. Bambang Kusuma', status: 'archived', publishDate: '2024-04-10', views: 890, image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop' },
  { id: '12', title: 'Mengatasi Penyakit Layu Fusarium pada Tomat', category: 'Hama & Penyakit', content: 'Fusarium adalah jamur patogen...', author: 'Prof. Bambang Kusuma', status: 'published', publishDate: '2024-04-15', views: 1430, image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=300&fit=crop' },
];

export const dummyProducts: Product[] = [
  { id: '1', name: 'Benih Padi Ciherang Super', category: 'Benih', price: 85000, stock: 150, sold: 234, status: 'active', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop', description: 'Benih padi varietas Ciherang dengan kualitas super', rating: 4.8 },
  { id: '2', name: 'Pupuk NPK Phonska 15-15-15', category: 'Pupuk', price: 320000, stock: 80, sold: 156, status: 'active', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', description: 'Pupuk majemuk NPK untuk semua jenis tanaman', rating: 4.7 },
  { id: '3', name: 'Cangkul Baja Anti Karat', category: 'Alat', price: 175000, stock: 45, sold: 89, status: 'active', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', description: 'Cangkul berkualitas tinggi dengan gagang kayu jati', rating: 4.9 },
  { id: '4', name: 'Benih Cabai Rawit Dewata', category: 'Benih', price: 45000, stock: 200, sold: 312, status: 'active', image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&h=300&fit=crop', description: 'Benih cabai rawit dengan tingkat kepedasan tinggi', rating: 4.6 },
  { id: '5', name: 'Sprayer Elektrik 16L', category: 'Alat', price: 450000, stock: 25, sold: 67, status: 'active', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', description: 'Sprayer elektrik dengan kapasitas 16 liter', rating: 4.8 },
  { id: '6', name: 'Pupuk Organik Cair Bio-G', category: 'Pupuk', price: 125000, stock: 120, sold: 198, status: 'active', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', description: 'Pupuk organik cair untuk pertumbuhan optimal', rating: 4.5 },
  { id: '7', name: 'Benih Tomat Cherry', category: 'Benih', price: 35000, stock: 180, sold: 245, status: 'active', image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=300&fit=crop', description: 'Benih tomat cherry import berkualitas', rating: 4.7 },
  { id: '8', name: 'Gunting Stek Profesional', category: 'Alat', price: 95000, stock: 60, sold: 134, status: 'active', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', description: 'Gunting stek dengan pisau tajam dan ergonomis', rating: 4.9 },
  { id: '9', name: 'Pestisida Organik Neem Oil', category: 'Pestisida', price: 85000, stock: 90, sold: 167, status: 'active', image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop', description: 'Pestisida alami dari minyak mimba', rating: 4.6 },
  { id: '10', name: 'Benih Jagung Manis Bonanza', category: 'Benih', price: 55000, stock: 0, sold: 289, status: 'out_of_stock', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop', description: 'Benih jagung manis dengan rasa premium', rating: 4.8 },
  { id: '11', name: 'Mulsa Plastik Hitam Perak', category: 'Perlengkapan', price: 280000, stock: 35, sold: 78, status: 'active', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', description: 'Mulsa plastik untuk menekan gulma', rating: 4.4 },
  { id: '12', name: 'Pupuk Kandang Fermentasi', category: 'Pupuk', price: 45000, stock: 200, sold: 356, status: 'active', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', description: 'Pupuk kandang yang sudah difermentasi sempurna', rating: 4.7 },
  { id: '13', name: 'Selang Irigasi Tetes 100m', category: 'Perlengkapan', price: 350000, stock: 40, sold: 56, status: 'active', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', description: 'Selang irigasi tetes dengan emitter', rating: 4.5 },
  { id: '14', name: 'Benih Bayam Hijau', category: 'Benih', price: 25000, stock: 250, sold: 423, status: 'active', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop', description: 'Benih bayam hijau cepat panen', rating: 4.6 },
  { id: '15', name: 'Traktor Mini 2 Roda', category: 'Alat', price: 15500000, stock: 5, sold: 12, status: 'active', image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop', description: 'Traktor mini untuk lahan kecil dan menengah', rating: 4.9 },
  { id: '16', name: 'Fungisida Sistemik Antracol', category: 'Pestisida', price: 95000, stock: 75, sold: 145, status: 'active', image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop', description: 'Fungisida untuk mengendalikan jamur', rating: 4.5 },
  { id: '17', name: 'Polybag Hitam 35x35 (100pcs)', category: 'Perlengkapan', price: 65000, stock: 150, sold: 234, status: 'active', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', description: 'Polybag untuk pembibitan tanaman', rating: 4.3 },
  { id: '18', name: 'Benih Melon Golden', category: 'Benih', price: 75000, stock: 85, sold: 167, status: 'active', image: 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=400&h=300&fit=crop', description: 'Benih melon golden dengan rasa manis', rating: 4.7 },
  { id: '19', name: 'Sabit Bergerigi Premium', category: 'Alat', price: 125000, stock: 55, sold: 98, status: 'active', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', description: 'Sabit dengan mata bergerigi untuk memotong rumput', rating: 4.8 },
  { id: '20', name: 'Pupuk Daun Gandasil D', category: 'Pupuk', price: 35000, stock: 180, sold: 278, status: 'active', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', description: 'Pupuk daun untuk fase vegetatif', rating: 4.6 },
];

export const dummyOrders: Order[] = [
  { id: '1', orderNumber: 'ORD-2024-001', customerName: 'Ahmad Sutrisno', customerEmail: 'ahmad@email.com', items: [{ name: 'Benih Padi Ciherang Super', qty: 5, price: 85000 }, { name: 'Pupuk NPK Phonska', qty: 2, price: 320000 }], total: 1065000, status: 'delivered', paymentMethod: 'Bank BCA', paymentStatus: 'paid', orderDate: '2024-01-15', shippingAddress: 'Jl. Tani Makmur No. 15, Subang' },
  { id: '2', orderNumber: 'ORD-2024-002', customerName: 'Siti Rahayu', customerEmail: 'siti@email.com', items: [{ name: 'Sprayer Elektrik 16L', qty: 1, price: 450000 }], total: 450000, status: 'shipped', paymentMethod: 'GoPay', paymentStatus: 'paid', orderDate: '2024-01-18', shippingAddress: 'Jl. Sawah Indah No. 8, Karawang' },
  { id: '3', orderNumber: 'ORD-2024-003', customerName: 'Budi Santoso', customerEmail: 'budi@email.com', items: [{ name: 'Benih Cabai Rawit Dewata', qty: 10, price: 45000 }, { name: 'Pupuk Organik Cair Bio-G', qty: 3, price: 125000 }], total: 825000, status: 'processing', paymentMethod: 'Bank Mandiri', paymentStatus: 'paid', orderDate: '2024-01-20', shippingAddress: 'Jl. Petani Jaya No. 22, Indramayu' },
  { id: '4', orderNumber: 'ORD-2024-004', customerName: 'Dewi Lestari', customerEmail: 'dewi@email.com', items: [{ name: 'Cangkul Baja Anti Karat', qty: 2, price: 175000 }], total: 350000, status: 'pending', paymentMethod: 'Bank BRI', paymentStatus: 'unpaid', orderDate: '2024-01-22', shippingAddress: 'Jl. Desa Makmur No. 5, Cirebon' },
  { id: '5', orderNumber: 'ORD-2024-005', customerName: 'Fitri Handayani', customerEmail: 'fitri@email.com', items: [{ name: 'Benih Tomat Cherry', qty: 8, price: 35000 }, { name: 'Polybag Hitam 35x35', qty: 2, price: 65000 }], total: 410000, status: 'delivered', paymentMethod: 'OVO', paymentStatus: 'paid', orderDate: '2024-01-25', shippingAddress: 'Jl. Kebun Raya No. 12, Bogor' },
  { id: '6', orderNumber: 'ORD-2024-006', customerName: 'Hana Permata', customerEmail: 'hana@email.com', items: [{ name: 'Pestisida Organik Neem Oil', qty: 4, price: 85000 }, { name: 'Gunting Stek Profesional', qty: 1, price: 95000 }], total: 435000, status: 'shipped', paymentMethod: 'Bank BCA', paymentStatus: 'paid', orderDate: '2024-01-28', shippingAddress: 'Jl. Taman Sari No. 7, Bandung' },
  { id: '7', orderNumber: 'ORD-2024-007', customerName: 'Irfan Hakim', customerEmail: 'irfan@email.com', items: [{ name: 'Traktor Mini 2 Roda', qty: 1, price: 15500000 }], total: 15500000, status: 'processing', paymentMethod: 'Bank Mandiri', paymentStatus: 'paid', orderDate: '2024-02-01', shippingAddress: 'Jl. Pertanian No. 45, Garut' },
  { id: '8', orderNumber: 'ORD-2024-008', customerName: 'Joko Widodo', customerEmail: 'joko@email.com', items: [{ name: 'Selang Irigasi Tetes 100m', qty: 2, price: 350000 }, { name: 'Mulsa Plastik Hitam Perak', qty: 1, price: 280000 }], total: 980000, status: 'cancelled', paymentMethod: 'COD', paymentStatus: 'refunded', orderDate: '2024-02-05', shippingAddress: 'Jl. Desa Sejahtera No. 3, Tasikmalaya' },
  { id: '9', orderNumber: 'ORD-2024-009', customerName: 'Kartini Sari', customerEmail: 'kartini@email.com', items: [{ name: 'Benih Bayam Hijau', qty: 15, price: 25000 }, { name: 'Pupuk Kandang Fermentasi', qty: 5, price: 45000 }], total: 600000, status: 'delivered', paymentMethod: 'DANA', paymentStatus: 'paid', orderDate: '2024-02-08', shippingAddress: 'Jl. Sawah Luas No. 18, Cianjur' },
  { id: '10', orderNumber: 'ORD-2024-010', customerName: 'Ahmad Sutrisno', customerEmail: 'ahmad@email.com', items: [{ name: 'Benih Melon Golden', qty: 6, price: 75000 }, { name: 'Pupuk Daun Gandasil D', qty: 4, price: 35000 }], total: 590000, status: 'pending', paymentMethod: 'Bank BNI', paymentStatus: 'unpaid', orderDate: '2024-02-10', shippingAddress: 'Jl. Tani Makmur No. 15, Subang' },
  { id: '11', orderNumber: 'ORD-2024-011', customerName: 'Budi Santoso', customerEmail: 'budi@email.com', items: [{ name: 'Fungisida Sistemik Antracol', qty: 3, price: 95000 }, { name: 'Sabit Bergerigi Premium', qty: 2, price: 125000 }], total: 535000, status: 'shipped', paymentMethod: 'GoPay', paymentStatus: 'paid', orderDate: '2024-02-12', shippingAddress: 'Jl. Petani Jaya No. 22, Indramayu' },
  { id: '12', orderNumber: 'ORD-2024-012', customerName: 'Siti Rahayu', customerEmail: 'siti@email.com', items: [{ name: 'Benih Padi Ciherang Super', qty: 10, price: 85000 }], total: 850000, status: 'processing', paymentMethod: 'Bank BCA', paymentStatus: 'paid', orderDate: '2024-02-15', shippingAddress: 'Jl. Sawah Indah No. 8, Karawang' },
  { id: '13', orderNumber: 'ORD-2024-013', customerName: 'Fitri Handayani', customerEmail: 'fitri@email.com', items: [{ name: 'Sprayer Elektrik 16L', qty: 1, price: 450000 }, { name: 'Pestisida Organik Neem Oil', qty: 2, price: 85000 }], total: 620000, status: 'pending', paymentMethod: 'OVO', paymentStatus: 'unpaid', orderDate: '2024-02-18', shippingAddress: 'Jl. Kebun Raya No. 12, Bogor' },
  { id: '14', orderNumber: 'ORD-2024-014', customerName: 'Hana Permata', customerEmail: 'hana@email.com', items: [{ name: 'Pupuk NPK Phonska 15-15-15', qty: 3, price: 320000 }], total: 960000, status: 'delivered', paymentMethod: 'Bank Mandiri', paymentStatus: 'paid', orderDate: '2024-02-20', shippingAddress: 'Jl. Taman Sari No. 7, Bandung' },
  { id: '15', orderNumber: 'ORD-2024-015', customerName: 'Irfan Hakim', customerEmail: 'irfan@email.com', items: [{ name: 'Cangkul Baja Anti Karat', qty: 3, price: 175000 }, { name: 'Gunting Stek Profesional', qty: 2, price: 95000 }], total: 715000, status: 'shipped', paymentMethod: 'DANA', paymentStatus: 'paid', orderDate: '2024-02-22', shippingAddress: 'Jl. Pertanian No. 45, Garut' },
];

export const dummyPaymentMethods: PaymentMethod[] = [
  { id: '1', name: 'Bank BCA', type: 'bank_transfer', accountNumber: '1234567890', accountName: 'PT Toko Tani Indonesia', isActive: true, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/200px-Bank_Central_Asia.svg.png' },
  { id: '2', name: 'Bank Mandiri', type: 'bank_transfer', accountNumber: '0987654321', accountName: 'PT Toko Tani Indonesia', isActive: true, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/200px-Bank_Mandiri_logo_2016.svg.png' },
  { id: '3', name: 'Bank BRI', type: 'bank_transfer', accountNumber: '1122334455', accountName: 'PT Toko Tani Indonesia', isActive: true, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/200px-BANK_BRI_logo.svg.png' },
  { id: '4', name: 'Bank BNI', type: 'bank_transfer', accountNumber: '5544332211', accountName: 'PT Toko Tani Indonesia', isActive: false, logo: 'https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/200px-BNI_logo.svg.png' },
  { id: '5', name: 'GoPay', type: 'e_wallet', accountNumber: '081234567890', accountName: 'Toko Tani', isActive: true, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/200px-Gopay_logo.svg.png' },
  { id: '6', name: 'OVO', type: 'e_wallet', accountNumber: '081234567890', accountName: 'Toko Tani', isActive: true, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/200px-Logo_ovo_purple.svg.png' },
  { id: '7', name: 'DANA', type: 'e_wallet', accountNumber: '081234567890', accountName: 'Toko Tani', isActive: true, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/200px-Logo_dana_blue.svg.png' },
  { id: '8', name: 'COD (Cash on Delivery)', type: 'cod', isActive: true, logo: '' },
];

export const defaultSystemSettings: SystemSettings = {
  siteName: 'Trubus Management',
  siteDescription: 'Platform e-commerce pertanian terlengkap di Indonesia',
  contactEmail: 'info@tokotani.com',
  contactPhone: '021-12345678',
  address: 'Jl. Pertanian Raya No. 100, Jakarta Selatan',
  commissionRate: 5,
  minOrderAmount: 50000,
  freeShippingThreshold: 500000,
};

// Statistics data
export const statisticsData = {
  totalRevenue: 125680000,
  totalOrders: 1234,
  totalUsers: 856,
  totalProducts: 156,
  totalExperts: 8,
  totalConsultations: 1635,
  totalArticles: 48,
  pendingOrders: 23,
  monthlyRevenue: [
    { month: 'Jan', revenue: 8500000 },
    { month: 'Feb', revenue: 9200000 },
    { month: 'Mar', revenue: 11500000 },
    { month: 'Apr', revenue: 10800000 },
    { month: 'May', revenue: 12300000 },
    { month: 'Jun', revenue: 14500000 },
    { month: 'Jul', revenue: 13200000 },
    { month: 'Aug', revenue: 15800000 },
    { month: 'Sep', revenue: 14200000 },
    { month: 'Oct', revenue: 16500000 },
    { month: 'Nov', revenue: 18200000 },
    { month: 'Dec', revenue: 21000000 },
  ],
  categoryDistribution: [
    { category: 'Benih', percentage: 35, color: '#22c55e' },
    { category: 'Pupuk', percentage: 28, color: '#16a34a' },
    { category: 'Alat', percentage: 20, color: '#15803d' },
    { category: 'Pestisida', percentage: 10, color: '#166534' },
    { category: 'Perlengkapan', percentage: 7, color: '#14532d' },
  ],
  recentActivities: [
    { id: 1, type: 'order', message: 'Pesanan baru #ORD-2024-015 dari Irfan Hakim', time: '5 menit lalu' },
    { id: 2, type: 'user', message: 'User baru terdaftar: Kartini Sari', time: '15 menit lalu' },
    { id: 3, type: 'consultation', message: 'Konsultasi selesai dengan Dr. Agus Setiawan', time: '30 menit lalu' },
    { id: 4, type: 'product', message: 'Stok Benih Jagung Manis Bonanza habis', time: '1 jam lalu' },
    { id: 5, type: 'order', message: 'Pesanan #ORD-2024-014 telah dikirim', time: '2 jam lalu' },
    { id: 6, type: 'article', message: 'Artikel baru dipublikasikan: Tips Menanam Padi', time: '3 jam lalu' },
    { id: 7, type: 'payment', message: 'Pembayaran diterima untuk #ORD-2024-012', time: '4 jam lalu' },
    { id: 8, type: 'expert', message: 'Dr. Gita Puspita mengubah status ke Available', time: '5 jam lalu' },
  ],
  topProducts: [
    { name: 'Benih Bayam Hijau', sold: 423, revenue: 10575000 },
    { name: 'Pupuk Kandang Fermentasi', sold: 356, revenue: 16020000 },
    { name: 'Benih Cabai Rawit Dewata', sold: 312, revenue: 14040000 },
    { name: 'Benih Jagung Manis Bonanza', sold: 289, revenue: 15895000 },
    { name: 'Pupuk Daun Gandasil D', sold: 278, revenue: 9730000 },
  ],
};
