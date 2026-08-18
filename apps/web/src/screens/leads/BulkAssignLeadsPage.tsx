import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  UserCheck,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Save,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { mockLeadsData, LeadItem } from './leadsData';

export default function BulkAssignLeadsPage() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>(['LD-1003']);
  const [targetExecutive, setTargetExecutive] = useState('Rahul Verma (FE-1001)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unassignedLeads = mockLeadsData.filter((l) => l.status === 'Unassigned' || l.assignedExecutive === 'Unassigned');

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(unassignedLeads.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      toast.error('Please select at least one lead to assign.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Successfully assigned ${selectedIds.length} lead(s) to ${targetExecutive}!`);
      navigate('/admin/leads');
    }, 600);
  };

  return (
    <div className="space-y-3 font-sans pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/leads')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </button>

        <Button
          variant="accent"
          size="sm"
          type="button"
          onClick={handleBulkAssign}
          isLoading={isSubmitting}
          className="flex items-center gap-2 font-bold shadow-xs"
        >
          <UserCheck className="h-4 w-4" /> Apply Bulk Assignment ({selectedIds.length})
        </Button>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0D1F3D]">Bulk Lead Assignment</h2>
              <p className="text-xs font-medium text-slate-500">
                Select unassigned leads or territory pools and assign them in batch to a designated field executive.
              </p>
            </div>
          </div>
        </div>

        {/* Target Executive Selector */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2 text-xs font-semibold">
          <label className="font-bold text-[#0D1F3D] block">Select Target Field Executive *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={targetExecutive}
              onChange={(e) => setTargetExecutive(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
            >
              <option>Rahul Verma (FE-1001) • Mumbai North</option>
              <option>Priya Mehta (FE-1002) • Western Suburbs</option>
              <option>Sanjay Yadav (FE-1003) • Eastern Suburbs</option>
              <option>Karan Patil (FE-1009) • Thane Team</option>
              <option>Neha Deshpande (FE-1014) • Pune Team</option>
            </select>

            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <AlertCircle className="h-4 w-4 text-purple-600 shrink-0" />
              <span>Assigned leads will receive real-time push notifications on their mobile app.</span>
            </div>
          </div>
        </div>

        {/* Unassigned Leads Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold text-[#0D1F3D]">Select Leads to Assign ({unassignedLeads.length} Available)</h3>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="p-3 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === unassignedLeads.length && unassignedLeads.length > 0}
                      className="rounded border-slate-300 text-[#E20613] focus:ring-[#E20613]"
                    />
                  </th>
                  <th className="p-3">Lead Code</th>
                  <th className="p-3">Company Name</th>
                  <th className="p-3">Contact Person</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">Est. Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                {unassignedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => handleSelectOne(lead.id)}
                        className="rounded border-slate-300 text-[#E20613] focus:ring-[#E20613]"
                      />
                    </td>
                    <td className="p-3 font-mono text-slate-500">{lead.code}</td>
                    <td className="p-3 font-extrabold text-[#0D1F3D]">{lead.companyName}</td>
                    <td className="p-3">{lead.contactPerson}</td>
                    <td className="p-3">{lead.region}</td>
                    <td className="p-3 font-bold text-emerald-600">₹{lead.estimatedValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={() => navigate('/admin/leads')} className="font-bold">
            Cancel
          </Button>
          <Button variant="accent" size="sm" type="button" onClick={handleBulkAssign} isLoading={isSubmitting} className="font-bold shadow-xs">
            Confirm Bulk Assignment
          </Button>
        </div>
      </div>
    </div>
  );
}
