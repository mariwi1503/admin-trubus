import React, { useEffect, useState } from 'react';
import {
  Activity,
  Globe,
  MousePointerClick,
  PackageSearch,
  Smartphone,
  Users,
  Newspaper,
} from 'lucide-react';
import { fetchPortalAnalyticsSnapshot, PortalAnalyticsSnapshot } from '@/lib/portalAnalyticsService';

const numberFormatter = new Intl.NumberFormat('id-ID');

const periodOptions = [
  { value: 7, label: '7 hari' },
  { value: 30, label: '30 hari' },
  { value: 90, label: '90 hari' },
];

const StatCard = ({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  tone: string;
}) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        <p className="mt-2 text-sm text-gray-500">{helper}</p>
      </div>
      <div className={`rounded-2xl p-3 ${tone}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="mb-5">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
    {children}
  </section>
);

const LoadingState = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-36 animate-pulse rounded-2xl border border-gray-100 bg-white" />
      ))}
    </div>
    <div className="h-96 animate-pulse rounded-2xl border border-gray-100 bg-white" />
  </div>
);

const PortalAnalytics: React.FC = () => {
  const [periodDays, setPeriodDays] = useState(30);
  const [snapshot, setSnapshot] = useState<PortalAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSnapshot = async () => {
      setLoading(true);
      const nextSnapshot = await fetchPortalAnalyticsSnapshot(periodDays);
      if (active) {
        setSnapshot(nextSnapshot);
        setLoading(false);
      }
    };

    void loadSnapshot();

    return () => {
      active = false;
    };
  }, [periodDays]);

  if (loading || !snapshot) {
    return <LoadingState />;
  }

  const visibleTrend = snapshot.trend.length > 10 ? snapshot.trend.slice(-10) : snapshot.trend;
  const maxPageViewValue = Math.max(...visibleTrend.map((point) => point.pageViews), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-emerald-900 via-green-800 to-lime-700 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              <Activity className="h-3.5 w-3.5" />
              Portal Analytics
            </div>
            <h2 className="mt-4 text-3xl font-bold">Pergerakan pengunjung portal yang bisa langsung dipakai tim marketing.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50/90">
              Lihat halaman favorit, produk yang paling menarik perhatian, distribusi CTA Tokopedia, Shopee, dan Halo Trubus,
              sampai sumber traffic yang paling aktif selama periode terpilih.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={periodDays}
              onChange={(event) => setPeriodDays(Number(event.target.value))}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white outline-none backdrop-blur"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm">
              Update: {new Date(snapshot.generatedAt).toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Page Views"
          value={numberFormatter.format(snapshot.summary.pageViews)}
          helper={`${snapshot.summary.avgViewsPerVisitor} halaman per visitor`}
          icon={Globe}
          tone="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <StatCard
          label="Visitor Unik"
          value={numberFormatter.format(snapshot.summary.uniqueVisitors)}
          helper="Pengunjung berbeda dalam periode aktif"
          icon={Users}
          tone="bg-gradient-to-br from-sky-500 to-blue-600"
        />
        <StatCard
          label="Produk Dilihat"
          value={numberFormatter.format(snapshot.summary.productViews)}
          helper={`${snapshot.summary.productDetailVisitorRate}% visitor masuk ke detail produk`}
          icon={PackageSearch}
          tone="bg-gradient-to-br from-orange-500 to-amber-600"
        />
        <StatCard
          label="Klik CTA"
          value={numberFormatter.format(snapshot.summary.ctaClicks)}
          helper={`${snapshot.summary.ctaVisitorRate}% visitor lanjut klik CTA`}
          icon={MousePointerClick}
          tone="bg-gradient-to-br from-violet-500 to-fuchsia-600"
        />
        <StatCard
          label="Perangkat Dominan"
          value={snapshot.deviceBreakdown[0]?.label || 'Belum ada data'}
          helper={`${snapshot.deviceBreakdown[0]?.share || 0}% dari seluruh page view`}
          icon={Smartphone}
          tone="bg-gradient-to-br from-teal-500 to-cyan-600"
        />
      </div>

      <SectionCard
        title="Tren Kunjungan vs CTA"
        subtitle="Diagram batang besar untuk membaca perbandingan page view dan klik CTA per hari."
      >
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-4 flex flex-wrap gap-4 text-xs font-semibold text-gray-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-emerald-500" />
              Page view
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-amber-500" />
              Klik CTA
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px] rounded-2xl bg-gray-50 p-4">
              <div className="flex h-80 items-end gap-4">
                {visibleTrend.map((point) => (
                  <div key={point.date} className="flex h-full min-w-[56px] flex-1 flex-col justify-end">
                    <div className="mb-2 text-center text-[11px] font-semibold text-gray-500">
                      {point.pageViews} / {point.ctaClicks}
                    </div>
                    <div className="flex h-full items-end justify-center gap-2 rounded-t-xl border border-gray-100 bg-white px-2 pt-4">
                      <div
                        className="w-4 rounded-t-md bg-emerald-500 md:w-5"
                        style={{ height: `${Math.max((point.pageViews / maxPageViewValue) * 100, 10)}%` }}
                        title={`${point.label}: ${point.pageViews} page view`}
                      />
                      <div
                        className="w-4 rounded-t-md bg-amber-500 md:w-5"
                        style={{ height: `${Math.max((point.ctaClicks / maxPageViewValue) * 100, 6)}%` }}
                        title={`${point.label}: ${point.ctaClicks} klik CTA`}
                      />
                    </div>
                    <div className="mt-3 text-center text-[11px] font-semibold text-gray-400">{point.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Funnel Pengunjung"
          subtitle="Melihat berapa persen visitor yang lanjut dari kunjungan ke detail produk lalu ke CTA."
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Total Visitor</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {numberFormatter.format(snapshot.summary.uniqueVisitors)}
                  </p>
                </div>
                <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-bold text-white">100%</span>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-orange-700">Masuk Detail Produk</p>
                  <p className="mt-1 text-2xl font-bold text-orange-950">
                    {numberFormatter.format(snapshot.summary.productDetailVisitors)}
                  </p>
                </div>
                <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">
                  {snapshot.summary.productDetailVisitorRate}%
                </span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-white/80">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                  style={{ width: `${snapshot.summary.productDetailVisitorRate}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-violet-700">Sampai Klik CTA</p>
                  <p className="mt-1 text-2xl font-bold text-violet-950">
                    {numberFormatter.format(snapshot.summary.ctaVisitors)}
                  </p>
                </div>
                <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">
                  {snapshot.summary.ctaVisitorRate}%
                </span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-white/80">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                  style={{ width: `${snapshot.summary.ctaVisitorRate}%` }}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="CTA Favorit"
          subtitle="Membantu marketing memilih channel yang paling disukai pengunjung."
        >
          <div className="space-y-4">
            {snapshot.ctaPerformance.length > 0 ? (
              snapshot.ctaPerformance.map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700">{item.label}</span>
                    <span className="font-bold text-gray-900">
                      {numberFormatter.format(item.value)} klik
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-lime-400"
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{item.share}% dari total klik CTA</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Belum ada interaksi CTA yang tercatat pada periode ini.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Halaman Favorit"
          subtitle="Page yang paling sering dikunjungi dalam periode aktif."
        >
          <div className="space-y-3">
            {snapshot.topPages.length > 0 ? (
              snapshot.topPages.map((page, index) => (
                <div key={page.path} className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-sm font-bold text-green-700">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{page.label}</p>
                    <p className="truncate text-sm text-gray-500">{page.path}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{numberFormatter.format(page.value)}</p>
                    <p className="text-xs text-gray-500">{page.share}% traffic</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Belum ada page view yang tercatat pada periode ini.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Produk Paling Menarik"
          subtitle="Gabungan view detail, klik dari kartu produk, dan klik CTA."
        >
          <div className="space-y-3">
            {snapshot.topProducts.length > 0 ? (
              snapshot.topProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {numberFormatter.format(product.views)} detail view, {numberFormatter.format(product.cardClicks)} klik kartu
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-right">
                      <p className="text-sm font-semibold text-emerald-700">CTR CTA</p>
                      <p className="text-xl font-bold text-emerald-900">{product.ctr}%</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2.5 rounded-full bg-gray-100">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-400"
                      style={{ width: `${Math.min(product.ctr, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {numberFormatter.format(product.ctaClicks)} pengunjung melanjutkan ke marketplace atau Halo Trubus.
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Belum ada interaksi produk yang tercatat pada periode ini.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Artikel yang Paling Dibaca"
          subtitle="Konten yang punya potensi untuk diangkat lagi di campaign."
        >
          <div className="space-y-3">
            {snapshot.topArticles.length > 0 ? (
              snapshot.topArticles.map((article) => (
                <div key={article.id} className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4">
                  <div className="rounded-xl bg-lime-50 p-2 text-lime-700">
                    <Newspaper className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-semibold text-gray-900">{article.label}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {numberFormatter.format(article.value)} view, share {article.share}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Belum ada artikel yang tercatat pada periode ini.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Sumber Traffic"
          subtitle="Menunjukkan asal visitor terbaik untuk mendorong campaign berikutnya."
        >
          <div className="space-y-4">
            {snapshot.sourceBreakdown.length > 0 ? (
              snapshot.sourceBreakdown.map((source) => (
                <div key={source.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700">{source.label}</span>
                    <span className="font-bold text-gray-900">
                      {numberFormatter.format(source.value)} visitor
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                      style={{ width: `${source.share}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Belum ada sumber traffic yang tercatat pada periode ini.</p>
            )}
          </div>
        </SectionCard>
      </div>

      {snapshot.usingFallbackData && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Seluruh angka pada halaman ini adalah dummy data untuk kebutuhan prototype presentasi. Tidak ada koneksi ke database atau Supabase.
        </div>
      )}
    </div>
  );
};

export default PortalAnalytics;
