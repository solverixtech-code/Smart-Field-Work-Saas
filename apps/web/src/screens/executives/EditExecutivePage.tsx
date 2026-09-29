import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Briefcase,
  Shield,
  Camera,
  Clock,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectOption } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { DatePicker } from '../../components/ui/DatePicker';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { Textarea } from '../../components/ui/Textarea';
import { ImageCropperModal } from '../../components/ui/ImageCropperModal';
import { Card } from '../../components/ui/Card';
import { api } from '../../common/api';

const DEFAULT_SHIFTS: SelectOption[] = [
  {
    value: 'Flexible / Not Applicable',
    label: 'Flexible / Not Applicable',
    sublabel: 'No shift tracking or late penalties applied',
  },
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

const defaultSystemRoleOptions: SelectOption[] = [
  { value: 'FIELD_EXECUTIVE', label: 'Field Executive', sublabel: 'Route tracking, Client visits, Geofencing' },
  { value: 'TELECALLER', label: 'Telecaller / Inside Sales', sublabel: 'Outbound calling, Virtual demos' },
  { value: 'TEAM_LEADER', label: 'Team Leader', sublabel: 'Roster management, Team targets' },
  { value: 'SALES_MANAGER', label: 'Sales Manager', sublabel: 'Pipeline oversight & Revenue budgets' },
  { value: 'SUPPORT', label: 'Support / Operations', sublabel: 'Ticket resolution & Order sync' },
  { value: 'ADMIN', label: 'Administrator', sublabel: 'Full workspace access & System settings' },
];

const defaultDesignationOptions: SelectOption[] = [
  { value: 'Field Executive', label: 'Field Executive' },
  { value: 'Senior Field Executive', label: 'Senior Field Executive' },
  { value: 'Telecaller', label: 'Telecaller' },
  { value: 'Team Leader', label: 'Team Leader' },
  { value: 'Sales Manager', label: 'Sales Manager' },
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

const defaultRegionOptions: SelectOption[] = [
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Thane', label: 'Thane' },
  { value: 'Navi Mumbai', label: 'Navi Mumbai' },
  { value: 'Pune', label: 'Pune' },
];

function generateRandomEmpId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `EMP-${num}`;
}

export default function EditExecutivePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Image Cropper Modal State
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [shiftOptions, setShiftOptions] = useState<SelectOption[]>(DEFAULT_SHIFTS);
  const [systemRoleOptionsState, setSystemRoleOptions] = useState<SelectOption[]>(defaultSystemRoleOptions);
  const [designationOptionsState, setDesignationOptions] = useState<SelectOption[]>(defaultDesignationOptions);
  const [reportingToOptionsState, setReportingToOptions] = useState<SelectOption[]>([]);
  const [teamOptionsState, setTeamOptions] = useState<SelectOption[]>([]);
  const [regionOptionsState, setRegionOptions] = useState<SelectOption[]>(defaultRegionOptions);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    empId: '',
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRawImageSrc(url);
      setIsCropModalOpen(true);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      setIsCropModalOpen(false);
      toast.success('✓ Profile photo cropped & updated!');
    };
    reader.readAsDataURL(croppedBlob);
  };

  // 1. Fetch Executive data and all options on mount
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError('');

    // Fetch existing employee details
    const fetchExecutive = api.get(`/tenant/crm/executives/${encodeURIComponent(id)}`, {
      signal: controller.signal,
    });

    // Fetch live shifts
    const fetchShifts = api.get('/shifts', { signal: controller.signal }).catch(() => null);

    // Fetch live teams options & manager candidates
    const fetchTeamOptions = api.get('/tenant/crm/teams/options', { signal: controller.signal }).catch(() => null);

    // Fetch live executives for candidate pool
    const fetchExecutives = api.get('/tenant/crm/executives', {
      signal: controller.signal,
      params: { limit: 100 },
    }).catch(() => null);

    // Fetch live teams
    const fetchTeams = api.get('/tenant/crm/teams', { signal: controller.signal }).catch(() => null);

    // Fetch live roles
    const fetchRoles = api.get('/tenant/roles', { signal: controller.signal }).catch(() => null);

    Promise.all([
      fetchExecutive,
      fetchShifts,
      fetchTeamOptions,
      fetchExecutives,
      fetchTeams,
      fetchRoles,
    ])
      .then(([execRes, shiftsRes, teamOptRes, execListRes, teamsRes, rolesRes]) => {
        if (controller.signal.aborted) return;

        // Process options first
        if (shiftsRes?.data && Array.isArray(shiftsRes.data) && shiftsRes.data.length > 0) {
          const liveShifts: SelectOption[] = shiftsRes.data.map((s: any) => ({
            value: `${s.name} (${s.startTime} - ${s.endTime})`,
            label: `${s.name} (${s.startTime} - ${s.endTime})`,
            sublabel: `Code: ${s.code || s.id} • Grace: ${s.lateGraceMinutes || 15} mins`,
          }));
          setShiftOptions(liveShifts);
        }

        const candidatePool: any[] = [];
        if (teamOptRes?.data) {
          if (Array.isArray(teamOptRes.data.candidates)) {
            candidatePool.push(...teamOptRes.data.candidates);
          }
          if (Array.isArray(teamOptRes.data.regions) && teamOptRes.data.regions.length > 0) {
            const liveRegions: SelectOption[] = teamOptRes.data.regions.map((r: any) => ({
              value: r.name,
              label: r.name,
            }));
            setRegionOptions(liveRegions);
          }
        }

        if (execListRes?.data?.items && Array.isArray(execListRes.data.items)) {
          const mappedItems = execListRes.data.items
            .filter((m: any) => m.id !== id && m.membershipId !== id) // exclude self
            .map((m: any) => ({
              id: m.id,
              name: m.name,
              employeeCode: m.employeeCode,
              designation: m.role || m.roleName || m.designation,
              roleName: m.roleName,
              teamName: m.team,
              avatarUrl: m.avatarUrl,
            }));
          candidatePool.push(...mappedItems);
        }

        // Deduplicate candidates
        const existingIds = new Set<string>();
        const uniqueCandidates = candidatePool.filter((c) => {
          const key = c.id || c.employeeCode;
          if (!key || existingIds.has(key)) return false;
          existingIds.add(key);
          return true;
        });
        setAllCandidates(uniqueCandidates);

        if (teamsRes?.data) {
          const teamList = Array.isArray(teamsRes.data) ? teamsRes.data : teamsRes.data?.items;
          if (Array.isArray(teamList) && teamList.length > 0) {
            const liveTeams: SelectOption[] = teamList.map((t: any) => ({
              value: t.name,
              label: t.name,
              sublabel: `${t.region ?? 'All Regions'} • ${t.tenantMemberships?.length ?? 0} Staff`,
            }));
            setTeamOptions(liveTeams);
          }
        }

        if (rolesRes?.data) {
          const rolesList = Array.isArray(rolesRes.data) ? rolesRes.data : rolesRes.data?.roles || rolesRes.data?.items;
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

        // Populate executive form data
        const d = execRes.data;
        if (d) {
          setFormData({
            fullName: d.fullName || '',
            empId: d.empId || '',
            systemRole: d.systemRole || 'FIELD_EXECUTIVE',
            designation: d.designation || 'Field Executive',
            reportingTo: d.reportingTo || '',
            team: d.team || '',
            employmentType: d.employmentType || 'Full Time',
            dob: d.dob || '1996-05-15',
            gender: d.gender || 'Male',
            mobile: d.mobile || '',
            altMobile: d.altMobile || '',
            email: d.email || '',
            address: d.address || '',
            joinDate: d.joinDate || new Date().toISOString().split('T')[0],
            experience: d.experience || '',
            region: d.region || 'Mumbai',
            shiftTiming: d.shiftTiming || 'General Shift (09:30 AM - 06:30 PM)',
            salary: d.salary || '',
            mobileAccess: d.mobileAccess ?? true,
            webAccess: d.webAccess ?? true,
            emergencyName: d.emergencyName || '',
            emergencyRelation: d.emergencyRelation || '',
            emergencyPhone: d.emergencyPhone || '',
          });

          if (d.avatarUrl) {
            setAvatarPreview(d.avatarUrl);
          }
        }

        setIsLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error('Failed to load executive:', err);
        setLoadError(
          err?.response?.data?.message ||
            'Could not load employee details. Please make sure the employee exists and try again.'
        );
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, retryCount]);

  // Dynamically filter Reporting To dropdown based on selected employee role hierarchy
  useEffect(() => {
    const roleLower = (formData.systemRole || '').toLowerCase();
    const desigLower = (formData.designation || '').toLowerCase();

    const isSalesManager =
      roleLower.includes('sales_manager') ||
      desigLower.includes('sales manager') ||
      (desigLower.includes('manager') && !desigLower.includes('team'));
    const isTeamLeader =
      roleLower.includes('team_leader') ||
      desigLower.includes('team leader') ||
      desigLower.includes('lead');

    let filtered: any[] = [];

    if (isSalesManager) {
      filtered = allCandidates.filter((c: any) => {
        const d = (c.designation || '').toLowerCase();
        const r = (c.role || c.roleName || '').toLowerCase();
        return (
          d.includes('admin') ||
          d.includes('owner') ||
          d.includes('supervisor') ||
          d.includes('director') ||
          d.includes('regional') ||
          d.includes('head') ||
          r.includes('admin') ||
          r.includes('owner') ||
          r.includes('supervisor') ||
          r.includes('director') ||
          r.includes('regional')
        );
      });
      if (filtered.length === 0) {
        filtered = allCandidates.filter((c: any) => {
          const d = (c.designation || '').toLowerCase();
          return (
            !d.includes('field executive') &&
            !d.includes('telecaller') &&
            !d.includes('sales manager')
          );
        });
      }
    } else if (isTeamLeader) {
      filtered = allCandidates.filter((c: any) => {
        const d = (c.designation || '').toLowerCase();
        const r = (c.role || c.roleName || '').toLowerCase();
        return (
          d.includes('manager') ||
          d.includes('admin') ||
          d.includes('supervisor') ||
          d.includes('director') ||
          d.includes('owner') ||
          r.includes('manager') ||
          r.includes('admin') ||
          r.includes('supervisor') ||
          r.includes('director')
        );
      });
    } else {
      filtered = allCandidates.filter((c: any) => {
        const d = (c.designation || '').toLowerCase();
        const r = (c.role || c.roleName || '').toLowerCase();
        return (
          d.includes('manager') ||
          d.includes('lead') ||
          d.includes('admin') ||
          d.includes('supervisor') ||
          d.includes('head') ||
          r.includes('manager') ||
          r.includes('lead') ||
          r.includes('admin') ||
          r.includes('supervisor')
        );
      });
    }

    if (filtered.length > 0) {
      const options: SelectOption[] = filtered.map((c: any) => ({
        value: `${c.name} (${c.employeeCode ?? 'EMP'})`,
        label: c.name,
        sublabel: `${c.designation ?? c.roleName ?? 'Reporting Officer'} • ${c.teamName ?? c.team ?? 'General'} (${c.employeeCode ?? 'EMP'})`,
        avatar: c.avatarUrl || undefined,
      }));
      setReportingToOptions(options);
    } else {
      setReportingToOptions([]);
    }
  }, [formData.systemRole, formData.designation, allCandidates]);

  const handleRegenerateEmpId = () => {
    const freshId = generateRandomEmpId();
    setFormData((prev) => ({ ...prev, empId: freshId }));
    toast.info(`Updated Employee ID: ${freshId}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.mobile.trim() || !formData.email.trim()) {
      setError('Please fill in all mandatory fields (Full Name, Mobile, Email).');
      toast.error('Please fill in all mandatory fields (Full Name, Mobile, Email).');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        ...formData,
        avatar: avatarPreview,
      };

      await api.put(`/tenant/crm/executives/${encodeURIComponent(id || '')}`, payload);
      setSubmitted(true);
      toast.success(`✓ Employee "${formData.fullName}" updated successfully!`);
      setTimeout(() => {
        navigate(`/admin/executives/${id}`);
      }, 900);
    } catch (err: any) {
      console.error('Failed to update employee:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save employee changes. Please check the details and try again.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 font-sans">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Card variant="panel" role="status" className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-[#E20613]" />
          <p className="text-xs font-bold text-slate-600">Loading employee details...</p>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6 font-sans">
        <button
          type="button"
          onClick={() => navigate('/admin/executives')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Employee Directory
        </button>
        <Card variant="panel" role="alert" className="p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-base font-extrabold text-[#0D1F3D]">Employee Profile Not Available</h2>
          <p className="text-xs font-medium text-slate-500 max-w-md mx-auto">{loadError}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/executives')} className="font-bold">
              Return to Directory
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => setRetryCount((c) => c + 1)}
              className="font-bold shadow-xs"
            >
              Retry Loading
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      {/* Top Header CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/admin/executives/${id}`)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors mb-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </button>
          <h1 className="text-xl font-extrabold text-[#0D1F3D]">Edit Employee / User</h1>
          <p className="text-xs text-slate-500 font-medium">
            Update employee details, role, reporting manager, shift timings, and workspace permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={submitting}
            onClick={() => navigate(`/admin/executives/${id}`)}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            size="sm"
            disabled={submitting}
            className="flex items-center gap-2 font-bold shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {submitted && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-extrabold text-emerald-700 animate-in fade-in">
          ✓ Employee details saved successfully! Redirecting...
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

            {/* Hidden Photo File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Photo Avatar Header Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50/80 p-4 border border-slate-200/60">
              <div className="flex items-center gap-3.5">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Employee Avatar"
                    className="h-14 w-14 rounded-full object-cover border-2 border-[#0D1F3D] shadow-xs shrink-0"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0D1F3D]/10 text-xl font-extrabold text-[#0D1F3D] border-2 border-slate-200 shadow-xs shrink-0">
                    {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'FE'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-extrabold text-[#0D1F3D]">
                    {formData.fullName || 'Employee Profile Photo'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {avatarPreview ? 'Custom profile photo loaded' : 'Upload high-resolution profile photo for employee directory badge.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold flex items-center gap-1.5 border-slate-200 bg-white hover:border-[#E20613] hover:text-[#E20613] transition-colors cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5 text-[#E20613]" /> {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
                <span className="text-[10px] text-slate-400 font-medium">Auto-compressed • JPG, PNG, WEBP</span>
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
                label="Reporting To"
                searchable={true}
                options={reportingToOptionsState}
                value={formData.reportingTo}
                onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
              />

              <Select
                label="Team"
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
                label={
                  (formData.systemRole || '').toLowerCase().includes('admin') ||
                  (formData.designation || '').toLowerCase().includes('admin') ||
                  (formData.designation || '').toLowerCase().includes('owner')
                    ? 'Shift Timing (Optional)'
                    : 'Shift Timing *'
                }
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
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Emergency Contact</h3>
            </div>
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

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={submitting}
          onClick={() => navigate(`/admin/executives/${id}`)}
          className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="accent"
          size="sm"
          disabled={submitting}
          className="flex items-center gap-2 font-bold shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropModalOpen}
        imageUrl={rawImageSrc || ''}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        title="Crop & Frame Profile Photo"
        subtitle="Drag photo to adjust position, zoom or rotate to frame employee face inside the circle."
        defaultAspectType="circle"
      />
    </form>
  );
}
