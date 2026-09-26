import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  Building2,
  MapPin,
  Target,
  FileText,
  Shield,
  CheckCircle2,
  Info,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { extractErrorMessage } from '../../common/api';
import { teamApi, TeamOptions, useTeamWorkspace } from './teams.api';

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { data } = useTeamWorkspace(teamId);
  const isEditing = Boolean(teamId);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    leader: '',
    department: 'Sales',
    region: '',
    monthlyTarget: '',
    description: '',
    teamType: 'Field Sales',
    status: 'Active',
    dealAssignment: 'Both Manual & Auto',
    visibility: 'Private',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<TeamOptions>({ candidates: [], regions: [] });

  useEffect(() => {
    teamApi.options().then(setOptions).catch((error: unknown) => toast.error(extractErrorMessage(error, 'Unable to load team options.')));
  }, []);

  useEffect(() => {
    if (!data) return;
    setFormData({
      name: data.team.name, code: data.team.code, leader: data.leader?.id ?? '', department: data.team.department,
      region: data.team.region ?? '', monthlyTarget: String(data.summary.revenueTarget), description: data.team.description ?? '',
      teamType: data.team.teamType, status: data.team.status, dealAssignment: data.team.dealAssignment, visibility: data.team.visibility,
    });
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a team name.');
      return;
    }
    if (!formData.leader) {
      toast.error('Please select a team leader.');
      return;
    }
    if (!formData.region) {
      toast.error('Please select a region / area.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        ...(formData.code.trim() ? { code: formData.code.trim() } : {}),
        leaderMembershipId: formData.leader,
        department: formData.department,
        region: formData.region,
        monthlyTarget: Number(formData.monthlyTarget),
        description: formData.description || null,
        teamType: formData.teamType,
        status: formData.status,
        dealAssignment: formData.dealAssignment,
        visibility: formData.visibility,
      };
      const destinationId = isEditing && teamId ? (await teamApi.update(teamId, payload), teamId) : (await teamApi.create(payload)).id;
      toast.success(`Team "${formData.name}" has been ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate(`/admin/teams/${destinationId}`);
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, `Unable to ${isEditing ? 'update' : 'create'} the team.`));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">{isEditing ? 'Edit Sales Team' : 'Create New Sales Team'}</h1>
          <p className="text-xs font-medium text-slate-500">
            Define team hierarchy, assign team leader, set monthly targets, and configure security visibility.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/teams')}
          className="flex items-center gap-2 font-bold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Teams
        </Button>
      </div>

      {/* Main Grid: Form (Left 8 Cols) + Preview & Step Guide (Right 4 Cols) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Form Fields */}
        <div className="space-y-6 lg:col-span-8">
          {/* Section 1: Team Information Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Team Information</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              {/* Team Name */}
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-slate-700 block">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai North Team"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-semibold text-[#0D1F3D] placeholder-slate-400 focus:outline-none focus:border-[#0D1F3D]"
                />
              </div>

              {/* Team Code */}
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-slate-700 block">Team Code <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  placeholder="Auto-generated if left blank (e.g. MN-001)"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-semibold text-[#0D1F3D] placeholder-slate-400 focus:outline-none focus:border-[#0D1F3D]"
                />
                <p className="text-[10px] text-slate-400 font-medium">Unique code to identify the team across reports.</p>
              </div>

              {/* Team Leader */}
              <div className="space-y-1 sm:col-span-1">
                <Select
                  label="Team Leader *"
                  placeholder="Select team leader"
                  searchable={true}
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  options={options.candidates.map((candidate) => ({
                    value: candidate.id,
                    label: candidate.name,
                    avatar: candidate.avatarUrl || undefined,
                    avatarFallback: !candidate.avatarUrl,
                    sublabel: candidate.employeeCode
                      ? `${candidate.employeeCode} • ${candidate.designation}`
                      : candidate.designation,
                  }))}
                />
              </div>

              {/* Department */}
              <div className="space-y-1 sm:col-span-1">
                <Select
                  label="Department *"
                  placeholder="Select department"
                  searchable={false}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  options={[
                    { value: 'Sales', label: 'Sales & Business Development' },
                    { value: 'Field Ops', label: 'Field Operations' },
                    { value: 'Key Accounts', label: 'Key Accounts' },
                  ]}
                />
              </div>

              {/* Region / Area */}
              <div className="space-y-1 sm:col-span-1">
                <Select
                  label="Region / Area *"
                  placeholder="Select region / area"
                  searchable={true}
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  options={options.regions.map((region) => ({
                    value: region.name,
                    label: region.name,
                  }))}
                />
              </div>

              {/* Monthly Target */}
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-slate-700 block">Target (Monthly) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    placeholder="Enter monthly target amount"
                    value={formData.monthlyTarget}
                    onChange={(e) => setFormData({ ...formData, monthlyTarget: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3.5 py-2.5 font-semibold text-[#0D1F3D] placeholder-slate-400 focus:outline-none focus:border-[#0D1F3D]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700 block">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Enter team description, goals, or operational notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-medium text-[#0D1F3D] placeholder-slate-400 focus:outline-none focus:border-[#0D1F3D]"
                />
                <p className="text-[10px] text-right text-slate-400 font-medium">
                  {formData.description.length} / 500
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Team Settings Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5 text-xs">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Team Settings</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Team Type */}
              <div className="space-y-1">
                <Select
                  label="Team Type *"
                  placeholder="Select team type"
                  searchable={false}
                  value={formData.teamType}
                  onChange={(e) => setFormData({ ...formData, teamType: e.target.value })}
                  options={[
                    { value: 'Field Sales', label: 'Field Sales' },
                    { value: 'Inside Sales', label: 'Inside Sales' },
                    { value: 'Key Accounts', label: 'Key Accounts' },
                  ]}
                />
                <p className="text-[10px] text-slate-400 font-medium">Example: Field Sales, Operations, Support</p>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Select
                  label="Status *"
                  placeholder="Select status"
                  searchable={false}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                />
                <p className="text-[10px] text-slate-400 font-medium">Inactive teams cannot be assigned new work.</p>
              </div>
            </div>

            {/* Deal Assignment Radio Options */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 block">Allow Deal Assignment *</label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  { value: 'Manual Only', title: 'Manual Only', desc: 'Leads/Deals will be assigned manually' },
                  { value: 'Auto Assignment', title: 'Auto Assignment', desc: 'Leads/Deals will be assigned automatically' },
                  { value: 'Both Manual & Auto', title: 'Both Manual & Auto', desc: 'Leads/Deals can be assigned both ways' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, dealAssignment: opt.value })}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                      formData.dealAssignment === opt.value
                        ? 'border-[#0D1F3D] bg-blue-50/40 ring-1 ring-[#0D1F3D]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dealAssignment"
                      checked={formData.dealAssignment === opt.value}
                      onChange={() => {}}
                      className="mt-0.5 text-[#0D1F3D]"
                    />
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">{opt.title}</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Visibility Radio Options */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 block">Visibility & Security Scope *</label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  { value: 'Private', title: 'Private', desc: 'Only team members and managers can view' },
                  { value: 'Department', title: 'Department', desc: 'All department members can view' },
                  { value: 'Organization', title: 'Organization', desc: 'All users in organization can view' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, visibility: opt.value })}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                      formData.visibility === opt.value
                        ? 'border-[#0D1F3D] bg-blue-50/40 ring-1 ring-[#0D1F3D]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={formData.visibility === opt.value}
                      onChange={() => {}}
                      className="mt-0.5 text-[#0D1F3D]"
                    />
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">{opt.title}</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/teams')}
                className="font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="sm"
                isLoading={isSubmitting}
                className="font-bold shadow-xs"
              >
                {isEditing ? 'Save Team' : 'Create Team'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Team Preview Card + Next Steps Guide */}
        <div className="space-y-6 lg:col-span-4">
          {/* Live Team Preview Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 text-center">
            <h3 className="text-base font-extrabold text-[#0D1F3D] text-left">Team Preview</h3>

            <div className="flex flex-col items-center pt-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 shadow-xs mb-3">
                <Users className="h-8 w-8" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-extrabold text-[#0D1F3D]">
                  {formData.name.trim() || 'Team Name'}
                </h4>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {formData.code.trim() || 'TBD'}
                </span>
              </div>
            </div>

            <div className="w-full space-y-2.5 border-t border-slate-100 pt-4 text-xs text-left font-semibold text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Team Leader</span>
                <span className="font-extrabold text-[#0D1F3D]">{options.candidates.find((candidate) => candidate.id === formData.leader)?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Department</span>
                <span className="font-bold text-slate-700">{formData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Region / Area</span>
                <span className="font-bold text-slate-700">{formData.region || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Team Type</span>
                <span className="font-bold text-slate-700">{formData.teamType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Monthly Target</span>
                <span className="font-extrabold text-[#0D1F3D]">
                  {formData.monthlyTarget ? `₹${Number(formData.monthlyTarget).toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Status</span>
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600">
                  {formData.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Members</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0D1F3D] text-[10px] font-extrabold text-white">
                  0
                </span>
              </div>
            </div>
          </div>

          {/* What Happens Next Guide */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">What happens next?</h3>

            <div className="space-y-3 text-xs">
              {[
                { num: 1, title: 'Team will be created', desc: 'A new team will be created with the details provided.' },
                { num: 2, title: 'Add Team Members', desc: 'You can add members to the team after creation.' },
                { num: 3, title: 'Assign Targets', desc: 'Set individual or team targets to track performance.' },
                { num: 4, title: 'Start Managing', desc: 'Begin assigning leads and tracking team performance.' },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-extrabold text-blue-600">
                    {step.num}
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">{step.title}</p>
                    <p className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 flex items-center gap-2 text-xs font-semibold text-blue-900">
              <Info className="h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>You can edit all team details later from the team settings.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
