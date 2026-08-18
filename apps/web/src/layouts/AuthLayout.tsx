import React from 'react';
import { Users, Target, Settings, TrendingUp } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#F4F6F8] font-sans overflow-x-hidden">
      {/* LEFT SIDE: Deep Dark Navy Panel with Red Accent Slash & Skyline Graphic */}
      <div className="relative hidden lg:flex lg:w-[50%] xl:w-[52%] flex-col justify-between bg-[#030C1D] text-white p-10 xl:p-14 overflow-hidden">
        {/* Red Diagonal Accent Slice/Border */}
        <div 
          className="absolute top-0 right-0 bottom-0 w-16 bg-[#E20613] transform translate-x-8 skew-x-[-12deg] z-20 shadow-2xl pointer-events-none"
        />
        {/* Dark Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030C1D] via-[#071733] to-[#020814] z-0" />

        {/* TOP BRAND HEADER */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/assets/sfw-logo.png"
            alt="Smart Field Work Logo"
            className="h-11 w-auto object-contain brightness-0 invert"
          />
        </div>

        {/* MIDDLE SLOGAN & FEATURES SECTION */}
        <div className="relative z-10 my-auto max-w-xl space-y-6 py-8">
          <div className="space-y-2">
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              Empowering Field Teams.
            </h1>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-[#E20613] leading-tight">
              Driving Performance.
            </h1>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              Delivering Progress.
            </h1>
            <div className="h-1 w-16 rounded-full bg-[#E20613] mt-3" />
          </div>

          <p className="text-xs xl:text-sm font-normal text-slate-300 leading-relaxed max-w-md">
            Smart Field Work is an all-in-one platform designed to streamline operations, enhance productivity and achieve real results in the field.
          </p>

          {/* 4 FEATURE PILLS IN 2x2 GRID */}
          <div className="grid grid-cols-2 gap-3 pt-2 max-w-md">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">People</p>
                <p className="text-[10px] text-slate-400 font-medium">Empower Your Team</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-[#E20613]">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Performance</p>
                <p className="text-[10px] text-slate-400 font-medium">Drive Excellence</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Settings className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Automation</p>
                <p className="text-[10px] text-slate-400 font-medium">Smart Operations</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Progress</p>
                <p className="text-[10px] text-slate-400 font-medium">Achieve More</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SKYLINE GRAPHIC & TRENDLINE */}
        <div className="relative z-10 pt-4">
          <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gradient-to-t from-blue-900/40 to-transparent p-4 flex items-end">
            <div className="absolute inset-0 flex items-end justify-between px-6 opacity-30 pointer-events-none">
              <div className="w-8 h-20 bg-blue-500 rounded-t-sm" />
              <div className="w-10 h-28 bg-blue-400 rounded-t-sm" />
              <div className="w-7 h-16 bg-blue-600 rounded-t-sm" />
              <div className="w-12 h-24 bg-blue-500 rounded-t-sm" />
              <div className="w-9 h-32 bg-blue-400 rounded-t-sm" />
            </div>
            {/* Red Rising Trend Arrow */}
            <svg className="absolute inset-0 w-full h-full text-[#E20613]" viewBox="0 0 300 100" fill="none" preserveAspectRatio="none">
              <path d="M10 85 L80 65 L150 75 L220 35 L290 15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <polygon points="280,10 295,12 290,27" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Card Container */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 bg-[#F4F6F9]">
        <div className="w-full max-w-md space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
