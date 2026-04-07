type MetricItem = {
  label: string;
  value: number;
  share: number;
};

type FunnelStage = {
  label: string;
  visitors: number;
  rate: number;
};

type FeatureFunnel = {
  feature: string;
  summary: string;
  color: {
    bg: string;
    bar: string;
    text: string;
  };
  stages: FunnelStage[];
};

type FeatureSpotlightItem = {
  label: string;
  value: number;
  helper: string;
};

type TrendPoint = {
  date: string;
  label: string;
  activeUsers: number;
  conversions: number;
};

export interface MobileAnalyticsSnapshot {
  generatedAt: string;
  periodDays: number;
  usingFallbackData: boolean;
  summary: {
    activeUsers: number;
    sessions: number;
    avgSessionsPerUser: number;
    articleVisitors: number;
    consultationVisitors: number;
    shopVisitors: number;
    articleVisitorRate: number;
    consultationVisitorRate: number;
    shopVisitorRate: number;
    consultationBookings: number;
    bookingRate: number;
    addToCartUsers: number;
    addToCartRate: number;
  };
  featureShare: MetricItem[];
  trend: TrendPoint[];
  featureFunnels: FeatureFunnel[];
  articleTopics: FeatureSpotlightItem[];
  consultationSpecialties: FeatureSpotlightItem[];
  shoppingCategories: FeatureSpotlightItem[];
  homeEntryPoints: FeatureSpotlightItem[];
}

const formatShortDate = (value: Date) =>
  value.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

