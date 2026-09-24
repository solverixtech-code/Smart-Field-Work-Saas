import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Camera,
  Edit,
  Lock,
  Shield,
  CheckCircle2,
  Key,
  Globe,
  Users,
  ArrowRight,
  UserCheck,
  Building2,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import { Button } from '../../components/ui/Button';
import { DatePicker } from '../../components/ui/DatePicker';
import { ImageCropperModal } from '../../components/ui/ImageCropperModal';
import { api, extractErrorMessage } from '../../common/api';
import { getUserRoleLabel } from '@visiblo/shared';

interface ProfileActivity {
  id: string;
  action: string;
  createdAt: string;
  ip: string | null;
}

interface Profile {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  mobile: string | null;
  dateOfBirth: string | null;
  officeAddress: string | null;
  designation: string | null;
  department: string | null;
  role: string;
  roleCode: string;
  roleName: string;
  dataScope: string | null;
  teamName: string | null;
  avatarUrl: string | null;
  status: string;
  joinedAt: string;
  lastLoginAt: string | null;
  lastPasswordChangeAt: string | null;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  username: string;
  timezone: string;
  loginIp: string | null;
  permissionsCount: number;
  teamAccess: string | null;
  lastPermissionUpdateAt: string | null;
  lastPermissionUpdatedBy: string;
  canEditDesignation: boolean;
  recentActivity: ProfileActivity[];
}

interface ProfileDraft {
  fullName: string;
  mobile: string;
  designation: string;
  dateOfBirth: string;
  officeAddress: string;
}

const emptyDraft: ProfileDraft = {
  fullName: '',
  mobile: '',
  designation: '',
  dateOfBirth: '',
  officeAddress: '',
};

function formatDateTime(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : 'Not recorded';
}

function formatTimezone(timezone: string) {
  try {
    const now = new Date();
    const name = new Intl.DateTimeFormat('en-IN', { timeZone: timezone, timeZoneName: 'long' })
      .formatToParts(now).find((part) => part.type === 'timeZoneName')?.value;
    const offset = new Intl.DateTimeFormat('en-IN', { timeZone: timezone, timeZoneName: 'longOffset' })
      .formatToParts(now).find((part) => part.type === 'timeZoneName')?.value;
    return `${offset ?? timezone}${name && name !== offset ? ` (${name})` : ''}`;
  } catch {
    return timezone;
  }
}

function formatScope(value: string | null) {
  return value
    ? value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'Not assigned';
}

const activityPresentation = {
  LOGIN_SUCCESS: { title: 'Login Successful', icon: ArrowRight, bg: 'bg-emerald-50 text-emerald-600' },
  PROFILE_UPDATED: { title: 'Profile Updated', icon: Edit, bg: 'bg-blue-50 text-blue-600' },
  AVATAR_UPLOADED: { title: 'Profile Photo Updated', icon: Camera, bg: 'bg-blue-50 text-blue-600' },
  PASSWORD_CHANGED: { title: 'Password Changed', icon: Lock, bg: 'bg-purple-50 text-purple-600' },
  PASSWORD_RESET: { title: 'Password Reset', icon: Lock, bg: 'bg-purple-50 text-purple-600' },
  OTP_REQUESTED: { title: '2FA Verification', icon: Shield, bg: 'bg-amber-50 text-amber-600' },
  MEMBERSHIP_SELECTED: { title: 'Workspace Switched', icon: Users, bg: 'bg-slate-100 text-[#0D1F3D]' },
} as const;

