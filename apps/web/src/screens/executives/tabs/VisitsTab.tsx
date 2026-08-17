import React, { useState } from 'react';
import { Store, MapPin, Clock, CheckCircle2, Eye, Filter, Search, Flame } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { KpiCard } from '../../../components/dashboard/KpiCard';

const visitSummaryData = [
  { name: 'Completed', value: 22, color: '#10B981' },
  { name: 'Planned', value: 6, color: '#3B82F6' },
  { name: 'Missed', value: 4, color: '#EF4444' },
];

const visitLogs = [
  { id: 'VIS-2025-1056', date: '20 May 2025 10:30 AM', client: 'Shree Ganesh Traders', area: 'Andheri West, Mumbai', type: 'Follow Up', outcome: 'Interested', duration: '45 min', status: 'Completed' },
  { id: 'VIS-2025-1057', date: '20 May 2025 12:15 PM', client: 'Patel Distributors', area: 'Goregaon East, Mumbai', type: 'New Prospect', outcome: 'Meeting Scheduled', duration: '30 min', status: 'Completed' },
  { id: 'VIS-2025-1055', date: '19 May 2025 04:00 PM', client: 'Sharma Enterprises', area: 'Borivali West, Mumbai', type: 'Follow Up', outcome: 'Proposal Sent', duration: '40 min', status: 'Completed' },
  { id: 'VIS-2025-1054', date: '19 May 2025 11:20 AM', client: 'Maharashtra Electricals', area: 'Malad West, Mumbai', type: 'New Prospect', outcome: 'Not Interested', duration: '20 min', status: 'Completed' },
  { id: 'VIS-2025-1053', date: '18 May 2025 03:45 PM', client: 'Raj Sales Corporation', area: 'Kandivali East, Mumbai', type: 'Follow Up', outcome: 'Interested', duration: '35 min', status: 'Completed' },
  { id: 'VIS-2025-1052', date: '18 May 2025 10:00 AM', client: 'Om Hardware Store', area: 'Vasai West, Palghar', type: 'New Prospect', outcome: 'Interested', duration: '25 min', status: 'Completed' },
  { id: 'VIS-2025-1051', date: '17 May 2025 02:30 PM', client: 'Sai Marketing', area: 'Dahisar East, Mumbai', type: 'Follow Up', outcome: 'Meeting Scheduled', duration: '40 min', status: 'Completed' },
  { id: 'VIS-2025-1050', date: '17 May 2025 11:15 AM', client: 'Jain General Stores', area: 'Mira Road, Mumbai', type: 'New Prospect', outcome: 'Not Interested', duration: '15 min', status: 'Missed' },
];

export function VisitsTab() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVisits = visitLogs.filter(
    (v) =>
      v.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans">
      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Visits"
          value="32"
          change="+14%"
          changeType="positive"
          timeframe="vs last 7 days"
          icon={Store}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Unique Customers"
          value="28"
          change="+12%"
          changeType="positive"
          timeframe="vs last 7 days"
          icon={MapPin}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Productive Visits"
          value="22"
          subValue="68.75% of total"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Travel Distance"
          value="245 km"
          change="+8%"
          changeType="positive"
          timeframe="vs last 7 days"
          icon={Clock}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
      </div>

      {/* Main Grid: Visits Data Table + Right Visit Timeline & Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Visit Logs Data Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Store & Site Visits Log</h3>

            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search visits by customer, area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-3.5 py-3">Visit Details</th>
                  <th className="px-3.5 py-3">Customer & Location</th>
                  <th className="px-3.5 py-3">Visit Type</th>
                  <th className="px-3.5 py-3">Outcome</th>
                  <th className="px-3.5 py-3">Duration</th>
                  <th className="px-3.5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3.5 py-3">
                      <div>
                        <p className="font-extrabold text-[#0D1F3D]">{v.date}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{v.id}</p>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <div>
                        <p className="font-extrabold text-[#0D1F3D]">{v.client}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{v.area}</p>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-slate-600">{v.type}</td>
                    <td className="px-3.5 py-3">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                          v.outcome === 'Interested'
                            ? 'bg-emerald-100 text-emerald-700'
                            : v.outcome === 'Meeting Scheduled'
                              ? 'bg-blue-100 text-blue-700'
                              : v.outcome === 'Proposal Sent'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-red-100 text-[#E20613]'
                        }`}
                      >
                        {v.outcome}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-slate-600 font-bold">{v.duration}</td>
                    <td className="px-3.5 py-3">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                          v.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Step-by-Step Visit Timeline & Summary Donut */}
        <div className="space-y-6 lg:col-span-4">
          {/* Visit Summary Donut */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Visit Summary</h3>
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={visitSummaryData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                    {visitSummaryData.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-[#0D1F3D]">32</span>
                <span className="text-[10px] font-bold text-slate-400">Total Visits</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs font-semibold pt-1 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Best Visiting Day:</span>
                <span className="font-extrabold text-[#0D1F3D]">Tuesday</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Peak Visit Hours:</span>
                <span className="font-extrabold text-[#E20613]">10:00 AM - 01:00 PM</span>
              </div>
            </div>
          </div>

          {/* Visit Timeline */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Today's Visit Timeline</h3>
            <div className="space-y-3 pl-2 border-l-2 border-slate-200 text-xs">
              {[
                { time: '09:30 AM', title: 'Travel Started from Borivali', sub: 'En route to Andheri West' },
                { time: '10:30 AM', title: 'Visited - Shree Ganesh Traders', sub: 'Follow Up • 45 min', tag: 'Interested' },
                { time: '12:15 PM', title: 'Visited - Patel Distributors', sub: 'New Prospect • 30 min', tag: 'Meeting Scheduled' },
                { time: '02:00 PM', title: 'Travel to Goregaon East', sub: 'Distance: 14 km' },
                { time: '04:00 PM', title: 'Visited - Sharma Enterprises', sub: 'Proposal Sent • 40 min', tag: 'Proposal Sent' },
              ].map((step, i) => (
                <div key={i} className="relative pl-4 space-y-0.5">
                  <span className="absolute -left-[17px] top-0 h-3 w-3 rounded-full bg-[#E20613] ring-4 ring-white" />
                  <p className="text-[10px] font-bold text-slate-400">{step.time}</p>
                  <p className="font-extrabold text-[#0D1F3D]">{step.title}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{step.sub}</p>
                  {step.tag && (
                    <span className="inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 mt-1">
                      {step.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