export const fetchMobileAnalyticsSnapshot = async (periodDays = 30): Promise<MobileAnalyticsSnapshot> => {
  const factor = periodDays / 30;
  const activeUsers = Math.round(2480 * factor);
  const sessions = Math.round(activeUsers * 2.4);
  const articleVisitors = Math.round(activeUsers * 0.64);
  const consultationVisitors = Math.round(activeUsers * 0.39);
  const shopVisitors = Math.round(activeUsers * 0.57);
  const consultationBookings = Math.round(activeUsers * 0.14);
  const addToCartUsers = Math.round(activeUsers * 0.26);

  const today = new Date();
  const trend: TrendPoint[] = [];

  for (let index = periodDays - 1; index >= 0; index -= 1) {
    const pointDate = new Date(today);
    pointDate.setDate(today.getDate() - index);
    const active = 58 + ((index * 9) % 26) + (pointDate.getDay() === 0 ? -7 : 8);
    const conversions = Math.round(active * (0.24 + ((index % 3) * 0.04)));

    trend.push({
      date: pointDate.toISOString().slice(0, 10),
      label: formatShortDate(pointDate),
      activeUsers: active,
      conversions,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    periodDays,
    usingFallbackData: true,
    summary: {
      activeUsers,
      sessions,
      avgSessionsPerUser: Number((sessions / activeUsers).toFixed(1)),
      articleVisitors,
      consultationVisitors,
      shopVisitors,
      articleVisitorRate: Number(((articleVisitors / activeUsers) * 100).toFixed(1)),
      consultationVisitorRate: Number(((consultationVisitors / activeUsers) * 100).toFixed(1)),
      shopVisitorRate: Number(((shopVisitors / activeUsers) * 100).toFixed(1)),
      consultationBookings,
      bookingRate: Number(((consultationBookings / activeUsers) * 100).toFixed(1)),
      addToCartUsers,
      addToCartRate: Number(((addToCartUsers / activeUsers) * 100).toFixed(1)),
    },
    featureShare: [
      { label: 'Artikel', value: articleVisitors, share: Number(((articleVisitors / activeUsers) * 100).toFixed(1)) },
      { label: 'Belanja Produk', value: shopVisitors, share: Number(((shopVisitors / activeUsers) * 100).toFixed(1)) },
      { label: 'Konsultasi Ahli', value: consultationVisitors, share: Number(((consultationVisitors / activeUsers) * 100).toFixed(1)) },
    ],
    trend,
    featureFunnels: [
      {
        feature: 'Artikel',
        summary: 'Cocok untuk melihat tema edukasi yang paling menarik dan mendorong repeat visit.',
        color: {
          bg: 'bg-lime-50 border-lime-100',
          bar: 'from-lime-500 to-green-400',
          text: 'text-lime-900',
        },
        stages: [
          { label: 'Buka tab artikel', visitors: articleVisitors, rate: Number(((articleVisitors / activeUsers) * 100).toFixed(1)) },
          { label: 'Masuk detail artikel', visitors: Math.round(articleVisitors * 0.71), rate: 71 },
          { label: 'Baca artikel terkait', visitors: Math.round(articleVisitors * 0.36), rate: 36 },
        ],
      },
      {
        feature: 'Konsultasi Ahli',
        summary: 'Penting untuk mengukur seberapa banyak user yang benar-benar tertarik booking, bukan hanya melihat daftar ahli.',
        color: {
          bg: 'bg-sky-50 border-sky-100',
          bar: 'from-sky-500 to-cyan-400',
          text: 'text-sky-900',
        },
        stages: [
          { label: 'Buka tab konsultasi', visitors: consultationVisitors, rate: Number(((consultationVisitors / activeUsers) * 100).toFixed(1)) },
          { label: 'Lihat profil ahli', visitors: Math.round(consultationVisitors * 0.63), rate: 63 },
          { label: 'Buat jadwal konsultasi', visitors: consultationBookings, rate: Number(((consultationBookings / consultationVisitors) * 100).toFixed(1)) },
        ],
      },
      {
        feature: 'Belanja Produk',
        summary: 'Paling berguna untuk membaca minat kategori produk dan kesiapan user bertransaksi.',
        color: {
          bg: 'bg-orange-50 border-orange-100',
          bar: 'from-orange-500 to-amber-400',
          text: 'text-orange-900',
        },
        stages: [
          { label: 'Masuk katalog produk', visitors: shopVisitors, rate: Number(((shopVisitors / activeUsers) * 100).toFixed(1)) },
          { label: 'Lihat detail produk', visitors: Math.round(shopVisitors * 0.67), rate: 67 },
          { label: 'Tambah ke keranjang', visitors: addToCartUsers, rate: Number(((addToCartUsers / shopVisitors) * 100).toFixed(1)) },
        ],
      },
    ],
    articleTopics: [
      { label: 'Pupuk & Tanah', value: Math.round(620 * factor), helper: 'Topik paling sering dibuka dari tab artikel' },
      { label: 'Hortikultura', value: Math.round(510 * factor), helper: 'Paling kuat untuk kebutuhan seasonal campaign' },
      { label: 'Teknologi Pertanian', value: Math.round(402 * factor), helper: 'Tinggi untuk user yang mencari solusi modern' },
    ],
    consultationSpecialties: [
      { label: 'Hama & Penyakit', value: Math.round(214 * factor), helper: 'Spesialisasi paling sering dibuka dan dibooking' },
      { label: 'Tanah & Pupuk', value: Math.round(182 * factor), helper: 'Relevan untuk cross-sell produk nutrisi tanaman' },
      { label: 'Hortikultura', value: Math.round(151 * factor), helper: 'Bagus untuk konten dan promo musiman' },
    ],
    shoppingCategories: [
      { label: 'Pupuk', value: Math.round(490 * factor), helper: 'Kategori belanja paling ramai di katalog' },
      { label: 'Media Tanam', value: Math.round(356 * factor), helper: 'Sering dibuka setelah user membaca artikel edukasi' },
      { label: 'Pestisida', value: Math.round(274 * factor), helper: 'Potensial untuk bundling dengan konsultasi ahli' },
    ],
    homeEntryPoints: [
      { label: 'Quick Menu Artikel', value: Math.round(312 * factor), helper: 'Pintu masuk edukasi paling dominan dari home' },
      { label: 'Quick Menu Konsultasi', value: Math.round(267 * factor), helper: 'Sering dipakai user dengan intent tinggi' },
      { label: 'Banner Promo Produk', value: Math.round(244 * factor), helper: 'Efektif untuk dorong user masuk katalog' },
    ],
  };
};
