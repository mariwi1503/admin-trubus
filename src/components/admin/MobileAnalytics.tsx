import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CalendarCheck2,
  MessageCircleMore,
  ShoppingBag,
  Smartphone,
  Users,
} from 'lucide-react';
import { fetchMobileAnalyticsSnapshot, MobileAnalyticsSnapshot } from '@/lib/mobileAnalyticsService';

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

const MobileAnalytics: React.FC = () => {
  const [periodDays, setPeriodDays] = useState(30);
  const [snapshot, setSnapshot] = useState<MobileAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSnapshot = async () => {
      setLoading(true);
      const nextSnapshot = await fetchMobileAnalyticsSnapshot(periodDays);
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
    return (
      <div className="space-y-6">
        <div className="h-44 animate-pulse rounded-3xl bg-gray-100" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  const visibleTrend = snapshot.trend.length > 10 ? snapshot.trend.slice(-10) : snapshot.trend;
  const maxActiveUsers = Math.max(...visibleTrend.map((point) => point.activeUsers), 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-600 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              <Smartphone className="h-3.5 w-3.5" />
              Mobile Analytics
            </div>
            <h2 className="mt-4 text-3xl font-bold">Analitik perilaku pengguna mobile untuk artikel, konsultasi ahli, dan belanja produk.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90">
              Fokus utamanya dibuat untuk marketing: fitur mana yang paling dipakai, topik/kategori mana yang paling menarik,
              dan seberapa jauh user bergerak dari eksplorasi sampai aksi bernilai seperti booking konsultasi atau tambah ke keranjang.
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
          label="Active Users"
          value={numberFormatter.format(snapshot.summary.activeUsers)}
          helper={`${snapshot.summary.avgSessionsPerUser} sesi per user`}
          icon={Users}
          tone="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <StatCard
          label="Artikel"
          value={`${snapshot.summary.articleVisitorRate}%`}
          helper={`${numberFormatter.format(snapshot.summary.articleVisitors)} user membuka fitur artikel`}
          icon={BookOpen}
          tone="bg-gradient-to-br from-lime-500 to-green-500"
        />
        <StatCard
          label="Konsultasi"
          value={`${snapshot.summary.consultationVisitorRate}%`}
          helper={`${numberFormatter.format(snapshot.summary.consultationVisitors)} user membuka daftar ahli`}
          icon={MessageCircleMore}
          tone="bg-gradient-to-br from-sky-500 to-cyan-600"
        />
        <StatCard
          label="Belanja Produk"
          value={`${snapshot.summary.shopVisitorRate}%`}
          helper={`${numberFormatter.format(snapshot.summary.shopVisitors)} user masuk katalog`}
          icon={ShoppingBag}
          tone="bg-gradient-to-br from-orange-500 to-amber-600"
        />
        <StatCard
          label="Aksi Bernilai"
          value={`${snapshot.summary.bookingRate}% / ${snapshot.summary.addToCartRate}%`}
          helper="Booking konsultasi / tambah ke keranjang"
          icon={CalendarCheck2}
          tone="bg-gradient-to-br from-violet-500 to-fuchsia-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-10">
        <div className="xl:col-span-7">
        <SectionCard
          title="Tren Pengguna Aktif"
          subtitle="Diagram batang besar untuk membaca active users dan aksi bernilai per hari."
        >
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="mb-4 flex flex-wrap gap-4 text-xs font-semibold text-gray-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                Active users
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-violet-500" />
                Aksi bernilai
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[760px] rounded-2xl bg-gray-50 p-4">
                <div className="flex h-80 items-end gap-4">
                  {visibleTrend.map((point) => (
                    <div key={point.date} className="flex h-full min-w-[56px] flex-1 flex-col justify-end">
                      <div className="mb-2 text-center text-[11px] font-semibold text-gray-500">
                        {point.activeUsers} / {point.conversions}
                      </div>
                      <div className="flex h-full items-end justify-center gap-2 rounded-t-xl border border-gray-100 bg-white px-2 pt-4">
                        <div
                          className="w-4 rounded-t-md bg-emerald-500 md:w-5"
                          style={{ height: `${Math.max((point.activeUsers / maxActiveUsers) * 100, 10)}%` }}
                          title={`${point.label}: ${point.activeUsers} active users`}
                        />
                        <div
                          className="w-4 rounded-t-md bg-violet-500 md:w-5"
                          style={{ height: `${Math.max((point.conversions / maxActiveUsers) * 100, 6)}%` }}
                          title={`${point.label}: ${point.conversions} aksi bernilai`}
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
        </div>

        <div className="xl:col-span-3">
        <SectionCard
          title="Distribusi Minat Fitur"
          subtitle="Fitur utama mobile yang paling banyak disentuh user."
        >
          <div className="space-y-5">
            {snapshot.featureShare.map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">{item.label}</span>
                  <span className="font-bold text-gray-900">{numberFormatter.format(item.value)} user</span>
                </div>
                <div className="h-4 rounded-full bg-white">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-gray-500">{item.share}% dari total active users</p>
                  <p className="text-xs font-semibold text-gray-400">
                    {numberFormatter.format(snapshot.summary.activeUsers - item.value)} user belum masuk fitur ini
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Funnel Per Fitur"
        subtitle="Bagian paling berguna untuk marketing karena menunjukkan perjalanan user sampai ke aksi bernilai."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {snapshot.featureFunnels.map((funnel) => (
            <div key={funnel.feature} className={`rounded-2xl border p-5 ${funnel.color.bg}`}>
              <div className="mb-4">
                <h4 className={`text-lg font-bold ${funnel.color.text}`}>{funnel.feature}</h4>
                <p className="mt-1 text-sm text-gray-600">{funnel.summary}</p>
              </div>
              <div className="space-y-4">
                {funnel.stages.map((stage) => (
                  <div key={stage.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-700">{stage.label}</span>
                      <span className="font-bold text-gray-900">
                        {numberFormatter.format(stage.visitors)} ({stage.rate}%)
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-white/80">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${funnel.color.bar}`}
                        style={{ width: `${Math.min(stage.rate, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Konten & Topik Artikel"
          subtitle="Membantu marketing menentukan tema konten yang paling layak diprioritaskan."
        >
          <div className="space-y-3">
            {snapshot.articleTopics.map((item, index) => (
              <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-100 text-sm font-bold text-lime-700">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.helper}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{numberFormatter.format(item.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Kebutuhan Konsultasi Paling Dicari"
          subtitle="Bagus untuk membaca pain point user dan calon tema promo layanan ahli."
        >
          <div className="space-y-3">
            {snapshot.consultationSpecialties.map((item, index) => (
              <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sm font-bold text-sky-700">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.helper}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{numberFormatter.format(item.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Kategori Belanja Terkuat"
          subtitle="Kategori produk yang paling menarik di mobile."
        >
          <div className="space-y-3">
            {snapshot.shoppingCategories.map((item, index) => (
              <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-sm font-bold text-orange-700">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.helper}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{numberFormatter.format(item.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Entry Point Dari Home Mobile"
          subtitle="Item home yang paling berpotensi dipakai untuk dorong campaign."
        >
          <div className="space-y-3">
            {snapshot.homeEntryPoints.map((item, index) => (
              <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-700">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.helper}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{numberFormatter.format(item.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Seluruh angka pada halaman ini adalah dummy data prototype yang disusun berdasarkan alur nyata di app mobile:
        home, artikel, konsultasi ahli, detail ahli, katalog, detail produk, dan aksi seperti booking serta tambah ke keranjang.
      </div>
    </div>
  );
};

export default MobileAnalytics;
