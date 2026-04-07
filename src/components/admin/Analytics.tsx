import React, { useState } from 'react';
import { BarChart3, Globe, Smartphone } from 'lucide-react';
import PortalAnalytics from './PortalAnalytics';
import MobileAnalytics from './MobileAnalytics';

type AnalyticsTab = 'portal' | 'mobile';

const tabs: Array<{
  id: AnalyticsTab;
  label: string;
  icon: React.ElementType;
  description: string;
}> = [
  {
    id: 'portal',
    label: 'Portal Web',
    icon: Globe,
    description: 'Performa halaman publik, minat produk, dan klik CTA dari web portal.',
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: Smartphone,
    description: 'Minat fitur artikel, konsultasi ahli, dan belanja produk di aplikasi mobile.',
  },
];

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('portal');
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
              <BarChart3 className="h-3.5 w-3.5" />
              Analitik
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Satu menu analitik untuk portal web dan aplikasi mobile.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Pindah tab untuk melihat insight yang berbeda sesuai kanal pengguna.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  isActive
                    ? 'border-green-200 bg-green-50 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-green-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-2xl p-3 ${isActive ? 'bg-green-600' : 'bg-gray-100'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-bold ${isActive ? 'text-green-900' : 'text-gray-900'}`}>{tab.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{tab.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section key={activeTab}>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-500">
          <activeTabConfig.icon className="h-4 w-4" />
          <span>{activeTabConfig.label}</span>
        </div>
        {activeTab === 'portal' ? <PortalAnalytics /> : <MobileAnalytics />}
      </section>
    </div>
  );
};

export default Analytics;
