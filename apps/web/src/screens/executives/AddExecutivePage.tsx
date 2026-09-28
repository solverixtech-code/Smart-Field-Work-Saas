import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  UserPlus,
  User,
  Phone,
  Briefcase,
  Shield,
  Camera,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectOption } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { DatePicker } from '../../components/ui/DatePicker';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { Textarea } from '../../components/ui/Textarea';
import { api } from '../../common/api';

const DEFAULT_SHIFTS: SelectOption[] = [
  {
    value: 'General Shift (09:30 AM - 06:30 PM)',
    label: 'General Shift (09:30 AM - 06:30 PM)',
    sublabel: 'Mon - Sat • Grace 15 mins',
  },
  {
    value: 'Morning Shift (07:00 AM - 04:00 PM)',
    label: 'Morning Shift (07:00 AM - 04:00 PM)',
    sublabel: 'Mon - Sat • Grace 15 mins',
  },
  {
    value: 'Night Shift (10:00 PM - 07:00 AM)',
    label: 'Night Shift (10:00 PM - 07:00 AM)',
    sublabel: 'Mon - Fri • Grace 20 mins',
  },
  {
    value: 'Weekend Support (10:00 AM - 05:00 PM)',
    label: 'Weekend Support (10:00 AM - 05:00 PM)',
    sublabel: 'Sat - Sun • Grace 10 mins',
  },
];

const systemRoleOptions: SelectOption[] = [
  { value: 'FIELD_EXECUTIVE', label: 'Field Executive', sublabel: 'Route tracking, Client visits, Geofencing' },
  { value: 'TELECALLER', label: 'Telecaller / Inside Sales', sublabel: 'Outbound calling, Virtual demos' },
  { value: 'TEAM_LEADER', label: 'Team Leader', sublabel: 'Roster management, Team targets' },
  { value: 'SALES_MANAGER', label: 'Sales Manager', sublabel: 'Pipeline oversight & Revenue budgets' },
  { value: 'SUPPORT', label: 'Support / Operations', sublabel: 'Ticket resolution & Order sync' },
  { value: 'ADMIN', label: 'Administrator', sublabel: 'Full workspace access & System settings' },
];

const designationOptions: SelectOption[] = [
  { value: 'Field Executive', label: 'Field Executive' },
  { value: 'Senior Field Executive', label: 'Senior Field Executive' },
  { value: 'Telecaller', label: 'Telecaller' },
  { value: 'Team Leader', label: 'Team Leader' },
  { value: 'Sales Manager', label: 'Sales Manager' },
];

