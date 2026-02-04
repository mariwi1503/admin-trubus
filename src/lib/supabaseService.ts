import { supabase } from './supabase';
import { 
  User, Expert, Article, Product, Order, PaymentMethod, SystemSettings,
  dummyUsers, dummyExperts, dummyArticles, dummyProducts, dummyOrders, 
  dummyPaymentMethods, defaultSystemSettings 
} from '@/data/adminData';

// Type definitions for database rows
interface DbUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  join_date: string;
  total_orders: number;
  total_spent: number;
  avatar: string;
}

interface DbExpert {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  rating: number;
  total_consultations: number;
  status: 'available' | 'busy' | 'offline';
  avatar: string;
  bio: string;
  price: number;
}

interface DbArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
  publish_date: string;
  views: number;
  image: string;
}

interface DbProduct {
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

interface DbOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_status: 'paid' | 'unpaid' | 'refunded';
  order_date: string;
  shipping_address: string;
}

interface DbPaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'e_wallet' | 'cod';
  account_number: string | null;
  account_name: string | null;
  is_active: boolean;
  logo: string;
}

interface DbSettings {
  id: string;
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  commission_rate: number;
  min_order_amount: number;
  free_shipping_threshold: number;
}

// Conversion functions
const dbToUser = (db: DbUser): User => ({
  id: db.id,
  name: db.name,
  email: db.email,
  phone: db.phone,
  role: db.role,
  status: db.status,
  joinDate: db.join_date,
  totalOrders: db.total_orders,
  totalSpent: db.total_spent,
  avatar: db.avatar,
});

const userToDb = (user: Partial<User>): Partial<DbUser> => ({
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
  join_date: user.joinDate,
  total_orders: user.totalOrders,
  total_spent: user.totalSpent,
  avatar: user.avatar,
});

const dbToExpert = (db: DbExpert): Expert => ({
  id: db.id,
  name: db.name,
  email: db.email,
  phone: db.phone,
  specialization: db.specialization,
  experience: db.experience,
  rating: db.rating,
  totalConsultations: db.total_consultations,
  status: db.status,
  avatar: db.avatar,
  bio: db.bio,
  price: db.price,
});

const expertToDb = (expert: Partial<Expert>): Partial<DbExpert> => ({
  name: expert.name,
  email: expert.email,
  phone: expert.phone,
  specialization: expert.specialization,
  experience: expert.experience,
  rating: expert.rating,
  total_consultations: expert.totalConsultations,
  status: expert.status,
  avatar: expert.avatar,
  bio: expert.bio,
  price: expert.price,
});

const dbToArticle = (db: DbArticle): Article => ({
  id: db.id,
  title: db.title,
  category: db.category,
  content: db.content,
  author: db.author,
  status: db.status,
  publishDate: db.publish_date,
  views: db.views,
  image: db.image,
});

const articleToDb = (article: Partial<Article>): Partial<DbArticle> => ({
  title: article.title,
  category: article.category,
  content: article.content,
  author: article.author,
  status: article.status,
  publish_date: article.publishDate,
  views: article.views,
  image: article.image,
});

const dbToProduct = (db: DbProduct): Product => ({
  id: db.id,
  name: db.name,
  category: db.category,
  price: db.price,
  stock: db.stock,
  sold: db.sold,
  status: db.status,
  image: db.image,
  description: db.description,
  rating: db.rating,
});

const productToDb = (product: Partial<Product>): Partial<DbProduct> => ({
  name: product.name,
  category: product.category,
  price: product.price,
  stock: product.stock,
  sold: product.sold,
  status: product.status,
  image: product.image,
  description: product.description,
  rating: product.rating,
});

const dbToOrder = (db: DbOrder): Order => ({
  id: db.id,
  orderNumber: db.order_number,
  customerName: db.customer_name,
  customerEmail: db.customer_email,
  items: db.items,
  total: db.total,
  status: db.status,
  paymentMethod: db.payment_method,
  paymentStatus: db.payment_status,
  orderDate: db.order_date,
  shippingAddress: db.shipping_address,
});

const orderToDb = (order: Partial<Order>): Partial<DbOrder> => ({
  order_number: order.orderNumber,
  customer_name: order.customerName,
  customer_email: order.customerEmail,
  items: order.items,
  total: order.total,
  status: order.status,
  payment_method: order.paymentMethod,
  payment_status: order.paymentStatus,
  order_date: order.orderDate,
  shipping_address: order.shippingAddress,
});

