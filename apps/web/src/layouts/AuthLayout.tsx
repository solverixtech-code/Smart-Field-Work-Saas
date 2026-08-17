import React from 'react';
import { Target, MapPin, BarChart3, ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const features = [
  {
    icon: Target,
    title: 'Smart Field Operations',
    description: 'Track visits, manage leads, and drive stronger growth.',
  },
  {
    icon: MapPin,
    title: 'Live GPS Tracking',
    description: 'Real-time GPS coordinates and geofencing for field executives.',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Insights',
    description: 'Powerful dashboards to monitor performance and productivity.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    description: 'Enterprise grade security to protect your business data.',
  },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col justify-between font-sans bg-cover bg-center bg-no-repeat overflow-x-hidden"
      style={{
        backgroundImage: `url('/assets/full-bg.png')`,
      }}
    >
      {/* Top Main Section */}
      <div className="relative flex flex-1 min-h-0">
        {/* Left Brand Panel */}
        <div className="relative hidden w-1/2 flex-col justify-between p-10 lg:flex xl:p-14">
          {/* Top SFW Logo */}
          <div className="relative z-10">
            <img
              src="/assets/sfw-logo.png"
              alt="Smart Field Work Logo"
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </div>

          {/* Middle Content Section */}
          <div className="relative z-10 my-auto max-w-xl space-y-6 py-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl drop-shadow-md">
                Welcome to
              </h1>
              <h1 className="text-4xl font-extrabold text-[#E20613] sm:text-5xl drop-shadow-md">
                Smart Field Work
              </h1>
              <div className="h-1.5 w-20 rounded-full bg-[#E20613] mt-3 shadow-xs" />
            </div>

            <p className="text-sm font-medium leading-relaxed text-slate-100 sm:text-base drop-shadow-xs">
              Smarter Workforce. Stronger Results. Streamline your field operations, visits, and sales performance.
            </p>
          </div>

          {/* Footer info */}
          <div className="relative z-10 text-xs font-medium text-slate-300 drop-shadow-xs">
            © {new Date().getFullYear()} Smart Field Work (SFW). All rights reserved.
          </div>
        </div>

        {/* Right Content Panel - Auth Form Cards */}
        <div className="relative flex flex-1 items-center justify-center p-6 sm:p-10 lg:p-12">
          {children}
        </div>
      </div>

      {/* Bottom Feature Strip Section */}
      <div className="relative z-20 w-full bg-transparent px-4 pb-6 pt-2 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-xl backdrop-blur-md sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-slate-100">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`flex items-start gap-4 ${
                    idx !== 0 ? 'lg:pl-6' : ''
                  } ${idx !== features.length - 1 ? 'lg:pr-6' : ''}`}
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-[#E20613]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-[#0D1F3D]">
                      {feature.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
