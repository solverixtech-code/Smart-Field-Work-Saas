import React, { useState } from 'react';
import { toast } from 'sonner';
import { UserCheck, Users, Save, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { LeadItem } from '../leadsData';

interface TabProps {
  lead: LeadItem;
}

export function LeadAssignmentTab({ lead }: TabProps) {
  const [selectedExecutive, setSelectedExecutive] = useState(lead.assignedExecutive);
  const [reassignReason, setReassignReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignReason.trim()) {
      toast.error('Please provide a reason for lead reassignment.');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`Lead successfully reassigned to ${selectedExecutive}!`);
      setReassignReason('');
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-purple-600" />
            <span>Lead Assignment & Reassignment Portal</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Transfer lead ownership between field executives or reassign team leaders with full audit tracking.
          </p>
        </div>
      </div>

      {/* Current Assignment Box */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        <div className="flex items-center gap-3">
          <img
            src={lead.assignedExecutiveAvatar}
            alt={lead.assignedExecutive}
            className="h-10 w-10 rounded-full object-cover border-2 border-white"
          />
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Currently Assigned Executive</span>
            <p className="font-extrabold text-[#0D1F3D] text-sm">{lead.assignedExecutive}</p>
            <p className="text-[11px] text-[#E20613] font-bold">{lead.assignedLeader} (Team Leader)</p>
          </div>
        </div>
      </div>

      {/* Reassignment Form */}
      <form onSubmit={handleReassign} className="space-y-4 text-xs font-semibold pt-2">
        <div className="space-y-1">
          <label className="font-bold text-[#0D1F3D] block">Select New Field Executive *</label>
          <select
            value={selectedExecutive}
            onChange={(e) => setSelectedExecutive(e.target.value)}
            className="w-full sm:w-1/2 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D]"
          >
            <option value="Rahul Verma">Rahul Verma (FE-1001) • Mumbai North</option>
            <option value="Priya Mehta">Priya Mehta (FE-1002) • Western Suburbs</option>
            <option value="Sanjay Yadav">Sanjay Yadav (FE-1003) • Eastern Suburbs</option>
            <option value="Karan Patil">Karan Patil (FE-1009) • Thane Team</option>
            <option value="Neha Deshpande">Neha Deshpande (FE-1014) • Pune Team</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-[#0D1F3D] block">Reassignment Reason / Transfer Note *</label>
          <textarea
            rows={3}
            required
            value={reassignReason}
            onChange={(e) => setReassignReason(e.target.value)}
            placeholder="e.g. Client requested territory transfer to Bandra West sales team..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 font-semibold text-[#0D1F3D]"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="accent" size="sm" type="submit" isLoading={isSaving} className="font-bold shadow-xs">
            Confirm Reassignment
          </Button>
        </div>
      </form>
    </div>
  );
}
