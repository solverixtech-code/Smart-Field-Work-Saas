import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Share2,
  Facebook,
  Search,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  HeartPulse,
  Settings,
  ExternalLink,
  Layers,
  FileText,
  Plug,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';

export default function LeadIntegrationsDashboard() {
  const navigate = useNavigate();

  // Connection State Controls (Allows user to test connected vs disconnected state)
  const [connectionStatus, setConnectionStatus] = useState<{
    meta: boolean;
    google: boolean;
    whatsapp: boolean;
  }>({
    meta: true,
    google: true,
    whatsapp: true,
  });

  const totalConnected = Object.values(connectionStatus).filter(Boolean).length;

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/leads/sources')}>
            Lead Sources
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Integrations</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Lead Integrations</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Connect your lead generation platforms and automatically capture leads into SFW CRM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection Preview State Toggles */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-sm border border-slate-200 shadow-xs text-xs font-bold">
              <button
                onClick={() => setConnectionStatus({ meta: true, google: true, whatsapp: true })}
                className={`px-2.5 py-1 rounded-xs cursor-pointer transition-colors ${
                  totalConnected === 3 ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Connected (3)
              </button>
              <button
                onClick={() => setConnectionStatus({ meta: true, google: false, whatsapp: false })}
                className={`px-2.5 py-1 rounded-xs cursor-pointer transition-colors ${
                  totalConnected === 1 ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Partial (1)
              </button>
              <button
                onClick={() => setConnectionStatus({ meta: false, google: false, whatsapp: false })}
                className={`px-2.5 py-1 rounded-xs cursor-pointer transition-colors ${
                  totalConnected === 0 ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Zero Connected (0)
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info(`Integration Health Status: ${totalConnected} of 3 Platforms Operational`)}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <HeartPulse className="h-4 w-4 text-purple-600" /> Integration Health
            </Button>
          </div>
        </div>
      </div>

      {/* TOP 6 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Integrations</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">3</span>
            <span className="text-xs font-medium text-slate-400 block">All connected platforms</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Integrations</span>
            <span className="text-xl font-extrabold text-emerald-600">{totalConnected}</span>
            <span className="text-xs font-semibold text-emerald-600 block">
              {totalConnected === 3 ? '100% of total' : `${Math.round((totalConnected / 3) * 100)}% of total`}
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Leads Captured</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">
              {totalConnected === 0 ? '0' : totalConnected === 1 ? '5,842' : '12,458'}
            </span>
            <span className="text-xs font-semibold text-emerald-600 block">
              {totalConnected === 0 ? 'No active leads' : '↑ 18.4% vs last 30 days'}
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Leads Assigned</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">
              {totalConnected === 0 ? '0' : totalConnected === 1 ? '4,412' : '11,236'}
            </span>
            <span className="text-xs font-semibold text-emerald-600 block">
              {totalConnected === 0 ? 'No assignment' : '↑ 16.7% vs last 30 days'}
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">
              {totalConnected === 0 ? '0.0%' : '21.3%'}
            </span>
            <span className="text-xs font-semibold text-emerald-600 block">
              {totalConnected === 0 ? '—' : '↑ 2.9% vs last 30 days'}
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-teal-50 text-teal-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Revenue Generated</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">
              {totalConnected === 0 ? '₹ 0' : '₹ 42,68,000'}
            </span>
            <span className="text-xs font-semibold text-emerald-600 block">
              {totalConnected === 0 ? '—' : '↑ 19.7% vs last 30 days'}
            </span>
          </div>
        </div>
      </div>

      {/* ZERO CONNECTED FALLBACK BANNER */}
      {totalConnected === 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-amber-900">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
            <div>
              <span className="font-extrabold text-amber-950 block text-sm">No Lead Platforms Connected</span>
              <span className="text-amber-800 font-medium">
                Connect Meta Ads, Google Ads, or WhatsApp Business account below to automatically ingest leads into SFW CRM.
              </span>
            </div>
          </div>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/leads/integrations/meta/connect')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Connect First Platform
          </Button>
        </div>
      )}

      {/* PLATFORM CARDS LIST (EXACT REFERENCE 4-COLUMN GRID MATCH) */}
      <div className="space-y-4">
        {/* PLATFORM 1: META LEAD ADS */}
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Col 1: Platform Header & Credentials (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                  <Facebook className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#0D1F3D]">Meta Lead Ads</h3>
                    {connectionStatus.meta ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Connected
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Facebook & Instagram Lead Ads
                  </p>
                </div>
              </div>

              {connectionStatus.meta ? (
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400 text-[11px]">Connected Account</span>
                    <span className="font-extrabold text-[#0D1F3D]">Aimbeat Business</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400 text-[11px]">FB Page</span>
                    <span className="font-extrabold text-indigo-600 flex items-center gap-1 cursor-pointer hover:underline">
                      Aimbeat <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 pt-0.5">
                    <span className="text-slate-400 text-[11px]">Last Sync</span>
                    <div className="text-right">
                      <span className="font-bold text-[#0D1F3D] block text-[11px]">1 min ago</span>
                      <span className="text-[10px] text-emerald-600 font-extrabold">Auto sync: Real-time</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-sm border border-dashed border-slate-200 text-[11px] text-slate-500 font-medium">
                  No Meta Business account connected. Connect account to enable instant lead sync.
                </div>
              )}
            </div>

            {/* Col 2: Metrics Inner Box (3 Cols) */}
            <div className="lg:col-span-3">
              {connectionStatus.meta ? (
                <div className="bg-slate-50/70 p-4 rounded-md border border-slate-200/90 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Leads (Last 30 Days)</span>
                    <span className="text-emerald-600 font-extrabold text-xs">↑ 18.6%</span>
                  </div>
                  <span className="text-3xl font-black text-[#0D1F3D] my-1">5,842</span>
                  <div className="grid grid-cols-4 gap-1 text-[10px] pt-2 border-t border-slate-200/80 text-center">
                    <div>
                      <span className="text-slate-400 block font-medium">New Leads</span>
                      <span className="font-extrabold text-[#0D1F3D]">4,856</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Assigned</span>
                      <span className="font-extrabold text-[#0D1F3D]">4,412</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Converted</span>
                      <span className="font-extrabold text-[#0D1F3D]">1,156</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Conversion Rate</span>
                      <span className="font-extrabold text-emerald-600">19.9%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/70 p-4 rounded-md border border-slate-200/90 h-full flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-slate-400 block">Leads (Last 30 Days)</span>
                  <span className="text-2xl font-bold text-slate-300 my-1">—</span>
                  <span className="text-[10px] text-slate-400">Connect platform to view metrics</span>
                </div>
              )}
            </div>

            {/* Col 3: Top Campaign & Form Info (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col justify-center space-y-2 text-xs bg-slate-50/50 p-4 rounded-md border border-slate-200/60">
              {connectionStatus.meta ? (
                <>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase tracking-wider">Top Campaign</span>
                    <span className="font-extrabold text-[#0D1F3D] block text-xs">Summer Offer 2025</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase tracking-wider">Top Ad Set</span>
                    <span className="font-bold text-slate-700 block text-xs">Offer - Mumbai - 18+</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase tracking-wider">Lead Form</span>
                    <span className="font-bold text-indigo-700 block text-xs">Lead Form 01</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-400 font-medium text-xs">
                  No campaign data available until connected.
                </div>
              )}
            </div>

            {/* Col 4: Webhook Active & Action Menu (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col justify-between bg-slate-50/50 p-4 rounded-md border border-slate-200/60 relative">
              <div className="flex items-start justify-between">
                <div>
                  {connectionStatus.meta ? (
                    <>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> Webhook Active
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Receiving leads in real-time via Meta Webhooks API
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 text-slate-400 font-extrabold text-xs">
                        <Plug className="h-4 w-4 shrink-0" /> Webhook Inactive
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        No webhook registered
                      </p>
                    </>
                  )}
                </div>

                {/* 3-Dots RowActionsMenu Popover */}
                <RowActionsMenu
                  items={[
                    {
                      label: connectionStatus.meta ? 'Re-sync Account' : 'Connect Account',
                      icon: RotateCcw,
                      onClick: () => navigate('/admin/leads/integrations/meta/connect'),
                    },
                    {
                      label: 'View Webhook Logs',
                      icon: FileText,
                      onClick: () => navigate('/admin/leads/automation/activity'),
                    },
                    {
                      label: connectionStatus.meta ? 'Disconnect Account' : 'Remove Integration',
                      icon: Trash2,
                      danger: true,
                      divider: true,
                      onClick: () => {
                        setConnectionStatus({ ...connectionStatus, meta: !connectionStatus.meta });
                        toast.info(connectionStatus.meta ? 'Meta account disconnected' : 'Meta account connected');
                      },
                    },
                  ]}
                />
              </div>

              {connectionStatus.meta ? (
                <div className="space-y-3 pt-3 border-t border-slate-200/80">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Health Status</span>
                      <span className="font-extrabold text-emerald-700">Healthy</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Error Rate</span>
                      <span className="font-extrabold text-slate-800">0%</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => navigate('/admin/leads/integrations/meta/connect')}
                    className="bg-white text-indigo-700 border-indigo-200 font-extrabold hover:bg-indigo-50 shadow-xs flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Settings className="h-3.5 w-3.5" /> Manage Integration
                  </Button>
                </div>
              ) : (
                <Button
                  variant="accent"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/admin/leads/integrations/meta/connect')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-xs flex items-center justify-center gap-1.5 text-xs mt-4"
                >
                  <Plus className="h-4 w-4" /> Connect Meta Lead Ads
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* PLATFORM 2: GOOGLE ADS */}
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Col 1: Platform Header & Credentials (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
                  <Search className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#0D1F3D]">Google Ads</h3>
                    {connectionStatus.google ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Connected
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Google Ads Lead Forms
                  </p>
                </div>
              </div>

              {connectionStatus.google ? (
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400 text-[11px]">Connected Account</span>
                    <span className="font-extrabold text-[#0D1F3D] truncate max-w-[130px]" title="aimbeatads@gmail.com">
                      aimbeatads@gmail.com
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400 text-[11px]">Customer ID</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">123-456-7890</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 pt-0.5">
                    <span className="text-slate-400 text-[11px]">Last Sync</span>
                    <div className="text-right">
                      <span className="font-bold text-[#0D1F3D] block text-[11px]">2 min ago</span>
                      <span className="text-[10px] text-emerald-600 font-extrabold">Auto sync: Every 5 min</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-sm border border-dashed border-slate-200 text-[11px] text-slate-500 font-medium">
                  No Google Ads account connected. Connect account to enable lead form sync.
                </div>
              )}
            </div>

            {/* Col 2: Metrics Inner Box (3 Cols) */}
            <div className="lg:col-span-3">
              {connectionStatus.google ? (
                <div className="bg-slate-50/70 p-4 rounded-md border border-slate-200/90 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Leads (Last 30 Days)</span>
                    <span className="text-emerald-600 font-extrabold text-xs">↑ 16.2%</span>
                  </div>
                  <span className="text-3xl font-black text-[#0D1F3D] my-1">4,126</span>
                  <div className="grid grid-cols-4 gap-1 text-[10px] pt-2 border-t border-slate-200/80 text-center">
                    <div>
                      <span className="text-slate-400 block font-medium">New Leads</span>
                      <span className="font-extrabold text-[#0D1F3D]">3,354</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Assigned</span>
                      <span className="font-extrabold text-[#0D1F3D]">3,078</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Converted</span>
                      <span className="font-extrabold text-[#0D1F3D]">786</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Conversion Rate</span>
                      <span className="font-extrabold text-emerald-600">19.1%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/70 p-4 rounded-md border border-slate-200/90 h-full flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-slate-400 block">Leads (Last 30 Days)</span>
                  <span className="text-2xl font-bold text-slate-300 my-1">—</span>
                  <span className="text-[10px] text-slate-400">Connect platform to view metrics</span>
                </div>
              )}
            </div>

            {/* Col 3: Top Campaign & Form Info (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col justify-center space-y-2 text-xs bg-slate-50/50 p-4 rounded-md border border-slate-200/60">
              {connectionStatus.google ? (
                <>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase tracking-wider">Top Campaign</span>
                    <span className="font-extrabold text-[#0D1F3D] block text-xs">Search - CRM Solution</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase tracking-wider">Top Ad Group</span>
                    <span className="font-bold text-slate-700 block text-xs">CRM Solution - Mumbai</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase tracking-wider">Lead Form</span>
                    <span className="font-bold text-indigo-700 block text-xs">Website Leads Form</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-400 font-medium text-xs">
                  No campaign data available until connected.
                </div>
              )}
            </div>

            {/* Col 4: Webhook Active & Action Menu (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col justify-between bg-slate-50/50 p-4 rounded-md border border-slate-200/60 relative">
              <div className="flex items-start justify-between">
                <div>
                  {connectionStatus.google ? (
                    <>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> Sync Active
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Leads syncing automatically every 5 minutes
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 text-slate-400 font-extrabold text-xs">
                        <Plug className="h-4 w-4 shrink-0" /> Sync Inactive
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        No active sync configuration
                      </p>
                    </>
                  )}
                </div>

                <RowActionsMenu
                  items={[
                    {
                      label: connectionStatus.google ? 'Re-sync Account' : 'Connect Account',
                      icon: RotateCcw,
                      onClick: () => navigate('/admin/leads/integrations/google/connect'),
                    },
                    {
                      label: 'View Sync Logs',
                      icon: FileText,
                      onClick: () => navigate('/admin/leads/automation/activity'),
                    },
                    {
                      label: connectionStatus.google ? 'Disconnect Account' : 'Remove Integration',
                      icon: Trash2,
                      danger: true,
                      divider: true,
                      onClick: () => {
                        setConnectionStatus({ ...connectionStatus, google: !connectionStatus.google });
                        toast.info(connectionStatus.google ? 'Google Ads account disconnected' : 'Google Ads account connected');
                      },
                    },
                  ]}
                />
              </div>

              {connectionStatus.google ? (
                <div className="space-y-3 pt-3 border-t border-slate-200/80">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Health Status</span>
                      <span className="font-extrabold text-emerald-700">Healthy</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Error Rate</span>
                      <span className="font-extrabold text-slate-800">0.2%</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => navigate('/admin/leads/integrations/google/connect')}
                    className="bg-white text-indigo-700 border-indigo-200 font-extrabold hover:bg-indigo-50 shadow-xs flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Settings className="h-3.5 w-3.5" /> Manage Integration
                  </Button>
                </div>
              ) : (
                <Button
                  variant="accent"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/admin/leads/integrations/google/connect')}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-xs flex items-center justify-center gap-1.5 text-xs mt-4"
                >
                  <Plus className="h-4 w-4" /> Connect Google Ads
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* PLATFORM 3: WHATSAPP API */}
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Col 1: Platform Header & Credentials (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#0D1F3D]">WhatsApp API</h3>
                    {connectionStatus.whatsapp ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Connected
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    WhatsApp Business Cloud API
                  </p>
                </div>
              </div>

              {connectionStatus.whatsapp ? (
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400 text-[11px]">Phone Number</span>
                    <span className="font-mono font-extrabold text-[#0D1F3D]">+91 90876 54321</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400 text-[11px]">WABA ID</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">123456789012345</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 pt-0.5">
                    <span className="text-slate-400 text-[11px]">Last Sync</span>
                    <div className="text-right">
                      <span className="font-bold text-[#0D1F3D] block text-[11px]">Just now</span>
                      <span className="text-[10px] text-emerald-600 font-extrabold">Auto sync: Real-time</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-sm border border-dashed border-slate-200 text-[11px] text-slate-500 font-medium">
                  No WhatsApp Business API connected. Connect to convert chats into leads.
                </div>
              )}
            </div>

            {/* Col 2: Metrics Inner Box (3 Cols) */}
            <div className="lg:col-span-3">
              {connectionStatus.whatsapp ? (
                <div className="bg-slate-50/70 p-4 rounded-md border border-slate-200/90 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Leads (Last 30 Days)</span>
                    <span className="text-emerald-600 font-extrabold text-xs">↑ 20.4%</span>
                  </div>
                  <span className="text-3xl font-black text-[#0D1F3D] my-1">2,490</span>
                  <div className="grid grid-cols-4 gap-1 text-[10px] pt-2 border-t border-slate-200/80 text-center">
                    <div>
                      <span className="text-slate-400 block font-medium">New Leads</span>
                      <span className="font-extrabold text-[#0D1F3D]">2,184</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Assigned</span>
                      <span className="font-extrabold text-[#0D1F3D]">1,946</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Converted</span>
                      <span className="font-extrabold text-[#0D1F3D]">498</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Conversion Rate</span>
                      <span className="font-extrabold text-emerald-600">20.0%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/70 p-4 rounded-md border border-slate-200/90 h-full flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-slate-400 block">Leads (Last 30 Days)</span>
                  <span className="text-2xl font-bold text-slate-300 my-1">—</span>
                  <span className="text-[10px] text-slate-400">Connect platform to view metrics</span>
                </div>
              )}
            </div>

            {/* Col 3: Top Campaign & Form Info (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col justify-center space-y-2 text-xs bg-slate-50/50 p-4 rounded-md border border-slate-200/60">
              {connectionStatus.whatsapp ? (
                <>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase tracking-wider">Sources</span>
                    <span className="font-extrabold text-[#0D1F3D] block text-xs">Click-to-WhatsApp, Chat, Catalog, QR Code</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase tracking-wider">Default Team</span>
                    <span className="font-bold text-slate-700 block text-xs">WhatsApp Team</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block uppercase tracking-wider">Auto-Reply</span>
                    <span className="font-bold text-emerald-600 block text-xs">Enabled</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-400 font-medium text-xs">
                  No sources data available until connected.
                </div>
              )}
            </div>

            {/* Col 4: Webhook Active & Action Menu (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col justify-between bg-slate-50/50 p-4 rounded-md border border-slate-200/60 relative">
              <div className="flex items-start justify-between">
                <div>
                  {connectionStatus.whatsapp ? (
                    <>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> Webhook Active
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Receiving messages in real-time via Meta API
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 text-slate-400 font-extrabold text-xs">
                        <Plug className="h-4 w-4 shrink-0" /> Webhook Inactive
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        No active WhatsApp webhook
                      </p>
                    </>
                  )}
                </div>

                <RowActionsMenu
                  items={[
                    {
                      label: connectionStatus.whatsapp ? 'Re-sync Account' : 'Connect Account',
                      icon: RotateCcw,
                      onClick: () => navigate('/admin/leads/integrations/whatsapp/connect'),
                    },
                    {
                      label: 'View Webhook Logs',
                      icon: FileText,
                      onClick: () => navigate('/admin/leads/automation/activity'),
                    },
                    {
                      label: connectionStatus.whatsapp ? 'Disconnect Account' : 'Remove Integration',
                      icon: Trash2,
                      danger: true,
                      divider: true,
                      onClick: () => {
                        setConnectionStatus({ ...connectionStatus, whatsapp: !connectionStatus.whatsapp });
                        toast.info(connectionStatus.whatsapp ? 'WhatsApp API disconnected' : 'WhatsApp API connected');
                      },
                    },
                  ]}
                />
              </div>

              {connectionStatus.whatsapp ? (
                <div className="space-y-3 pt-3 border-t border-slate-200/80">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Health Status</span>
                      <span className="font-extrabold text-emerald-700">Healthy</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Error Rate</span>
                      <span className="font-extrabold text-slate-800">0%</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => navigate('/admin/leads/integrations/whatsapp/connect')}
                    className="bg-white text-indigo-700 border-indigo-200 font-extrabold hover:bg-indigo-50 shadow-xs flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Settings className="h-3.5 w-3.5" /> Manage Integration
                  </Button>
                </div>
              ) : (
                <Button
                  variant="accent"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/admin/leads/integrations/whatsapp/connect')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-xs flex items-center justify-center gap-1.5 text-xs mt-4"
                >
                  <Plus className="h-4 w-4" /> Connect WhatsApp API
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: RECENT ACTIVITY & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
        {/* Recent Integration Activity Log (7 Cols) */}
        <div className="lg:col-span-7 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Recent Integration Activity</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/leads/automation/activity')}
              className="bg-white text-indigo-700 border-slate-200 font-bold hover:bg-slate-50"
            >
              View All Logs
            </Button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-sm border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-sm bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Facebook className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block">New lead captured from Meta Lead Ads</span>
                  <span className="text-[10px] text-slate-500 font-medium">Form: Lead Form 01 • Campaign: Summer Offer 2025</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">1 min ago</span>
                <span className="text-[9px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-xs">New Lead</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-sm border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-sm bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Search className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block">New lead captured from Google Ads</span>
                  <span className="text-[10px] text-slate-500 font-medium">Form: Website Leads Form • Campaign: Search - CRM Solution</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">2 min ago</span>
                <span className="text-[9px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-xs">New Lead</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-sm border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-sm bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block">New enquiry captured from WhatsApp</span>
                  <span className="text-[10px] text-slate-500 font-medium">Source: Click-to-WhatsApp • From: +91 98765 43210</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Just now</span>
                <span className="text-[9px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-xs">New Lead</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid (5 Cols) */}
        <div className="lg:col-span-5 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => navigate('/admin/leads/integrations/meta/connect')}
              className="p-3 rounded-sm border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center gap-2 text-blue-600">
                <Facebook className="h-4 w-4" />
                <span className="font-extrabold text-[#0D1F3D] text-xs">Connect Meta</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Lead Ads</span>
            </div>

            <div
              onClick={() => navigate('/admin/leads/integrations/google/connect')}
              className="p-3 rounded-sm border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center gap-2 text-amber-500">
                <Search className="h-4 w-4" />
                <span className="font-extrabold text-[#0D1F3D] text-xs">Connect Google Ads</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Lead Forms</span>
            </div>

            <div
              onClick={() => navigate('/admin/leads/integrations/whatsapp/connect')}
              className="p-3 rounded-sm border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center gap-2 text-emerald-600">
                <MessageSquare className="h-4 w-4" />
                <span className="font-extrabold text-[#0D1F3D] text-xs">Connect WhatsApp</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Business API</span>
            </div>

            <div
              onClick={() => navigate('/admin/leads/automation/settings')}
              className="p-3 rounded-sm border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center gap-2 text-indigo-600">
                <Users className="h-4 w-4" />
                <span className="font-extrabold text-[#0D1F3D] text-xs">Assignment Rules</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Auto assign leads</span>
            </div>

            <div
              onClick={() => toast.info('Field Mapping opened')}
              className="p-3 rounded-sm border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center gap-2 text-purple-600">
                <Layers className="h-4 w-4" />
                <span className="font-extrabold text-[#0D1F3D] text-xs">Field Mapping</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Map lead fields</span>
            </div>

            <div
              onClick={() => navigate('/admin/leads/automation/activity')}
              className="p-3 rounded-sm border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center gap-2 text-teal-600">
                <FileText className="h-4 w-4" />
                <span className="font-extrabold text-[#0D1F3D] text-xs">Sync Logs</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">View all activities</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
