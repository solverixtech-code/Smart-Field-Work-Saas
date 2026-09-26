import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  UserPlus,
  Search,
  CheckCircle2,
  X,
  Target,
  Briefcase,
  MapPin,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Select } from '../ui/Select';
import { api, extractErrorMessage } from '../../common/api';
import { teamApi, TeamCandidate } from '../../screens/teams/teams.api';

export interface UnassignedExecutive {
  id: string;
  name: string;
  avatar: string;
  code: string;
  location: string;
  experience: string;
  rating?: number;
  pastDeals?: number;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string;
  teamName?: string;
  candidates?: TeamCandidate[];
  onMembersAdded?: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName = 'Team',
  candidates = [],
  onMembersAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<UnassignedExecutive | null>(null);
  const [assignedRole, setAssignedRole] = useState('Field Executive');
  const [dealsTarget, setDealsTarget] = useState('5');
  const [amountTarget, setAmountTarget] = useState('250000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const candidatePool: UnassignedExecutive[] = candidates.map((candidate) => ({
    id: candidate.id, name: candidate.name, code: candidate.employeeCode ?? 'Not assigned', avatar: candidate.avatarUrl ?? '',
    location: candidate.department ?? 'Available executive', experience: candidate.designation,
  }));
  const filteredCandidates = candidatePool.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddMember = async () => {
    if (!selectedCandidate || !teamId) {
      toast.error('Please select an unassigned executive to add');
      return;
    }

    setIsSubmitting(true);
    try {
      await teamApi.assignMembers(teamId, [selectedCandidate.id], assignedRole);
      const period = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit' }).format(new Date());
      const targets = [
        { metric: 'deals_count', value: Number(dealsTarget), title: `${selectedCandidate.name} monthly deals` },
        { metric: 'sales_amount', value: Number(amountTarget), title: `${selectedCandidate.name} monthly revenue` },
      ].filter((target) => target.value > 0);
      await Promise.all(targets.map((target) => api.post('/tenant/crm/targets', {
        targetType: 'individual', scopeId: selectedCandidate.id, period, metric: target.metric,
        targetValue: target.value, thresholdPct: 80, title: target.title,
      })));
      toast.success(`${selectedCandidate.name} has been added to ${teamName}!`);
      onMembersAdded?.();
      setSelectedCandidate(null);
      setSearchQuery('');
      onClose();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Unable to add the team member.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#E20613] border border-red-100 shadow-xs">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#0D1F3D]">Add Team Member</h3>
            <p className="text-xs text-slate-500 font-medium">
              Select an available executive and configure their targets for <span className="font-bold text-[#0D1F3D]">{teamName}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Modal Body: Candidate Selector (Step 1) + Target Config (Step 2) */}
      <div className="space-y-5 py-2">
        {/* Search Candidates Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search unassigned executive by name, code, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Candidate Pool Cards Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Select Executive ({filteredCandidates.length} Available)
          </label>
          <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {filteredCandidates.map((cand) => {
              const isSelected = selectedCandidate?.id === cand.id;
              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#E20613] bg-red-50/40 shadow-xs ring-2 ring-[#E20613]/10'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={cand.name} src={cand.avatar || undefined} sizeClassName="h-10 w-10" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#0D1F3D]">{cand.name}</h4>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {cand.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400" /> {cand.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {cand.experience}
                      </span>
                      {cand.rating !== undefined && cand.pastDeals !== undefined && (
                        <p className="text-[10px] font-semibold text-slate-400 mt-1">★ {cand.rating} • {cand.pastDeals} Deals</p>
                      )}
                    </div>

                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#E20613] bg-[#E20613] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Executive Role & Target Settings Card */}
        {selectedCandidate && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0D1F3D]">
                <Sparkles className="h-4 w-4 text-[#E20613]" />
                <span>Configure Member Role & Monthly Target</span>
              </div>
              <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                {selectedCandidate.name} ({selectedCandidate.code})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Assigned Role */}
              <div className="space-y-1">
                <Select
                  label="Assigned Role"
                  placeholder="Select role"
                  searchable={false}
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value)}
                  options={[
                    { value: 'Field Executive', label: 'Field Executive' },
                    { value: 'Senior Executive', label: 'Senior Executive' },
                    { value: 'Field Specialist', label: 'Field Specialist' },
                  ]}
                />
              </div>

              {/* Monthly Deals Target */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Deals Target (Monthly)</label>
                <input
                  type="number"
                  value={dealsTarget}
                  onChange={(e) => setDealsTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
                  placeholder="e.g. 5"
                />
              </div>

              {/* Monthly Amount Target */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Revenue Target (₹)</label>
                <input
                  type="number"
                  value={amountTarget}
                  onChange={(e) => setAmountTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
                  placeholder="e.g. 250000"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Footer Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button variant="outline" size="sm" onClick={onClose} className="font-bold">
          Cancel
        </Button>
        <Button
          variant="accent"
          size="sm"
          onClick={handleAddMember}
          disabled={!selectedCandidate || isSubmitting}
          className="flex items-center gap-2 font-bold shadow-xs"
        >
          {isSubmitting ? (
            <span>Adding Member...</span>
          ) : (
            <>
              <UserPlus className="h-4 w-4" /> Add Member to Team
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};
