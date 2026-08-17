import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, AlertTriangle, Lock, Unlock, CheckCircle2, History } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function SuspendExecutivePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [action, setAction] = useState<'suspend' | 'reactivate'>('suspend');
  const [reason, setReason] = useState('Violation of Policy');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(
      action === 'suspend'
        ? 'Executive access suspended successfully.'
        : 'Executive account reactivated successfully.',
    );
    setTimeout(() => {
      navigate(`/admin/executives/${id || 'FE-1001'}`);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/admin/executives/${id || 'FE-1001'}`)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Details
        </button>

        <h1 className="text-xl font-extrabold text-[#0D1F3D]">Suspend / Reactivate Executive</h1>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-extrabold text-emerald-700 animate-in fade-in">
          ✓ {successMsg} Redirecting...
        </div>
      )}

      {/* Executive Info Header Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="Rahul Verma"
            className="h-16 w-16 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#0D1F3D]">Rahul Verma</h2>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-extrabold text-emerald-600">
                Active
              </span>
            </div>
            <p className="text-xs font-bold text-[#E20613]">Field Executive • {id || 'FE-1001'}</p>
            <p className="text-[11px] text-slate-400 font-medium">Team: Mumbai North Team • Reporting: Sanjay Yadav</p>
          </div>
        </div>

        <div className="text-right text-xs font-semibold text-slate-500">
          <p>Current Status: <span className="font-extrabold text-emerald-600">Active</span></p>
          <p>Status Since: <span className="font-bold text-[#0D1F3D]">12 Apr 2024</span></p>
          <p>Last Login: <span className="font-bold text-[#0D1F3D]">19 May 2025 06:15 PM</span></p>
        </div>
      </div>

      {/* Main Form & Impact Warning Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Action Control Form */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="h-5 w-5 text-[#E20613]" />
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Access Control Action</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Action Select Options */}
            <div className="space-y-3">
              <label
                onClick={() => setAction('suspend')}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  action === 'suspend'
                    ? 'border-red-300 bg-red-50/70 ring-1 ring-[#E20613]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  checked={action === 'suspend'}
                  onChange={() => setAction('suspend')}
                  className="mt-1 text-[#E20613] focus:ring-[#E20613]"
                />
                <div>
                  <p className="text-xs font-extrabold text-[#E20613] flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Suspend Executive Access
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Restricts executive from logging in and accessing the mobile or web application.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setAction('reactivate')}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  action === 'reactivate'
                    ? 'border-emerald-300 bg-emerald-50/70 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  checked={action === 'reactivate'}
                  onChange={() => setAction('reactivate')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                    <Unlock className="h-3.5 w-3.5" /> Reactivate Executive Access
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Restores full system and mobile application access.
                  </p>
                </div>
              </label>
            </div>

            {/* Reason Selection */}
            <div className="text-xs font-semibold space-y-1">
              <label className="text-slate-600 font-bold block">Reason *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
              >
                <option value="Violation of Policy">Violation of Policy</option>
                <option value="End of Employment">End of Employment</option>
                <option value="Performance Review">Performance Review</option>
                <option value="Temporary Suspension">Temporary Suspension</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div className="text-xs font-semibold space-y-1">
              <label className="text-slate-600 font-bold block">Additional Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Enter specific details regarding this access control decision..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
              />
            </div>

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/executives/${id || 'FE-1001'}`)}
                className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={action === 'suspend' ? 'accent' : 'primary'}
                size="sm"
                className="font-bold shadow-sm"
              >
                {action === 'suspend' ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Impact Warning & Recent Access Audit Log */}
        <div className="space-y-6 lg:col-span-6">
          {/* Impact Warning Card */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-extrabold">Impact of Access Change</h3>
            </div>
            <ul className="space-y-2 text-xs font-medium text-amber-900 list-disc pl-4">
              <li>Executive will not be able to log in to the web portal or mobile app.</li>
              <li>Ongoing field visits, tasks, and follow-ups will be paused.</li>
              <li>Leads and deals remain in the system and can be reassigned to other executives.</li>
              <li>Historical route data, attendance records, and sales history are preserved intact.</li>
            </ul>
          </div>

          {/* Recent Access History Audit */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#E20613]" />
                <h3 className="text-base font-extrabold text-[#0D1F3D]">Recent Access Audit Log</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">Security Log</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase">
                    <th className="px-3 py-2.5">Date & Time</th>
                    <th className="px-3 py-2.5">Device</th>
                    <th className="px-3 py-2.5">IP Address</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                  {[
                    { date: '19 May 2025 06:15 PM', device: 'Android App (v2.4.1)', ip: '106.201.45.12', status: 'Success' },
                    { date: '19 May 2025 10:30 AM', device: 'Web Portal (Chrome)', ip: '106.201.45.12', status: 'Success' },
                    { date: '18 May 2025 07:20 PM', device: 'Android App (v2.4.1)', ip: '152.58.96.11', status: 'Success' },
                    { date: '18 May 2025 11:05 AM', device: 'Android App (v2.4.1)', ip: '106.201.45.12', status: 'Success' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-bold text-[#0D1F3D]">{row.date}</td>
                      <td className="px-3 py-2.5 text-slate-600">{row.device}</td>
                      <td className="px-3 py-2.5 text-slate-400 font-mono">{row.ip}</td>
                      <td className="px-3 py-2.5">
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
