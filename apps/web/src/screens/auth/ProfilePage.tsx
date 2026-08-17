import React, { useRef, useState } from 'react';
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
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import { Button } from '../../components/ui/Button';
import { ImageCropperModal } from '../../components/ui/ImageCropperModal';
import { api } from '../../common/api';
import { getUserRoleLabel } from '@visiblo/shared';

export default function ProfilePage() {
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Image Cropper Modal States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>('');

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setSelectedImageSrc(objectUrl);
    setCropperOpen(true);
    // reset input value so selecting the same image triggers onChange
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user || !accessToken) return;

    try {
      setIsUploading(true);
      setCropperOpen(false);

      const formData = new FormData();
      formData.append('file', croppedBlob, 'profile-avatar.jpg');

      const res = await api.post('/auth/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedAvatarUrl = res.data.avatarUrl || res.data.user?.avatarUrl;
      if (updatedAvatarUrl) {
        dispatch(
          setCredentials({
            accessToken,
            user: { ...user, image: updatedAvatarUrl },
          }),
        );
      }
    } catch (err) {
      console.error('Failed to upload cropped avatar to AWS S3:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
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

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <span>Dashboard</span>
        <span>›</span>
        <span className="text-[#0B2E6B] font-bold">My Profile</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">My Profile</h1>
          <p className="text-xs font-medium text-slate-500">
            View and manage your personal information and account details.
          </p>
        </div>

        {/* Reusable Button component for Edit Profile */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="border-[#E20613] text-[#E20613] hover:bg-[#E20613] hover:text-white font-bold rounded-xl flex items-center gap-2"
        >
          <Edit className="h-3.5 w-3.5" />
          {isEditing ? 'Save Profile' : 'Edit Profile'}
        </Button>
      </div>

      {/* Main Content Row 1: Profile Avatar Card + Personal Information Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Profile Avatar Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-4">
          <div className="relative">
            {user?.image ? (
              <img
                src={user.image}
                alt="Profile Avatar"
                className="h-28 w-28 rounded-full object-cover shadow-md border-2 border-white"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-[#E20613] to-[#0D1F3D] text-3xl font-extrabold text-white shadow-md">
                {user?.fullName?.charAt(0) ?? user?.email?.charAt(0).toUpperCase() ?? 'A'}
              </div>
            )}

            {/* Reusable Button for Camera Icon */}
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
            {user?.fullName || 'Amit Sharma'}
          </h2>
          <span className="mt-1 rounded-full bg-red-500/10 px-3 py-0.5 text-xs font-bold text-[#E20613]">
            {getUserRoleLabel(user?.role || 'SUPER_ADMIN')}
          </span>

          <div className="mt-6 w-full space-y-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="truncate">{user?.email || 'amit.sharma@visibloai.com'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>Mumbai, Maharashtra, India</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>GMT +05:30 (India Standard Time)</span>
            </div>
          </div>
        </div>

        {/* Right Personal Information Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-8">
          <h3 className="mb-4 text-base font-extrabold text-[#0B2E6B]">Personal Information</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Full Name</label>
              <input
                type="text"
                readOnly={!isEditing}
                defaultValue={user?.fullName || 'Amit Sharma'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0B2E6B] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Employee ID</label>
              <input
                type="text"
                readOnly
                defaultValue={user?.employeeCode || 'VIS-ADM-001'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0B2E6B] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Email Address</label>
              <input
                type="text"
                readOnly
                defaultValue={user?.email || 'amit.sharma@visibloai.com'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0B2E6B] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Designation</label>
              <input
                type="text"
                readOnly={!isEditing}
                defaultValue="Super Administrator"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0B2E6B] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Phone Number</label>
              <input
                type="text"
                readOnly={!isEditing}
                defaultValue="+91 98765 43210"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0B2E6B] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Department</label>
              <input
                type="text"
                readOnly={!isEditing}
                defaultValue="Administration"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0B2E6B] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Date of Birth</label>
              <input
                type="text"
                readOnly={!isEditing}
                defaultValue="15 August 1990"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0B2E6B] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Address</label>
              <input
                type="text"
                readOnly={!isEditing}
                defaultValue="Andheri East, Mumbai, Maharashtra, India"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0B2E6B] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Row 2: Account & Security + Role & Permissions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Card: Account & Security */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-6">
          <h3 className="mb-4 text-base font-extrabold text-[#0B2E6B]">Account & Security</h3>
          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-2.5 text-slate-600">
                <UserCheck className="h-4 w-4 text-slate-400" /> Username
              </span>
              <span className="font-bold text-[#0B2E6B]">amit.sharma</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Lock className="h-4 w-4 text-slate-400" /> Password
              </span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-400">••••••••••</span>
                <a href="/admin/profile/security" className="font-bold text-blue-600 hover:underline">
                  Change
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Shield className="h-4 w-4 text-slate-400" /> Two-Factor Authentication
              </span>
              <div className="flex items-center gap-3">
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  Enabled
                </span>
                <a href="/admin/profile/security" className="font-bold text-blue-600 hover:underline">
                  Manage
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" /> Email Verified
              </span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                Verified
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Clock className="h-4 w-4 text-slate-400" /> Last Login
              </span>
              <span className="font-bold text-[#0B2E6B]">14 May 2025, 10:24 AM</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Globe className="h-4 w-4 text-slate-400" /> Login IP Address
              </span>
              <span className="font-bold text-[#0B2E6B]">103.21.45.67</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-slate-400" /> Account Status
              </span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Role & Permissions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-6">
          <h3 className="mb-4 text-base font-extrabold text-[#0B2E6B]">Role & Permissions</h3>
          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-2.5 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" /> Role
              </span>
              <span className="rounded bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-bold text-[#00C2A8]">
                {getUserRoleLabel(user?.role || 'SUPER_ADMIN')}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Key className="h-4 w-4 text-slate-400" /> Permissions
              </span>
              <span className="font-bold text-[#0B2E6B]">All Permissions</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Globe className="h-4 w-4 text-slate-400" /> Data Access Scope
              </span>
              <span className="font-bold text-[#0B2E6B]">All Territories & Teams</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Users className="h-4 w-4 text-slate-400" /> Team Access
              </span>
              <span className="font-bold text-[#0B2E6B]">All Teams</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-slate-600">
                <Clock className="h-4 w-4 text-slate-400" /> Last Permission Update
              </span>
              <div className="text-right">
                <p className="font-bold text-[#0B2E6B]">10 May 2025, 04:15 PM</p>
                <p className="text-[10px] text-slate-400">By Admin User</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Row 3: Recent Activity Horizontal Cards */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-extrabold text-[#0B2E6B]">Recent Activity</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { title: 'Login Successful', time: '14 May 2025, 10:24 AM', ip: 'IP: 103.21.45.67', icon: ArrowRight, bg: 'bg-emerald-50 text-emerald-600' },
            { title: 'Profile Updated', time: '10 May 2025, 04:15 PM', ip: 'IP: 103.21.45.67', icon: Edit, bg: 'bg-blue-50 text-blue-600' },
            { title: 'Password Changed', time: '02 May 2025, 11:30 AM', ip: 'IP: 103.21.45.67', icon: Lock, bg: 'bg-purple-50 text-purple-600' },
            { title: '2FA Enabled', time: '28 Apr 2025, 09:10 AM', ip: 'IP: 103.21.45.67', icon: Shield, bg: 'bg-amber-50 text-amber-600' },
            { title: 'Role Updated', time: '20 Apr 2025, 03:45 PM', ip: 'IP: 103.21.45.67', icon: Users, bg: 'bg-teal-50 text-[#00C2A8]' },
          ].map((act, i) => {
            const Icon = act.icon;
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${act.bg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="overflow-hidden space-y-0.5">
                  <p className="font-bold text-[#0B2E6B] text-xs truncate">{act.title}</p>
                  <p className="text-[10px] font-medium text-slate-400 truncate">{act.time}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{act.ip}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
