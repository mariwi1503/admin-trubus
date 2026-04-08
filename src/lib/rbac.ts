export type UserRole = 'customer' | 'super_admin' | 'operational' | 'hr' | 'store_admin';

export type AdminRole = 'super_admin' | 'operational' | 'hr';

export type AdminPageId =
  | 'dashboard'
  | 'stores'
  | 'users'
  | 'experts'
  | 'articles'
  | 'gallery'
  | 'products'
  | 'analytics'
  | 'orders'
  | 'promos'
  | 'careers'
  | 'faqs'
  | 'arsip'
  | 'clients'
  | 'settings'
  | 'live-chat'
  | 'qrcode';

export const normalizeUserRole = (role?: string | null): UserRole => {
  if (role === 'store_admin') return 'operational';
  if (role === 'super_admin' || role === 'operational' || role === 'hr' || role === 'customer') {
    return role;
  }

  return 'customer';
};

export const isAdminRole = (role?: string | null): role is AdminRole =>
  ['super_admin', 'operational', 'hr', 'store_admin'].includes(role || '');

export const isStoreScopedRole = (role?: string | null) =>
  normalizeUserRole(role) === 'operational';

export const getRoleLabel = (role?: string | null) => {
  switch (normalizeUserRole(role)) {
    case 'super_admin':
      return 'Super Admin';
    case 'operational':
      return 'Operational';
    case 'hr':
      return 'HR';
    default:
      return 'Customer';
  }
};

export const getRoleBadgeClass = (role?: string | null) => {
  switch (normalizeUserRole(role)) {
    case 'super_admin':
      return 'bg-amber-100 text-amber-800';
    case 'operational':
      return 'bg-blue-100 text-blue-700';
    case 'hr':
      return 'bg-fuchsia-100 text-fuchsia-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export const rolePermissions: Record<AdminRole, { label: string; pages: AdminPageId[] }> = {
  super_admin: {
    label: 'Akses penuh ke seluruh modul dashboard',
    pages: [
      'dashboard',
      'stores',
      'users',
      'experts',
      'articles',
      'gallery',
      'products',
      'analytics',
      'orders',
      'promos',
      'careers',
      'faqs',
      'arsip',
      'clients',
      'settings',
      'live-chat',
      'qrcode',
    ],
  },
  operational: {
    label: 'Fokus pada operasional toko, pesanan, katalog, galeri, dan analitik',
    pages: ['dashboard', 'gallery', 'products', 'analytics', 'orders', 'live-chat'],
  },
  hr: {
    label: 'Fokus pada pengelolaan admin/user internal dan lowongan kerja',
    pages: ['dashboard', 'users', 'gallery', 'careers'],
  },
};

export const hasPageAccess = (role: string | undefined, pageId: AdminPageId) => {
  const normalized = normalizeUserRole(role);
  if (normalized === 'customer') return false;
  return rolePermissions[normalized as AdminRole].pages.includes(pageId);
};
