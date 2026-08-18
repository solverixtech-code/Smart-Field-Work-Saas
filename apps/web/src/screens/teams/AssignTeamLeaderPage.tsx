import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Info,
  AlertTriangle,
  Search,
  CheckCircle2,
  UserCheck,
  Award,
  History,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface LeaderCandidate {
  id: string;
  name: string;
  avatar: string;
  role: string;
  employeeId: string;
  joinedOn: string;
  dealsThisMonth: number;
  winRate: number;
  isCurrentLeader: boolean;
}

const candidatesData: LeaderCandidate[] = [
  {
    id: 'TL-1003',
    name: 'Sanjay Yadav',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    role: 'Team Leader',
    employeeId: 'TL-1003',
    joinedOn: '12 Apr 2024',
    dealsThisMonth: 8,
    winRate: 81,
    isCurrentLeader: true,
  },
  {
    id: 'TL-1007',
    name: 'Priya Mehta',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    role: 'Senior Executive',
    employeeId: 'TL-1007',
    joinedOn: '15 Apr 2024',
    dealsThisMonth: 6,
    winRate: 92,
    isCurrentLeader: false,
  },
  {
    id: 'TL-1011',
    name: 'Rohit Singh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    role: 'Field Executive',
    employeeId: 'TL-1011',
    joinedOn: '16 Apr 2024',
    dealsThisMonth: 5,
    winRate: 70,
    isCurrentLeader: false,
  },
  {
    id: 'TL-1009',
    name: 'Karan Patil',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    role: 'Field Executive',
    employeeId: 'TL-1009',
    joinedOn: '17 Apr 2024',
    dealsThisMonth: 4,
    winRate: 64,
    isCurrentLeader: false,
  },
  {
    id: 'TL-1014',
    name: 'Neha Deshpande',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    role: 'Field Executive',
    employeeId: 'TL-1014',
    joinedOn: '18 Apr 2024',
    dealsThisMonth: 3,
    winRate: 62,
    isCurrentLeader: false,
  },
  {
    id: 'TL-1017',
    name: 'Vishal Shah',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    role: 'Field Executive',
    employeeId: 'TL-1017',
    joinedOn: '19 Apr 2024',
    dealsThisMonth: 2,
    winRate: 58,
    isCurrentLeader: false,
  },
];