export default function ProfilePage() {
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Image Cropper Modal States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>('');
  const profileBasePath = location.pathname.startsWith('/platform')
    ? '/platform/profile'
    : '/admin/profile';

  const applyProfile = (nextProfile: Profile) => {
    setProfile(nextProfile);
    setDraft({
      fullName: nextProfile.fullName,
      mobile: nextProfile.mobile ?? '',
      designation: nextProfile.designation ?? '',
      dateOfBirth: nextProfile.dateOfBirth ?? '',
      officeAddress: nextProfile.officeAddress ?? '',
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    api.get<Profile>('/auth/me', { signal: controller.signal })
      .then(({ data }) => applyProfile(data))
      .catch((error) => {
        if (!controller.signal.aborted)
          toast.error(extractErrorMessage(error, 'Failed to load your profile'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setSelectedImageSrc(objectUrl);
    setCropperOpen(true);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user || !accessToken) return;

    try {
      setIsUploading(true);
      setCropperOpen(false);

      const formData = new FormData();
      formData.append('file', croppedBlob, 'profile-avatar.jpg');

      const res = await api.post<{ avatarUrl: string; user: Profile }>('/auth/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedAvatarUrl = res.data.avatarUrl || res.data.user?.avatarUrl;
      if (res.data.user) applyProfile(res.data.user);
      if (updatedAvatarUrl) {
        dispatch(
          setCredentials({
            accessToken,
            user: { ...user, image: updatedAvatarUrl },
          }),
        );
      }
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to update profile photo'));
    } finally {
      setIsUploading(false);
    }
  };

  const updateDraft = (field: keyof ProfileDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    if (!profile || !accessToken || !user || isSaving) return;
    try {
      setIsSaving(true);
      const { data } = await api.patch<Profile>('/auth/me', {
        fullName: draft.fullName.trim(),
        mobile: draft.mobile.trim() || null,
        dateOfBirth: draft.dateOfBirth || null,
        officeAddress: draft.officeAddress.trim() || null,
        ...(profile.canEditDesignation
          ? { designation: draft.designation.trim() || null }
          : {}),
      });
      applyProfile(data);
      dispatch(setCredentials({
        accessToken,
        user: { ...user, fullName: data.fullName, image: data.avatarUrl },
      }));
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to update your profile'));
    } finally {
      setIsSaving(false);
    }
  };

  const avatarUrl = profile?.avatarUrl ?? user?.image ?? null;
  const displayName = profile?.fullName ?? user?.fullName ?? 'User';
  const roleLabel = profile?.roleName ?? getUserRoleLabel(user?.role);

  return (
    <div className="space-y-3 font-sans">
      {/* Hidden File Input for Image Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Image Cropper Modal Component */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageUrl={selectedImageSrc}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
        title="Crop & Frame Profile Photo"
      />

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#0D1F3D]">My Profile</h1>
          <p className="text-xs font-medium text-slate-500">
            View and manage your personal credentials, contact details, and account security.
          </p>
        </div>

        <Button
          variant={isEditing ? 'accent' : 'outline'}
          size="sm"
          onClick={handleEdit}
          isLoading={isSaving}
          disabled={isLoading}
          className="font-bold flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      {/* Main Content Row 1: Profile Avatar Card + Personal Information Form */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 items-stretch">
        {/* Left Profile Avatar Card */}
        <div className="flex flex-col items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-4 h-full">
          <div className="flex flex-col items-center w-full">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="h-28 w-28 rounded-full object-cover shadow-md border-2 border-white"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-[#E20613] to-[#0D1F3D] text-3xl font-extrabold text-white shadow-md">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                isLoading={isUploading}
                onClick={handleCameraClick}
                title="Upload & Crop Photo"
                className="absolute bottom-0 right-0 !p-2 !h-9 !w-9 !rounded-full border-2 border-white bg-[#0D1F3D] text-white shadow hover:bg-[#122b54] flex items-center justify-center"
              >
                {!isUploading && <Camera className="h-4 w-4" />}
              </Button>
            </div>

            <h2 className="mt-4 text-lg font-extrabold text-[#0D1F3D]">
              {displayName}
            </h2>
            <span className="mt-1 rounded-full bg-red-500/10 px-3 py-0.5 text-xs font-extrabold text-[#E20613]">
              {roleLabel}
            </span>
          </div>

          <div className="mt-6 w-full space-y-3.5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{profile?.email ?? user?.email ?? 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{profile?.mobile || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{profile?.officeAddress || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{profile ? formatTimezone(profile.timezone) : 'Not recorded'}</span>
            </div>
          </div>
        </div>

        {/* Right Personal Information Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-8 flex flex-col justify-between h-full">
          <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">Personal Information</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Full Name</label>
              <input
                type="text"
                readOnly={!isEditing}
                value={draft.fullName}
                onChange={(event) => updateDraft('fullName', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:outline-none focus:border-[#0D1F3D]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Employee ID</label>
              <input
                type="text"
                readOnly
                value={profile?.employeeCode ?? user?.employeeCode ?? ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 py-2.5 font-bold text-slate-500 focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Email Address</label>
              <input
                type="text"
                readOnly
                value={profile?.email ?? user?.email ?? ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 py-2.5 font-bold text-slate-500 focus:outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Designation</label>
              <input
                type="text"
                readOnly={!isEditing || !profile?.canEditDesignation}
                value={draft.designation}
                onChange={(event) => updateDraft('designation', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:outline-none focus:border-[#0D1F3D]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Phone Number</label>
              <input
                type="text"
                readOnly={!isEditing}
                value={draft.mobile}
                onChange={(event) => updateDraft('mobile', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:outline-none focus:border-[#0D1F3D]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="profile-date-of-birth" className="font-bold text-slate-700 block">Date of Birth</label>
              <DatePicker
                id="profile-date-of-birth"
                value={draft.dateOfBirth}
                onChange={(value) => updateDraft('dateOfBirth', value)}
                disabled={!isEditing}
                triggerClassName="rounded-xl bg-slate-50/60 px-3.5 py-2.5"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700 block">Office Address</label>
              <input
                type="text"
                readOnly={!isEditing}
                value={draft.officeAddress}
                onChange={(event) => updateDraft('officeAddress', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:outline-none focus:border-[#0D1F3D]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Row 2: Account & Security + Role & Permissions */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 items-stretch">
        {/* Left Card: Account & Security */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-6 flex flex-col justify-between h-full">
          <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">Account & Security</h3>
          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2.5 text-slate-600">
                <UserCheck className="h-4 w-4 text-slate-400 shrink-0" /> Username
              </span>
              <span className="font-extrabold text-[#0D1F3D]">{profile?.username ?? 'Not recorded'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Lock className="h-4 w-4 text-slate-400 shrink-0" /> Password
              </span>
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-400">••••••••••</span>
                <Link to={`${profileBasePath}/security`} className="font-bold text-blue-600 hover:underline">
                  Change
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Shield className="h-4 w-4 text-slate-400 shrink-0" /> Two-Factor Authentication
              </span>
              <div className="flex items-center gap-3">
                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-extrabold ${profile?.twoFactorEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                  {profile?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <Link to={`${profileBasePath}/security`} className="font-bold text-blue-600 hover:underline">
                  Manage
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" /> Email Verification
              </span>
              <span className={`rounded-md border px-2 py-0.5 text-[11px] font-extrabold ${profile?.emailVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                {profile?.emailVerified ? 'Verified' : 'Not verified'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" /> Last Active Login
              </span>
              <span className="font-extrabold text-[#0D1F3D]">{formatDateTime(profile?.lastLoginAt ?? null)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Globe className="h-4 w-4 text-slate-400 shrink-0" /> Login IP Address
              </span>
              <span className="font-extrabold text-[#0D1F3D]">{profile?.loginIp ?? 'Not recorded'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0" /> Account Status
              </span>
              <span className={`rounded-md border px-2 py-0.5 text-[11px] font-extrabold ${profile?.status === 'ACTIVE' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                {profile?.status ? getUserRoleLabel(profile.status) : 'Not recorded'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Role & Permissions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-6 flex flex-col justify-between h-full">
          <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">Role & Permissions</h3>
          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2.5 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" /> Administrative Role
              </span>
              <span className="rounded-md bg-red-50 border border-red-200 px-2.5 py-0.5 text-[11px] font-extrabold text-[#E20613]">
                {roleLabel}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Key className="h-4 w-4 text-slate-400 shrink-0" /> System Permissions
              </span>
              <span className="font-extrabold text-[#0D1F3D]">
                {profile ? `${profile.permissionsCount} permissions granted` : 'Not recorded'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Globe className="h-4 w-4 text-slate-400 shrink-0" /> Data Access Scope
              </span>
              <span className="font-extrabold text-[#0D1F3D]">{formatScope(profile?.dataScope ?? null)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Users className="h-4 w-4 text-slate-400 shrink-0" /> Team Access
              </span>
              <span className="font-extrabold text-[#0D1F3D]">{profile?.teamAccess ?? 'No team assigned'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" /> Last Permission Update
              </span>
              <div className="text-right">
                <p className="font-extrabold text-[#0D1F3D]">{formatDateTime(profile?.lastPermissionUpdateAt ?? null)}</p>
                <p className="text-[10px] text-slate-400 font-medium">By {profile?.lastPermissionUpdatedBy ?? 'System Security'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Row 3: Recent Activity Horizontal Cards */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">Recent Profile Activity</h3>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {(profile?.recentActivity ?? []).map((activity) => {
            const presentation = activityPresentation[activity.action as keyof typeof activityPresentation] ?? {
              title: getUserRoleLabel(activity.action),
              icon: CheckCircle2,
              bg: 'bg-slate-100 text-[#0D1F3D]',
            };
            const Icon = presentation.icon;
            return (
              <div key={activity.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${presentation.bg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="overflow-hidden space-y-0.5">
                  <p className="font-extrabold text-[#0D1F3D] text-xs truncate">{presentation.title}</p>
                  <p className="text-[10px] font-medium text-slate-400 truncate">{formatDateTime(activity.createdAt)}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{activity.ip ? `IP: ${activity.ip}` : 'IP not recorded'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