const dbToPaymentMethod = (db: DbPaymentMethod): PaymentMethod => ({
  id: db.id,
  name: db.name,
  type: db.type,
  accountNumber: db.account_number || undefined,
  accountName: db.account_name || undefined,
  isActive: db.is_active,
  logo: db.logo,
});

const paymentMethodToDb = (pm: Partial<PaymentMethod>): Partial<DbPaymentMethod> => ({
  name: pm.name,
  type: pm.type,
  account_number: pm.accountNumber || null,
  account_name: pm.accountName || null,
  is_active: pm.isActive,
  logo: pm.logo,
});

const dbToSettings = (db: DbSettings): SystemSettings => ({
  siteName: db.site_name,
  siteDescription: db.site_description,
  contactEmail: db.contact_email,
  contactPhone: db.contact_phone,
  address: db.address,
  commissionRate: db.commission_rate,
  minOrderAmount: db.min_order_amount,
  freeShippingThreshold: db.free_shipping_threshold,
});

const settingsToDb = (settings: Partial<SystemSettings>): Partial<DbSettings> => ({
  site_name: settings.siteName,
  site_description: settings.siteDescription,
  contact_email: settings.contactEmail,
  contact_phone: settings.contactPhone,
  address: settings.address,
  commission_rate: settings.commissionRate,
  min_order_amount: settings.minOrderAmount,
  free_shipping_threshold: settings.freeShippingThreshold,
});