export default function AssignTeamLeaderPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();

  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('TL-1003');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCandidate = candidatesData.find((c) => c.id === selectedLeaderId);

  const handleAssign = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`Team leader successfully assigned to ${selectedCandidate?.name || 'selected executive'}!`);
      navigate(`/admin/teams/${teamId || 'MN-001'}`);
    }, 800);
  };

  const filteredCandidates = candidatesData.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employeeId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Assign Team Leader — Mumbai North Team</h1>
          <p className="text-xs font-medium text-slate-500">
            Reassign team leadership permissions, task overview rights, and reporting authority.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/teams/${teamId || 'MN-001'}`)}
          className="flex items-center gap-2 font-bold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Team Details
        </Button>
      </div>

      {/* Team Meta Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-lg font-extrabold">
              MN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#0D1F3D]">Mumbai North Team</h2>
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600">
                  Active
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400">Team Code: MN-001</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Team Type</span>
              <span className="font-extrabold text-[#0D1F3D]">Sales Team</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Department</span>
              <span className="font-extrabold text-[#0D1F3D]">Sales</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Region / Area</span>
              <span className="font-extrabold text-[#0D1F3D]">North Mumbai Region</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Members</span>
              <span className="font-extrabold text-[#0D1F3D]">8 Executive Staff</span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 flex items-center gap-2.5 text-xs font-semibold text-blue-900">
          <Info className="h-4 w-4 flex-shrink-0 text-blue-600" />
          <span>A team leader is responsible for managing the team, assigning tasks, and tracking performance.</span>
        </div>
      </div>

      {/* Main Grid: Selection Table (Left 8 Cols) + Impact & History (Right 4 Cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-8">
          {/* Current Team Leader Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Current Team Leader</h3>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Sanjay Yadav"
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-[#0D1F3D]">Sanjay Yadav</p>
                    <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600">
                      Active Leader
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Employee ID: <span className="font-mono text-slate-600">TL-1003</span> • Team Leader Since: <span className="font-bold text-slate-700">12 Apr 2024</span>
                  </p>
                </div>
              </div>

              {/* Stats pill row */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="text-center px-3 border-r border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Deals (This Month)</span>
                  <span className="text-sm font-extrabold text-[#0D1F3D]">8</span>
                </div>
                <div className="text-center px-3 border-r border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Achieved</span>
                  <span className="text-sm font-extrabold text-emerald-600">₹3,25,000</span>
                </div>
                <div className="text-center px-3">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Win Rate</span>
                  <span className="text-sm font-extrabold text-blue-600">81%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Select New Team Leader Table Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-extrabold text-[#0D1F3D]">Select New Team Leader</h3>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or employee ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
                    />
                  </div>
                  <select className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D]">
                    <option>Active Members Only</option>
                  </select>
                </div>
              </div>

              {/* Selection Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3.5">Select</th>
                      <th className="px-4 py-3.5">Employee</th>
                      <th className="px-4 py-3.5">Role</th>
                      <th className="px-4 py-3.5">Employee ID</th>
                      <th className="px-4 py-3.5">Joined On</th>
                      <th className="px-4 py-3.5">Deals (This Month)</th>
                      <th className="px-4 py-3.5">Win Rate (This Month)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredCandidates.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedLeaderId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedLeaderId === c.id ? 'bg-blue-50/50' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="radio"
                            name="teamLeader"
                            checked={selectedLeaderId === c.id}
                            onChange={() => setSelectedLeaderId(c.id)}
                            className="text-[#0D1F3D] focus:ring-[#0D1F3D]"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img src={c.avatar} alt={c.name} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                            <div>
                              <p className="font-extrabold text-[#0D1F3D]">{c.name}</p>
                              {c.isCurrentLeader && (
                                <span className="text-[10px] font-bold text-emerald-600 block">Current Leader</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px] font-extrabold">
                            {c.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono text-slate-600">{c.employeeId}</td>
                        <td className="px-4 py-4 font-medium text-slate-500">{c.joinedOn}</td>
                        <td className="px-4 py-4 font-extrabold text-[#0D1F3D]">{c.dealsThisMonth}</td>
                        <td className="px-4 py-4 font-extrabold text-emerald-600">{c.winRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
              <span className="text-xs text-slate-500 font-semibold">Showing 1 to {filteredCandidates.length} of {candidatesData.length} members</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/teams/${teamId || 'MN-001'}`)}
                  className="font-bold"
                >
                  Cancel
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={handleAssign}
                  className="font-bold flex items-center gap-2 shadow-xs"
                >
                  <UserCheck className="h-4 w-4" /> Assign Leader
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Impact & Change History */}
        <div className="space-y-6 lg:col-span-4">
          {/* Leader Change Impact Warning */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Leader Change Impact</h3>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-2.5 text-xs text-amber-900 font-medium leading-relaxed">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <span>Please review the impact before changing the team leader.</span>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-600">
              {[
                'The new leader will get access to team data and reports.',
                'Ongoing tasks and follow-ups will remain assigned to team members.',
                'Team targets and settings will remain unchanged.',
                'Previous leader will lose team leader permissions.',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-blue-600 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leadership Change History */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Change History</h3>
              <History className="h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-4 text-xs">
              {[
                { name: 'Sanjay Yadav', badge: 'Current Leader', date: '12 Apr 2024, 10:30 AM', by: 'Amit Sharma', current: true },
                { name: 'Priya Mehta', badge: 'Was team leader', date: '10 Mar 2024, 09:15 AM', by: 'Amit Sharma', current: false },
                { name: 'Rohit Singh', badge: 'Was team leader', date: '05 Feb 2024, 11:20 AM', by: 'Amit Sharma', current: false },
              ].map((h, idx) => (
                <div key={idx} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${h.current ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-[#0D1F3D]">{h.name}</p>
                      <span className={`text-[10px] font-bold ${h.current ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {h.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{h.date} • by {h.by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
