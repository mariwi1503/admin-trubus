type MetricItem = {
  label: string;
  value: number;
  share: number;
};

type ProductPerformanceItem = {
  id: string;
  name: string;
  views: number;
  cardClicks: number;
  ctaClicks: number;
  ctr: number;
};

type TrendPoint = {
  date: string;
  label: string;
  pageViews: number;
  ctaClicks: number;
};

export interface PortalAnalyticsSnapshot {
  generatedAt: string;
  periodDays: number;
  usingFallbackData: boolean;
  summary: {
    pageViews: number;
    uniqueVisitors: number;
    productViews: number;
    ctaClicks: number;
    productDetailVisitors: number;
    ctaVisitors: number;
    ctaCtr: number;
    productDetailVisitorRate: number;
    ctaVisitorRate: number;
    avgViewsPerVisitor: number;
  };
  trend: TrendPoint[];
  topPages: Array<MetricItem & { path: string }>;
  topArticles: Array<MetricItem & { id: string }>;
  topProducts: ProductPerformanceItem[];
  ctaPerformance: MetricItem[];
  sourceBreakdown: MetricItem[];
  deviceBreakdown: MetricItem[];
  insights: string[];
}

const CTA_LABELS: Record<string, string> = {
  tokopedia: 'Tokopedia',
  shopee: 'Shopee',
  'halo-trubus': 'Halo Trubus',
};

const numberFormatter = new Intl.NumberFormat('id-ID');

const toShare = (value: number, total: number) => {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(1));
};

const formatShortDate = (value: Date) =>
  value.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

const buildInsights = (snapshot: Omit<PortalAnalyticsSnapshot, 'generatedAt' | 'periodDays' | 'usingFallbackData'>) => {
  const insights: string[] = [];
  const favoritePage = snapshot.topPages[0];
  const favoriteProduct = snapshot.topProducts[0];
  const favoriteCta = snapshot.ctaPerformance[0];
  const favoriteSource = snapshot.sourceBreakdown[0];
  const favoriteDevice = snapshot.deviceBreakdown[0];

  if (favoritePage) {
    insights.push(
      `${favoritePage.label} menjadi halaman favorit dengan ${numberFormatter.format(favoritePage.value)} kunjungan, jadi cocok dijadikan anchor untuk promo utama.`
    );
  }

  if (favoriteProduct) {
    insights.push(
      `${favoriteProduct.name} paling sering dilihat (${numberFormatter.format(favoriteProduct.views)} view) dengan CTR CTA ${favoriteProduct.ctr}%, sehingga layak diprioritaskan di banner atau hero section.`
    );
  }

  if (favoriteCta) {
    insights.push(
      `CTA ${favoriteCta.label} paling dominan dengan porsi ${favoriteCta.share}%, jadi channel ini bisa dipakai sebagai jalur konversi utama untuk kampanye berikutnya.`
    );
  }

  if (favoriteSource && favoriteDevice) {
    insights.push(
      `${favoriteSource.label} menyumbang traffic terbesar, sementara ${favoriteDevice.label} mendominasi perangkat pengunjung. Materi kampanye sebaiknya dioptimalkan untuk kombinasi ini.`
    );
  }

  return insights;
};