// ==================== USERS ====================
export const usersService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToUser);
  },

  async create(user: Omit<User, 'id'>): Promise<User> {
    const { data, error } = await supabase
      .from('admin_users')
      .insert(userToDb(user))
      .select()
      .single();
    
    if (error) throw error;
    return dbToUser(data);
  },

  async update(id: string, user: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('admin_users')
      .update({ ...userToDb(user), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbToUser(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  subscribe(callback: (users: User[]) => void) {
    return supabase
      .channel('admin_users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_users' }, async () => {
        const users = await this.getAll();
        callback(users);
      })
      .subscribe();
  },

  async seedData(): Promise<void> {
    const { data } = await supabase.from('admin_users').select('id').limit(1);
    if (!data || data.length === 0) {
      for (const user of dummyUsers) {
        await supabase.from('admin_users').insert(userToDb(user));
      }
    }
  }
};

// ==================== EXPERTS ====================
export const expertsService = {
  async getAll(): Promise<Expert[]> {
    const { data, error } = await supabase
      .from('admin_experts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToExpert);
  },

  async create(expert: Omit<Expert, 'id'>): Promise<Expert> {
    const { data, error } = await supabase
      .from('admin_experts')
      .insert(expertToDb(expert))
      .select()
      .single();
    
    if (error) throw error;
    return dbToExpert(data);
  },

  async update(id: string, expert: Partial<Expert>): Promise<Expert> {
    const { data, error } = await supabase
      .from('admin_experts')
      .update({ ...expertToDb(expert), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbToExpert(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_experts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  subscribe(callback: (experts: Expert[]) => void) {
    return supabase
      .channel('admin_experts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_experts' }, async () => {
        const experts = await this.getAll();
        callback(experts);
      })
      .subscribe();
  },

  async seedData(): Promise<void> {
    const { data } = await supabase.from('admin_experts').select('id').limit(1);
    if (!data || data.length === 0) {
      for (const expert of dummyExperts) {
        await supabase.from('admin_experts').insert(expertToDb(expert));
      }
    }
  }
};

// ==================== ARTICLES ====================
export const articlesService = {
  async getAll(): Promise<Article[]> {
    const { data, error } = await supabase
      .from('admin_articles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToArticle);
  },

  async create(article: Omit<Article, 'id'>): Promise<Article> {
    const { data, error } = await supabase
      .from('admin_articles')
      .insert(articleToDb(article))
      .select()
      .single();
    
    if (error) throw error;
    return dbToArticle(data);
  },

  async update(id: string, article: Partial<Article>): Promise<Article> {
    const { data, error } = await supabase
      .from('admin_articles')
      .update({ ...articleToDb(article), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbToArticle(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_articles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  subscribe(callback: (articles: Article[]) => void) {
    return supabase
      .channel('admin_articles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_articles' }, async () => {
        const articles = await this.getAll();
        callback(articles);
      })
      .subscribe();
  },

  async seedData(): Promise<void> {
    const { data } = await supabase.from('admin_articles').select('id').limit(1);
    if (!data || data.length === 0) {
      for (const article of dummyArticles) {
        await supabase.from('admin_articles').insert(articleToDb(article));
      }
    }
  }
};

// ==================== PRODUCTS ====================
export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('admin_products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToProduct);
  },

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const { data, error } = await supabase
      .from('admin_products')
      .insert(productToDb(product))
      .select()
      .single();
    
    if (error) throw error;
    return dbToProduct(data);
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('admin_products')
      .update({ ...productToDb(product), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbToProduct(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  subscribe(callback: (products: Product[]) => void) {
    return supabase
      .channel('admin_products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_products' }, async () => {
        const products = await this.getAll();
        callback(products);
      })
      .subscribe();
  },

  async seedData(): Promise<void> {
    const { data } = await supabase.from('admin_products').select('id').limit(1);
    if (!data || data.length === 0) {
      for (const product of dummyProducts) {
        await supabase.from('admin_products').insert(productToDb(product));
      }
    }
  }
};

// ==================== ORDERS ====================
export const ordersService = {
  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('admin_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToOrder);
  },

  async create(order: Omit<Order, 'id'>): Promise<Order> {
    const { data, error } = await supabase
      .from('admin_orders')
      .insert(orderToDb(order))
      .select()
      .single();
    
    if (error) throw error;
    return dbToOrder(data);
  },

  async update(id: string, order: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('admin_orders')
      .update({ ...orderToDb(order), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbToOrder(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  subscribe(callback: (orders: Order[]) => void) {
    return supabase
      .channel('admin_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_orders' }, async () => {
        const orders = await this.getAll();
        callback(orders);
      })
      .subscribe();
  },

  async seedData(): Promise<void> {
    const { data } = await supabase.from('admin_orders').select('id').limit(1);
    if (!data || data.length === 0) {
      for (const order of dummyOrders) {
        await supabase.from('admin_orders').insert(orderToDb(order));
      }
    }
  }
};

// ==================== PAYMENT METHODS ====================
export const paymentMethodsService = {
  async getAll(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('admin_payment_methods')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToPaymentMethod);
  },

  async create(pm: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('admin_payment_methods')
      .insert(paymentMethodToDb(pm))
      .select()
      .single();
    
    if (error) throw error;
    return dbToPaymentMethod(data);
  },

  async update(id: string, pm: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('admin_payment_methods')
      .update({ ...paymentMethodToDb(pm), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbToPaymentMethod(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_payment_methods')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  subscribe(callback: (pms: PaymentMethod[]) => void) {
    return supabase
      .channel('admin_payment_methods_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_payment_methods' }, async () => {
        const pms = await this.getAll();
        callback(pms);
      })
      .subscribe();
  },

  async seedData(): Promise<void> {
    const { data } = await supabase.from('admin_payment_methods').select('id').limit(1);
    if (!data || data.length === 0) {
      for (const pm of dummyPaymentMethods) {
        await supabase.from('admin_payment_methods').insert(paymentMethodToDb(pm));
      }
    }
  }
};

// ==================== SETTINGS ====================
export const settingsService = {
  async get(): Promise<SystemSettings> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      // Return default if not found
      return defaultSystemSettings;
    }
    return dbToSettings(data);
  },

  async update(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    // First check if settings exist
    const { data: existing } = await supabase
      .from('admin_settings')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ ...settingsToDb(settings), updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return dbToSettings(data);
    } else {
      const { data, error } = await supabase
        .from('admin_settings')
        .insert(settingsToDb(settings))
        .select()
        .single();
      
      if (error) throw error;
      return dbToSettings(data);
    }
  },

  subscribe(callback: (settings: SystemSettings) => void) {
    return supabase
      .channel('admin_settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_settings' }, async () => {
        const settings = await this.get();
        callback(settings);
      })
      .subscribe();
  }
};

// Initialize all seed data
export const initializeDatabase = async () => {
  try {
    await Promise.all([
      usersService.seedData(),
      expertsService.seedData(),
      articlesService.seedData(),
      productsService.seedData(),
      ordersService.seedData(),
      paymentMethodsService.seedData(),
    ]);
    console.log('Database initialized with seed data');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};
