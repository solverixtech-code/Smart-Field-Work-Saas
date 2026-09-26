import React from 'react';
import { Target, PhoneCall, PhoneIncoming, Clock, Calendar, CheckCircle2, Activity, Percent } from 'lucide-react';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import { TelecallerKpis } from '../telecaller.api';

interface KpiSummaryBarProps {
  kpis: TelecallerKpis;
}

export const KpiSummaryBar: React.FC<KpiSummaryBarProps> = ({ kpis }) => {
  const formatSeconds = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const completedPct = Math.round((kpis.callsCompleted / kpis.dailyCallTarget) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
      {/* 1. Daily Call Target */}
      <KpiCard
        title="Daily Call Target"
        value={kpis.dailyCallTarget}
        subValue={`${completedPct}% Completed`}
        icon={Target}
        iconBgColor="bg-red-50"
        iconTextColor="text-[#E20613]"
      />

      {/* 2. Calls Completed */}
      <KpiCard
        title="Calls Completed"
        value={`${kpis.callsCompleted} / ${kpis.dailyCallTarget}`}
        change={`${kpis.callsVsYesterdayPct}%`}
        changeType="positive"
        timeframe="vs yesterday"
        icon={PhoneCall}
        iconBgColor="bg-emerald-50"
        iconTextColor="text-emerald-700"
      />

      {/* 3. Connected Calls */}
      <KpiCard
        title="Connected Calls"
        value={kpis.connectedCalls}
        change={`${kpis.connectedVsYesterdayPct}%`}
        changeType="positive"
        timeframe="vs yesterday"
        icon={PhoneIncoming}
        iconBgColor="bg-blue-50"
        iconTextColor="text-blue-700"
      />

      {/* 4. Follow-ups Due */}
      <KpiCard
        title="Follow-ups Due"
        value={kpis.followUpsDue}
        subValue={`${kpis.followUpsOverdue} Overdue`}
        icon={Clock}
        iconBgColor="bg-amber-50"
        iconTextColor="text-amber-700"
      />

      {/* 5. Demos Booked */}
      <KpiCard
        title="Demos Booked"
        value={kpis.demosBooked}
        change={`${kpis.demosVsYesterdayPct}%`}
        changeType="positive"
        timeframe="vs yesterday"
        icon={Calendar}
        iconBgColor="bg-purple-50"
        iconTextColor="text-purple-700"
      />

      {/* 6. Conversions */}
      <KpiCard
        title="Conversions"
        value={kpis.conversions}
        change={`${kpis.conversionsVsYesterdayPct}%`}
        changeType="positive"
        timeframe="vs yesterday"
        icon={CheckCircle2}
        iconBgColor="bg-teal-50"
        iconTextColor="text-teal-700"
      />

      {/* 7. Talk Time */}
      <KpiCard
        title="Talk Time"
        value={formatSeconds(kpis.talkTimeSeconds)}
        change={`${kpis.talkTimeVsYesterdayPct}%`}
        changeType="positive"
        timeframe="vs yesterday"
        icon={Activity}
        iconBgColor="bg-rose-50"
        iconTextColor="text-rose-700"
      />

      {/* 8. Conversion Rate */}
      <KpiCard
        title="Conversion Rate"
        value={`${kpis.conversionRatePct}%`}
        change={`${kpis.conversionRateVsYesterdayPp} pp`}
        changeType="positive"
        timeframe="vs yesterday"
        icon={Percent}
        iconBgColor="bg-indigo-50"
        iconTextColor="text-indigo-700"
      />
    </div>
  );
};
