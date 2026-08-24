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
  MoreHorizontal,
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  HeartPulse,
  Settings,
  ExternalLink,
  Shield,
  Layers,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { mockIntegrationPlatforms } from './leadSourcesData';

export default function LeadIntegrationsDashboard() {
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Integration Health Check Status: All 3 Platforms Operational')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <HeartPulse className="h-4 w-4 text-purple-600" /> Integration Health
          </Button>
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
            <span className="text-xl font-extrabold text-emerald-600">3</span>
            <span className="text-xs font-semibold text-emerald-600 block">100% of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Leads Captured</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">12,458</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 18.4% vs last 30 days</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Leads Assigned</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">11,236</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 16.7% vs last 30 days</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">21.3%</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 2.9% vs last 30 days</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-teal-50 text-teal-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Revenue Generated</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 42,68,000</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 19.7% vs last 30 days</span>
          </div>
        </div>
      </div>

      {/* CONNECTED PLATFORM CARDS LIST */}
      <div className="space-y-4">
        {/* Platform 1: Meta Lead Ads */}
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Facebook className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#0D1F3D]">Meta Lead Ads</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Connected
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Facebook & Instagram Lead Ads
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium mt-1">
                  <span>Connected Account: <strong className="text-[#0D1F3D]">Aimbeat Business</strong></span>
                  <span>•</span>
                  <span>FB Page: <strong className="text-indigo-600">Aimbeat</strong></span>
                  <span>•</span>
                  <span>Last Sync: <strong>1 min ago</strong> <span className="text-emerald-600 font-bold">(Auto sync: Real-time)</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/leads/integrations/meta/connect')}
                className="bg-white text-indigo-700 border-indigo-200 font-bold hover:bg-indigo-50 shadow-xs flex items-center gap-1.5"
              >
                <Settings className="h-3.5 w-3.5" /> Manage Integration
              </Button>

              <button
                onClick={() => setActiveMenuId(activeMenuId === 'meta' ? null : 'meta')}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-sm border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
            {/* Metrics */}
            <div className="bg-slate-50/70 p-3.5 rounded-sm border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Leads (Last 30 Days)</span>
                <span className="text-emerald-600 font-bold">↑ 18.6%</span>
              </div>
              <span className="text-2xl font-black text-[#0D1F3D] block">5,842</span>
              <div className="grid grid-cols-4 gap-1 text-[10px] pt-1 text-center border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block font-medium">New</span>
                  <span className="font-bold text-[#0D1F3D]">4,856</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Assigned</span>
                  <span className="font-bold text-[#0D1F3D]">4,412</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Converted</span>
                  <span className="font-bold text-[#0D1F3D]">1,156</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">CR %</span>
                  <span className="font-bold text-emerald-600">19.9%</span>
                </div>
              </div>
            </div>

            {/* Campaign & Form Info */}
            <div className="bg-slate-50/70 p-3.5 rounded-sm border border-slate-200 space-y-2">
              <span className="text-slate-500 font-medium block">Top Campaign</span>
              <span className="font-extrabold text-[#0D1F3D] block">Summer Offer 2025</span>
              <span className="text-slate-500 font-medium block pt-1">Top Ad Set</span>
              <span className="font-bold text-slate-700 block">Offer - Mumbai - 18+</span>
              <span className="text-slate-500 font-medium block pt-1">Lead Form</span>
              <span className="font-bold text-indigo-700 block">Lead Form 01</span>
            </div>

            {/* Webhook & Health Status */}
            <div className="bg-slate-50/70 p-3.5 rounded-sm border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 font-extrabold">
                  <CheckCircle2 className="h-4 w-4" /> Webhook Active
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Receiving leads in real-time via Meta Webhooks API
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Health Status</span>
                  <span className="font-bold text-emerald-700">Healthy</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Error Rate</span>
                  <span className="font-bold text-slate-800">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform 2: Google Ads */}
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shrink-0">
                <Search className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#0D1F3D]">Google Ads</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Connected
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Google Ads Lead Forms & Search Extensions
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium mt-1">
                  <span>Connected Account: <strong className="text-[#0D1F3D]">aimbeatads@gmail.com</strong></span>
                  <span>•</span>
                  <span>Customer ID: <strong className="font-mono text-slate-800">123-456-7890</strong></span>
                  <span>•</span>
                  <span>Last Sync: <strong>2 min ago</strong> <span className="text-emerald-600 font-bold">(Auto sync: Every 5 min)</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/leads/integrations/google/connect')}
                className="bg-white text-indigo-700 border-indigo-200 font-bold hover:bg-indigo-50 shadow-xs flex items-center gap-1.5"
              >
                <Settings className="h-3.5 w-3.5" /> Manage Integration
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="bg-slate-50/70 p-3.5 rounded-sm border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Leads (Last 30 Days)</span>
                <span className="text-emerald-600 font-bold">↑ 16.2%</span>
              </div>
              <span className="text-2xl font-black text-[#0D1F3D] block">4,126</span>
              <div className="grid grid-cols-4 gap-1 text-[10px] pt-1 text-center border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block font-medium">New</span>
                  <span className="font-bold text-[#0D1F3D]">3,354</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Assigned</span>
                  <span className="font-bold text-[#0D1F3D]">3,078</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Converted</span>
                  <span className="font-bold text-[#0D1F3D]">786</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">CR %</span>
                  <span className="font-bold text-emerald-600">19.1%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/70 p-3.5 rounded-sm border border-slate-200 space-y-2">
              <span className="text-slate-500 font-medium block">Top Campaign</span>
              <span className="font-extrabold text-[#0D1F3D] block">Search - CRM Solution</span>
              <span className="text-slate-500 font-medium block pt-1">Top Ad Group</span>
              <span className="font-bold text-slate-700 block">CRM Solution - Mumbai</span>
              <span className="text-slate-500 font-medium block pt-1">Lead Form</span>
              <span className="font-bold text-indigo-700 block">Website Leads Form</span>
            </div>

            <div className="bg-slate-50/70 p-3.5 rounded-sm border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 font-extrabold">
                  <CheckCircle2 className="h-4 w-4" /> Sync Active
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Leads syncing automatically every 5 minutes via Google API
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Health Status</span>
                  <span className="font-bold text-emerald-700">Healthy</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Error Rate</span>
                  <span className="font-bold text-slate-800">0.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform 3: WhatsApp API */}
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <MessageSquare className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#0D1F3D]">WhatsApp API</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Connected
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  WhatsApp Business Cloud API Inbound Enquiries
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium mt-1">
                  <span>Phone Number: <strong className="font-mono text-[#0D1F3D]">+91 90876 54321</strong></span>
                  <span>•</span>
                  <span>WABA ID: <strong className="font-mono text-slate-800">123456789012345</strong></span>
                  <span>•</span>
                  <span>Last Sync: <strong>Just now</strong> <span className="text-emerald-600 font-bold">(Auto sync: Real-time)</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/leads/integrations/whatsapp/connect')}
                className="bg-white text-indigo-700 border-indigo-200 font-bold hover:bg-indigo-50 shadow-xs flex items-center gap-1.5"
              >
                <Settings className="h-3.5 w-3.5" /> Manage Integration
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="bg-slate-50/70 p-3.5 rounded-sm border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Leads (Last 30 Days)</span>
                <span className="text-emerald-600 font-bold">↑ 20.4%</span>
              </div>
              <span className="text-2xl font-black text-[#0D1F3D] block">2,490</span>
              <div className="grid grid-cols-4 gap-1 text-[10px] pt-1 text-center border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block font-medium">New</span>
                  <span className="font-bold text-[#0D1F3D]">2,184</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Assigned</span>
                  <span className="font-bold text-[#0D1F3D]">1,946</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Converted</span>
                  <span className="font-bold text-[#0D1F3D]">498</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">CR %</span>
                  <span className="font-bold text-emerald-600">20.0%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/70 p-3.5 rounded-sm border border-slate-200 space-y-2">
              <span className="text-slate-500 font-medium block">Sources</span>
              <span className="font-bold text-[#0D1F3D] block">Click-to-WhatsApp, Chat, Catalog, QR Code</span>
              <span className="text-slate-500 font-medium block pt-1">Default Team</span>
              <span className="font-bold text-[#0D1F3D] block">WhatsApp Team</span>
              <span className="text-slate-500 font-medium block pt-1">Auto-Reply</span>
              <span className="font-bold text-emerald-600 block">Enabled</span>
            </div>

            <div className="bg-slate-50/70 p-3.5 rounded-sm border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 font-extrabold">
                  <CheckCircle2 className="h-4 w-4" /> Webhook Active
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Receiving messages & enquiries in real-time via Meta WhatsApp API
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Health Status</span>
                  <span className="font-bold text-emerald-700">Healthy</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Error Rate</span>
                  <span className="font-bold text-slate-800">0%</span>
                </div>
              </div>
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