const reportingToOptions: SelectOption[] = [
  {
    value: 'Sanjay Yadav (TL-1003)',
    label: 'Sanjay Yadav',
    sublabel: 'Team Leader • Mumbai North (TL-1003)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    value: 'Amit Sharma (Manager)',
    label: 'Amit Sharma',
    sublabel: 'Sales Manager • Western Region (MGR-1001)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
  {
    value: 'Priya Mehta (TL-1004)',
    label: 'Priya Mehta',
    sublabel: 'Team Leader • Mumbai West (TL-1004)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    value: 'Vikram Patil (MGR-1002)',
    label: 'Vikram Patil',
    sublabel: 'Operations Manager • Central Hub (MGR-1002)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
];

const teamOptions: SelectOption[] = [
  { value: 'Mumbai North Team', label: 'Mumbai North Team', sublabel: 'North Region • 24 Staff' },
  { value: 'Mumbai West Team', label: 'Mumbai West Team', sublabel: 'West Region • 18 Staff' },
  { value: 'Thane Central', label: 'Thane Central', sublabel: 'Central Region • 14 Staff' },
  { value: 'Navi Mumbai Hub', label: 'Navi Mumbai Hub', sublabel: 'Navi Mumbai • 12 Staff' },
  { value: 'Pune Central', label: 'Pune Central', sublabel: 'Pune Hub • 10 Staff' },
];

const employmentTypeOptions: SelectOption[] = [
  { value: 'Full Time', label: 'Full Time' },
  { value: 'Part Time', label: 'Part Time' },
  { value: 'Contract', label: 'Contract' },
];

const genderOptions: SelectOption[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const regionOptions: SelectOption[] = [
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Thane', label: 'Thane' },
  { value: 'Navi Mumbai', label: 'Navi Mumbai' },
  { value: 'Pune', label: 'Pune' },
];

function generateRandomEmpId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `EMP-${num}`;
}

export default function AddExecutivePage() {
  const navigate = useNavigate();
  const [shiftOptions, setShiftOptions] = useState<SelectOption[]>(DEFAULT_SHIFTS);
  const [systemRoleOptionsState, setSystemRoleOptions] = useState<SelectOption[]>(systemRoleOptions);
  const [designationOptionsState, setDesignationOptions] = useState<SelectOption[]>(designationOptions);
  const [reportingToOptionsState, setReportingToOptions] = useState<SelectOption[]>(reportingToOptions);
  const [teamOptionsState, setTeamOptions] = useState<SelectOption[]>(teamOptions);
  const [regionOptionsState, setRegionOptions] = useState<SelectOption[]>(regionOptions);

  const [formData, setFormData] = useState({
    fullName: '',
    empId: generateRandomEmpId(),
    systemRole: 'FIELD_EXECUTIVE',
    designation: 'Field Executive',
    reportingTo: '',
    team: '',
    employmentType: 'Full Time',
    dob: '1996-05-15',
    gender: 'Male',
    mobile: '',
    altMobile: '',
    email: '',
    address: '',
    joinDate: new Date().toISOString().split('T')[0],
    experience: '',
    region: 'Mumbai',
    shiftTiming: 'General Shift (09:30 AM - 06:30 PM)',
    salary: '',
    mobileAccess: true,
    webAccess: true,
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Fetch real live backend options for Shifts, Teams, Reporting Managers, System Roles, and Regions
  useEffect(() => {
    const controller = new AbortController();

    // 1. Fetch real system shifts
    api.get('/shifts', { signal: controller.signal })
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          const fetchedShifts: SelectOption[] = data.map((s: any) => ({
            value: `${s.name} (${s.startTime} - ${s.endTime})`,
            label: `${s.name} (${s.startTime} - ${s.endTime})`,
            sublabel: `Code: ${s.code || s.id} • Grace: ${s.lateGraceMinutes || 15} mins`,
          }));
          setShiftOptions(fetchedShifts);
          setFormData((prev) => ({ ...prev, shiftTiming: fetchedShifts[0].value }));
        }
      })
      .catch(() => {});

    // 2. Fetch live teams options & manager candidates
    api.get('/tenant/crm/teams/options', { signal: controller.signal })
      .then(({ data }: any) => {
        if (!controller.signal.aborted && data) {
          if (Array.isArray(data.candidates) && data.candidates.length > 0) {
            const liveReporting: SelectOption[] = data.candidates.map((c: any) => ({
              value: `${c.name} (${c.employeeCode ?? 'EMP'})`,
              label: c.name,
              sublabel: `${c.designation ?? 'Team Lead'} • ${c.teamName ?? 'General'} (${c.employeeCode})`,
              avatar: c.avatarUrl || undefined,
            }));
            setReportingToOptions(liveReporting);
            setFormData((prev) => ({ ...prev, reportingTo: liveReporting[0].value }));
          }
          if (Array.isArray(data.regions) && data.regions.length > 0) {
            const liveRegions: SelectOption[] = data.regions.map((r: any) => ({
              value: r.name,
              label: r.name,
            }));
            setRegionOptions(liveRegions);
            setFormData((prev) => ({ ...prev, region: liveRegions[0].value }));
          }
        }
      })
      .catch(() => {});

    // 3. Fetch live teams list
    api.get('/tenant/crm/teams', { signal: controller.signal })
      .then(({ data }: any) => {
        if (!controller.signal.aborted) {
          const teamList = Array.isArray(data) ? data : data?.items;
          if (Array.isArray(teamList) && teamList.length > 0) {
            const liveTeams: SelectOption[] = teamList.map((t: any) => ({
              value: t.name,
              label: t.name,
              sublabel: `${t.region ?? 'All Regions'} • ${t.tenantMemberships?.length ?? 0} Staff`,
            }));
            setTeamOptions(liveTeams);
            setFormData((prev) => ({ ...prev, team: liveTeams[0].value }));
          }
        }
      })
      .catch(() => {});

    // 4. Fetch live tenant roles
    api.get('/tenant/roles', { signal: controller.signal })
      .then(({ data }: any) => {
        if (!controller.signal.aborted) {
          const rolesList = Array.isArray(data) ? data : data?.roles || data?.items;
          if (Array.isArray(rolesList) && rolesList.length > 0) {
            const liveRoles: SelectOption[] = rolesList.map((r: any) => ({
              value: r.code ?? r.name,
              label: r.name ?? r.code,
              sublabel: r.description ?? `Permissions Version ${r.permissionsVersion ?? 1}`,
            }));
            setSystemRoleOptions(liveRoles);
            const liveDesignations: SelectOption[] = rolesList.map((r: any) => ({
              value: r.name,
              label: r.name,
            }));
            setDesignationOptions(liveDesignations);
          }
        }
      })
      .catch(() => {});

    // 5. Auto-populate next sequential Employee ID based on total count
    api.get('/tenant/crm/executives', { signal: controller.signal, params: { limit: 1 } })
      .then(({ data }: any) => {
        if (!controller.signal.aborted && data && typeof data.total === 'number') {
          const nextSequentialId = `EMP-${1001 + data.total}`;
          setFormData((prev) => ({ ...prev, empId: nextSequentialId }));
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  const handleRegenerateEmpId = () => {
    const freshId = generateRandomEmpId();
    setFormData((prev) => ({ ...prev, empId: freshId }));
    toast.info(`Generated unique Employee ID: ${freshId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.mobile.trim() || !formData.email.trim()) {
      setError('Please fill in all mandatory fields (Full Name, Mobile, Email).');
      return;
    }
    setError('');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      navigate('/admin/executives');
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* Top Header CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/executives')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors mb-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Employee Directory
          </button>
          <h1 className="text-xl font-extrabold text-[#0D1F3D]">Create Employee / User</h1>
          <p className="text-xs text-slate-500 font-medium">
            Add a new staff member or user to your workspace, assign their role, team, and access permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/executives')}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
          >
            Cancel
          </Button>
          <Button type="submit" variant="accent" size="sm" className="flex items-center gap-2 font-bold shadow-sm">
            <UserPlus className="h-4 w-4" /> Create Employee / User
          </Button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {submitted && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-extrabold text-emerald-700 animate-in fade-in">
          ✓ New Employee / User created successfully! Redirecting...
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-extrabold text-rose-600 animate-in fade-in">
          {error}
        </div>
      )}

      {/* Form Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Personal, Contact, Work Info */}
        <div className="space-y-6 lg:col-span-8">
          {/* Personal Information */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Personal Information</h3>
            </div>

            {/* Photo Avatar Header Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50/80 p-4 border border-slate-200/60">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0D1F3D]/10 text-xl font-extrabold text-[#0D1F3D] border-2 border-slate-200 shadow-xs shrink-0">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'FE'}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#0D1F3D]">
                    {formData.fullName || 'New Employee Profile Photo'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Upload high-resolution profile photo for employee directory badge and avatar display.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" type="button" className="text-xs font-bold flex items-center gap-1.5 border-slate-200 bg-white">
                  <Camera className="h-3.5 w-3.5 text-[#E20613]" /> Upload Photo
                </Button>
                <span className="text-[10px] text-slate-400 font-medium">JPG, PNG (Max 2MB)</span>
              </div>
            </div>

            {/* Personal Fields Symmetrical Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs font-semibold pt-1">
              <div className="sm:col-span-2">
                <Input
                  label="Full Name *"
                  placeholder="e.g. Amit Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Employee ID *"
                value={formData.empId}
                onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                required
                rightIcon={
                  <button
                    type="button"
                    title="Auto-generate new unique ID"
                    onClick={handleRegenerateEmpId}
                    className="text-slate-400 hover:text-[#E20613] transition-colors p-0.5 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                }
              />

              <Select
                label="System Role *"
                searchable={true}
                options={systemRoleOptionsState}
                value={formData.systemRole}
                onChange={(e) => setFormData({ ...formData, systemRole: e.target.value })}
              />

              <Select
                label="Designation *"
                searchable={true}
                options={designationOptionsState}
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />

              <Select
                label="Reporting To *"
                searchable={true}
                options={reportingToOptionsState}
                value={formData.reportingTo}
                onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
              />

              <Select
                label="Team *"
                searchable={true}
                options={teamOptionsState}
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              />

              <Select
                label="Employment Type *"
                searchable={true}
                options={employmentTypeOptions}
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              />

              <DatePicker
                label="Date of Birth"
                value={formData.dob}
                onChange={(val) => setFormData({ ...formData, dob: val })}
              />

              <Select
                label="Gender"
                searchable={true}
                options={genderOptions}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Contact Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs font-semibold">
              <PhoneInput
                label="Mobile Number"
                required={true}
                value={formData.mobile}
                onChange={(val) => setFormData({ ...formData, mobile: val })}
              />
              <PhoneInput
                label="Alternate Mobile"
                value={formData.altMobile}
                onChange={(val) => setFormData({ ...formData, altMobile: val })}
              />
              <Input
                type="email"
                label="Email Address *"
                placeholder="executive@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <Textarea
              label="Complete Address"
              placeholder="Enter complete residential address, city, pin code..."
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* Work Information */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Work Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs font-semibold">
              <DatePicker
                label="Joining Date *"
                required={true}
                value={formData.joinDate}
                onChange={(val) => setFormData({ ...formData, joinDate: val })}
              />
              <Input
                type="number"
                allowLetters={false}
                label="Experience (years)"
                placeholder="e.g. 2.5"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
              <Select
                label="Work Region *"
                searchable={true}
                options={regionOptionsState}
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
              <Select
                label="Shift Timing *"
                searchable={true}
                options={shiftOptions}
                value={formData.shiftTiming}
                onChange={(e) => setFormData({ ...formData, shiftTiming: e.target.value })}
                leftIcon={<Clock className="h-3.5 w-3.5 text-[#E20613]" />}
              />
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  allowLetters={false}
                  label="Monthly Salary (₹ / month)"
                  placeholder="e.g. 35000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Permissions & Emergency Contacts */}
        <div className="space-y-6 lg:col-span-4">
          {/* Access Control */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Access Control</h3>
            </div>

            <div className="space-y-3 text-xs font-bold text-[#0D1F3D]">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <Checkbox
                  label="Mobile App Access"
                  checked={formData.mobileAccess}
                  onChange={(val) => setFormData({ ...formData, mobileAccess: val })}
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <Checkbox
                  label="Web Dashboard Access"
                  checked={formData.webAccess}
                  onChange={(val) => setFormData({ ...formData, webAccess: val })}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Emergency Contact</h3>
            <div className="space-y-3 text-xs font-semibold">
              <Input
                label="Contact Name"
                placeholder="e.g. Ramesh Sharma"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
              />
              <Input
                label="Relationship"
                placeholder="e.g. Father, Spouse"
                value={formData.emergencyRelation}
                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
              />
              <PhoneInput
                label="Phone Number"
                value={formData.emergencyPhone}
                onChange={(val) => setFormData({ ...formData, emergencyPhone: val })}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
