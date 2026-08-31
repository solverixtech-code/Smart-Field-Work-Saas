import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  Clock,
  Archive,
  ArrowRight,
  Sparkles,
  GitCompare,
  Eye,
  Info,
  Check,
  X,
  UserCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { Plan } from '../../types/plan.types';
import { Button } from '../../../../../../components/ui/Button';

export interface PlanVersionHistoryTabProps {
  plan: Plan;
}

export interface PlanVersionRecord {
  version: string;
  status: 'Active' | 'Replaced' | 'Superseded' | 'Archived';
  publishedOn: string;
  publishedBy: {
    name: string;
    avatar: string;
    role: string;
  };
  effectiveFrom: string;
  effectiveTo?: string;
  changesCount: number;
  changesSummary: string;
  changes: Array<{
    category: string;
    field: string;
    oldValue: string;
    newValue: string;
  }>;
}

export function PlanVersionHistoryTab({ plan }: PlanVersionHistoryTabProps) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<PlanVersionRecord | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Version records dataset matching screenshot
  const versionHistory: PlanVersionRecord[] = [
    {
      version: 'v1.0',
      status: 'Active',
      publishedOn: '28 May 2024, 04:20 PM',
      publishedBy: {
        name: 'Sahibjit Singh',
        avatar: 'S',
        role: 'Super Admin',
      },
      effectiveFrom: '28 May 2024',
      changesCount: 3,
      changesSummary: 'Updated pricing structure & increased storage limit from 150 GB to 200 GB.',
      changes: [
        { category: 'Pricing', field: 'Monthly Price', oldValue: '₹1,799', newValue: '₹1,999' },
        { category: 'Pricing', field: 'Annual Price', oldValue: '₹17,990', newValue: '₹19,990' },
        { category: 'Limits', field: 'Storage Included', oldValue: '150 GB', newValue: '200 GB' },
      ],
    },
    {
      version: 'v0.9',
      status: 'Replaced',
      publishedOn: '15 Mar 2024, 11:30 AM',
      publishedBy: {
        name: 'Sahibjit Singh',
        avatar: 'S',
        role: 'Super Admin',
      },
      effectiveFrom: '15 Mar 2024',
      effectiveTo: '28 May 2024',
      changesCount: 2,
      changesSummary: 'Added Collection Management module and increased custom forms quota.',
      changes: [
        { category: 'Modules', field: 'Included Modules', oldValue: '5 Modules', newValue: '6 Modules (+ Collection Mgmt)' },
        { category: 'Limits', field: 'Custom Forms', oldValue: '50 Forms', newValue: '100 Forms' },
      ],
    },
    {
      version: 'v0.8',
      status: 'Replaced',
      publishedOn: '10 Feb 2024, 02:15 PM',
      publishedBy: {
        name: 'Ananya Sharma',
        avatar: 'A',
        role: 'Product Manager',
      },
      effectiveFrom: '10 Feb 2024',
      effectiveTo: '15 Mar 2024',
      changesCount: 1,
      changesSummary: 'Adjusted minimum seat requirement from 15 to 20 seats.',
      changes: [
        { category: 'Limits', field: 'Minimum Seats', oldValue: '15 Seats', newValue: '20 Seats' },
      ],
    },
    {
      version: 'v0.7',
      status: 'Replaced',
      publishedOn: '20 Jan 2024, 09:45 AM',
      publishedBy: {
        name: 'Sahibjit Singh',
        avatar: 'S',
        role: 'Super Admin',
      },
      effectiveFrom: '20 Jan 2024',
      effectiveTo: '10 Feb 2024',
      changesCount: 2,
      changesSummary: 'Updated AI credits allowance and API monthly request quota.',
      changes: [
        { category: 'Limits', field: 'AI Credits / Month', oldValue: '2,500', newValue: '5,000' },
        { category: 'Limits', field: 'API Requests', oldValue: '50,000', newValue: '100,000' },
      ],
    },
    {
      version: 'v0.6',
      status: 'Archived',
      publishedOn: '10 Jan 2024, 10:00 AM',
      publishedBy: {
        name: 'Sahibjit Singh',
        avatar: 'S',
        role: 'Super Admin',
      },
      effectiveFrom: '10 Jan 2024',
      effectiveTo: '20 Jan 2024',
      changesCount: 4,
      changesSummary: 'Initial plan launch setup and commercial baseline configuration.',
      changes: [
        { category: 'General', field: 'Plan Created', oldValue: 'Draft', newValue: 'v0.6 Published' },
      ],
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Banner matching screenshot */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-sm border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Version History</h3>
            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
              5 Versions Logged
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Track all version revisions, commercial pricing updates, and limit changes made to this plan over time.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCompareModal(true)}
          className="gap-2 font-bold shadow-xs shrink-0 text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
        >
          <GitCompare className="h-4 w-4 text-indigo-600" /> Compare Versions
        </Button>
      </div>

      {/* Main Grid: Left Column (2 Cols Timeline) + Right Column (1 Col Widgets) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-[#0D1F3D]">Version Revision Timeline</h4>
              <span className="text-xs font-semibold text-slate-500">Ordered by most recent</span>
            </div>

            {/* Timeline List */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {versionHistory.map((ver, idx) => {
                const isActive = ver.status === 'Active';
                const isArchived = ver.status === 'Archived';

                return (
                  <div key={ver.version} className="relative group">
                    {/* Node Circle */}
                    <div
                      className={`absolute -left-[29px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white transition ${
                        isActive
                          ? 'border-emerald-600 text-emerald-600'
                          : isArchived
                          ? 'border-slate-300 text-slate-400'
                          : 'border-blue-600 text-blue-600'
                      }`}
                    >
                      {isActive ? (
                        <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-100 stroke-emerald-600" />
                      ) : isArchived ? (
                        <Archive className="h-3 w-3 text-slate-400" />
                      ) : (
                        <Clock className="h-3 w-3 text-blue-600" />
                      )}
                    </div>

                    {/* Version Card */}
                    <div className="rounded-sm border border-slate-200 bg-slate-50/50 p-4 hover:bg-white hover:border-slate-300 transition space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base font-extrabold text-[#0D1F3D]">{ver.version}</span>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-extrabold border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isArchived
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {ver.status}
                          </span>
                          {isActive && (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                              Current Subscription Version
                            </span>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSnapshot(ver)}
                          className="gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-200"
                        >
                          <Eye className="h-3.5 w-3.5 text-indigo-600" /> View Details
                        </Button>
                      </div>

                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {ver.changesSummary}
                      </p>

                      {/* Meta Information Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-[#0D1F3D] text-white text-[9px] font-bold flex items-center justify-center">
                            {ver.publishedBy.avatar}
                          </span>
                          <span>Published by <strong className="text-slate-800 font-bold">{ver.publishedBy.name}</strong> ({ver.publishedBy.role})</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                          <span>Published: <strong className="text-slate-800">{ver.publishedOn}</strong></span>
                          <span>Effective: <strong className="text-slate-800">{ver.effectiveFrom}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-sm bg-blue-50/60 border border-blue-100 flex items-center gap-2 text-xs text-blue-700 font-medium">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              <span>Only the active version (v1.0) is currently applied to new tenant signups.</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Card 1: Version Summary */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">Version Summary</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Logged Revisions</span>
                <span className="font-extrabold text-[#0D1F3D]">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Version</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  v1.0
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Replaced Versions</span>
                <span className="font-extrabold text-[#0D1F3D]">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Archived Versions</span>
                <span className="font-extrabold text-[#0D1F3D]">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">First Published</span>
                <span className="font-semibold text-slate-700">10 Jan 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Last Revised</span>
                <span className="font-semibold text-slate-700">28 May 2024</span>
              </div>
            </div>
          </div>

          {/* Card 2: About Versioning */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-[#0D1F3D]">About Versioning</h4>
            <div className="space-y-2.5 text-xs text-slate-600 font-medium">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Every change to pricing or limits automatically snapshots a new version.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Existing subscribers remain on their contracted version until manual migration.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Complete audit trails preserve historic commercial structures.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#0D1F3D]">Version Snapshot: {selectedSnapshot.version}</h3>
                <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                  {selectedSnapshot.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSnapshot(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-700 font-medium">{selectedSnapshot.changesSummary}</p>

              <div className="rounded-sm border border-slate-200 bg-slate-50 p-3 space-y-2">
                <h5 className="font-extrabold text-[#0D1F3D]">Modifications in this version:</h5>
                {selectedSnapshot.changes.map((ch, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-none">
                    <span className="font-bold text-slate-700">{ch.field}:</span>
                    <div className="flex items-center gap-2">
                      <span className="line-through text-slate-500 font-medium">{ch.oldValue}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span className="font-extrabold text-emerald-700">{ch.newValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSnapshot(null)}
                className="font-bold text-slate-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Compare Versions (v1.0 vs v0.9)</h3>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 p-2 bg-slate-100 rounded-sm font-extrabold text-[#0D1F3D]">
                <span>Parameter</span>
                <span>v0.9 (Previous)</span>
                <span>v1.0 (Current)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-700">Monthly Price</span>
                <span className="text-slate-600">₹1,799</span>
                <span className="font-extrabold text-emerald-700">₹1,999</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-700">Annual Price</span>
                <span className="text-slate-600">₹17,990</span>
                <span className="font-extrabold text-emerald-700">₹19,990</span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-700">Storage Included</span>
                <span className="text-slate-600">150 GB</span>
                <span className="font-extrabold text-emerald-700">200 GB</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompareModal(false)}
                className="font-bold text-slate-700"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
