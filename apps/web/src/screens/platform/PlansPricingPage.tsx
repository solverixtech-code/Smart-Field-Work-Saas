import React from 'react';
import { Layers, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '../../components/ui';
import { PLATFORM_PLANS, PLATFORM_MODULES } from '../../features/platform/tenants/fixtures/platform.fixtures';

export function PlansPricingPage() {
  return (
    <div className="space-y-5 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">Plans & Subscription Pricing Tiers</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Configure global subscription pricing, minimum user requirements, and feature inclusions.</p>
        </div>
        <Button variant="accent" size="sm" className="gap-2 font-bold shadow-xs">
          <Plus className="h-4 w-4" /> Create Pricing Tier
        </Button>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {PLATFORM_PLANS.map((plan) => (
          <div key={plan.id} className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-[#0D1F3D]">{plan.name}</h3>
                <span className="bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-sm text-xs border border-indigo-200">{plan.tier}</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-[#0D1F3D]">₹{plan.monthlyPricePerUser}</span>
                <span className="text-xs font-semibold text-slate-500"> / user / month</span>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">Annual billing: ₹{plan.annualPricePerUser} / user / mo</p>
              </div>
              <p className="text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-sm border border-slate-200">
                Min {plan.minUsers} user licenses requirement
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-extrabold text-[#0D1F3D] block">Included Features:</span>
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full font-bold">
              Edit Plan Parameters
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
