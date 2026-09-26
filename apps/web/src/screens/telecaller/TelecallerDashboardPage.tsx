import React, { useState, useEffect } from 'react';
import { TelecallerHeader } from './components/TelecallerHeader';
import { KpiSummaryBar } from './components/KpiSummaryBar';
import { SmartCallingPlanCard } from './components/SmartCallingPlanCard';
import { TargetMissionCard } from './components/TargetMissionCard';
import { PriorityCallQueueCard } from './components/PriorityCallQueueCard';
import { FollowUpCommitmentsCard } from './components/FollowUpCommitmentsCard';
import { PerformanceTrendCard } from './components/PerformanceTrendCard';
import { TelecallerQuickActions } from './components/TelecallerQuickActions';
import { DayChecklistCard } from './components/DayChecklistCard';
import { StartCallingModal } from './modals/StartCallingModal';
import { CallScriptModal } from './modals/CallScriptModal';
import { getTelecallerDashboard, TelecallerDashboardData, PriorityQueueItem } from './telecaller.api';
import { toast } from 'sonner';

export const TelecallerDashboardPage: React.FC = () => {
  const [data, setData] = useState<TelecallerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [dialerOpen, setDialerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<PriorityQueueItem | null>(null);
  const [scriptOpen, setScriptOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    getTelecallerDashboard().then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F3F5F7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-600">Loading Telecaller Dashboard...</p>
        </div>
      </div>
    );
  }

  const handleStartCall = (lead?: PriorityQueueItem) => {
    if (lead) setSelectedLead(lead);
    else setSelectedLead(data.priorityQueue[0]);
    setDialerOpen(true);
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
    toast.success(`Opening WhatsApp for ${phone}`);
  };

  const handleAddNote = (lead: PriorityQueueItem) => {
    toast.info(`Opening note drawer for ${lead.leadName}`);
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7] flex flex-col font-sans">
      {/* Top Header */}
      <TelecallerHeader
        telecallerName={data.telecallerName}
        role={data.role}
        status={data.status}
        dateStr={data.dateStr}
      />

      {/* Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 mx-auto w-full max-w-[1720px]">
        {/* Top 8 Metric KPI Cards Row */}
        <KpiSummaryBar kpis={data.kpis} />

        {/* Middle Main Section (4 Columns Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Column 1: Today's Smart Calling Plan */}
          <SmartCallingPlanCard
            dayPlan={data.dayPlan}
            bestConnectingTime={data.bestConnectingTime}
          />

          {/* Column 2: Target Mission & AI Coach */}
          <TargetMissionCard
            callsCompleted={data.kpis.callsCompleted}
            dailyCallTarget={data.kpis.dailyCallTarget}
            bestConnectingTime={data.bestConnectingTime}
            streakDays={data.targetStreakDays}
            aiCoachTips={data.aiCoachTips}
          />

          {/* Column 3: Priority Call Queue */}
          <PriorityCallQueueCard
            queue={data.priorityQueue}
            onStartCall={handleStartCall}
            onOpenWhatsApp={handleWhatsApp}
            onAddNote={handleAddNote}
          />

          {/* Column 4: Today's Follow-up Commitments */}
          <FollowUpCommitmentsCard commitments={data.followUps} />
        </div>

        {/* Bottom Section (3 Cards Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Performance Trend (Last 7 Days) - Spans 2 Columns */}
          <div className="lg:col-span-2">
            <PerformanceTrendCard
              data={data.performanceTrend}
              weeklyAvg={data.weeklyAvg}
            />
          </div>

          {/* Quick Actions Grid */}
          <TelecallerQuickActions
            onStartCalling={() => handleStartCall()}
            onOpenScript={() => setScriptOpen(true)}
            onScheduleDemo={() => toast.info('Opening Schedule Demo modal...')}
            onAddFollowUp={() => toast.info('Opening Add Follow-up modal...')}
            onDownloadReport={() => toast.success('Downloading Telecaller Activity Report (PDF)...')}
            onAddNote={() => toast.info('Opening Add Note drawer...')}
          />

          {/* Day Completion Checklist */}
          <DayChecklistCard initialChecklist={data.checklist} />
        </div>
      </main>

      {/* Interactive Modals */}
      <StartCallingModal
        isOpen={dialerOpen}
        onClose={() => setDialerOpen(false)}
        leadName={selectedLead?.leadName}
        company={selectedLead?.company}
        phone={selectedLead?.phone}
      />

      <CallScriptModal
        isOpen={scriptOpen}
        onClose={() => setScriptOpen(false)}
      />
    </div>
  );
};
