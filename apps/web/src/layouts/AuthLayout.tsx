import React from 'react';
import { Users, Target, Settings, TrendingUp } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="relative flex min-h-screen w-full font-sans overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/assets/auth-bg.png')`,
      }}
    >
      {/* LEFT SIDE: Content rendered over the left dark area of background image */}
      <div className="relative hidden lg:flex lg:w-[50%] xl:w-[52%] flex-col justify-between text-white p-10 xl:p-14 z-10">
        {/* TOP BRAND HEADER */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/sfw-logo.png"
            alt="Smart Field Work Logo"
            className="h-16 xl:h-20 w-auto object-contain brightness-0 invert"
          />
        </div>

        {/* MIDDLE SLOGAN & FEATURES SECTION */}
        <div className="my-auto max-w-xl space-y-6 py-8">
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
            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/30 text-blue-300">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">People</p>
                <p className="text-[10px] text-slate-300 font-medium">Empower Your Team</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/30 text-red-300">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Performance</p>
                <p className="text-[10px] text-slate-300 font-medium">Drive Excellence</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/30 text-emerald-300">
                <Settings className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Automation</p>
                <p className="text-[10px] text-slate-300 font-medium">Smart Operations</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/30 text-purple-300">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Progress</p>
                <p className="text-[10px] text-slate-300 font-medium">Achieve More</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SPACING */}
        <div className="h-10" />
      </div>

      {/* RIGHT SIDE: Auth Card Container (Over the white side of background image) */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 z-10">
        <div className="w-full max-w-md space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