const buildFallbackSnapshot = (periodDays: number): PortalAnalyticsSnapshot => {
  const today = new Date();
  const trend: TrendPoint[] = [];
  let pageViews = 0;
  let ctaClicks = 0;

  for (let index = periodDays - 1; index >= 0; index -= 1) {
    const pointDate = new Date(today);
    pointDate.setDate(today.getDate() - index);
    const value = 42 + ((index * 7) % 24) + (pointDate.getDay() === 0 ? -8 : 6);
    const clicks = Math.round(value * (0.18 + ((index % 4) * 0.03)));
    pageViews += value;
    ctaClicks += clicks;

    trend.push({
      date: pointDate.toISOString().slice(0, 10),
      label: formatShortDate(pointDate),
      pageViews: value,
      ctaClicks: clicks,
    });
  }

  const factor = periodDays / 30;
  const productViews = Math.round(pageViews * 0.46);
  const uniqueVisitors = Math.round(pageViews * 0.41);
  const productDetailVisitors = Math.round(uniqueVisitors * 0.58);
  const ctaVisitors = Math.round(uniqueVisitors * 0.31);

  const snapshot: PortalAnalyticsSnapshot = {
    generatedAt: new Date().toISOString(),
    periodDays,
    usingFallbackData: true,
    summary: {
      pageViews,
      uniqueVisitors,
      productViews,
      ctaClicks,
      productDetailVisitors,
      ctaVisitors,
      ctaCtr: Number(((ctaClicks / productViews) * 100).toFixed(1)),
      productDetailVisitorRate: Number(((productDetailVisitors / uniqueVisitors) * 100).toFixed(1)),
      ctaVisitorRate: Number(((ctaVisitors / uniqueVisitors) * 100).toFixed(1)),
      avgViewsPerVisitor: Number((pageViews / uniqueVisitors).toFixed(1)),
    },
    trend,
    topPages: [
      { label: 'Beranda', path: '/', value: Math.round(380 * factor), share: 22.1 },
      { label: 'Katalog Produk', path: '/produk', value: Math.round(312 * factor), share: 18.2 },
      { label: 'Daftar Artikel', path: '/artikel', value: Math.round(210 * factor), share: 12.2 },
      { label: 'Testimoni', path: '/testimoni', value: Math.round(124 * factor), share: 7.2 },
      { label: 'Tentang Kami', path: '/tentang-kami', value: Math.round(96 * factor), share: 5.6 },
    ],
    topArticles: [
      { id: 'art-1', label: 'Cara Membuat Pupuk Kompos dari Limbah Rumah Tangga', value: Math.round(118 * factor), share: 28.4 },
      { id: 'art-2', label: 'Budidaya Cabai Rawit yang Menguntungkan', value: Math.round(91 * factor), share: 21.9 },
      { id: 'art-3', label: 'Mengenal Pertanian Hidroponik Modern', value: Math.round(76 * factor), share: 18.3 },
    ],
    topProducts: [
      { id: 'prd-1', name: 'Kompos Premium Trubus', views: Math.round(144 * factor), cardClicks: Math.round(92 * factor), ctaClicks: Math.round(49 * factor), ctr: 34 },
      { id: 'prd-2', name: 'Biotr Plus', views: Math.round(121 * factor), cardClicks: Math.round(80 * factor), ctaClicks: Math.round(45 * factor), ctr: 37.2 },
      { id: 'prd-3', name: 'Monodon Trubus Green', views: Math.round(110 * factor), cardClicks: Math.round(73 * factor), ctaClicks: Math.round(31 * factor), ctr: 28.2 },
      { id: 'prd-4', name: 'Pupuk Cair Trubus', views: Math.round(98 * factor), cardClicks: Math.round(65 * factor), ctaClicks: Math.round(26 * factor), ctr: 26.5 },
    ],
    ctaPerformance: [
      { label: 'Tokopedia', value: Math.round(168 * factor), share: 44.8 },
      { label: 'Shopee', value: Math.round(124 * factor), share: 33.1 },
      { label: 'Halo Trubus', value: Math.round(83 * factor), share: 22.1 },
    ],
    sourceBreakdown: [
      { label: 'Direct', value: Math.round(206 * factor), share: 39.2 },
      { label: 'Search', value: Math.round(162 * factor), share: 30.8 },
      { label: 'Social', value: Math.round(103 * factor), share: 19.6 },
      { label: 'Referral', value: Math.round(55 * factor), share: 10.4 },
    ],
    deviceBreakdown: [
      { label: 'Mobile', value: Math.round(524 * factor), share: 67.4 },
      { label: 'Desktop', value: Math.round(214 * factor), share: 27.5 },
      { label: 'Tablet', value: Math.round(40 * factor), share: 5.1 },
    ],
    insights: [],
  };

  snapshot.insights = buildInsights(snapshot);

  return snapshot;
};

export const fetchPortalAnalyticsSnapshot = async (periodDays = 30): Promise<PortalAnalyticsSnapshot> =>
  buildFallbackSnapshot(periodDays);
