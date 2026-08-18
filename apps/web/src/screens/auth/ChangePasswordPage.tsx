import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Shield,
  Key,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../common/api';
import { Button } from '../../components/ui/Button';

const rules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passedCount = useMemo(() => rules.filter((r) => r.test(newPassword)).length, [newPassword]);
  const isStrong = passedCount >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Page Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Change Password</h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-1">
          <span className="cursor-pointer hover:text-[#0D1F3D]" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-[#0D1F3D]" onClick={() => navigate('/admin/profile')}>My Profile</span>
          <span>&gt;</span>
          <span className="text-[#E20613] font-bold">Change Password</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Update Your Password Form (8 Cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm lg:col-span-8 space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-[#0D1F3D]">Update Your Password</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              For your security, please choose a strong password that you don't use for other accounts.
            </p>
          </div>

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              Your password has been changed successfully.
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#0D1F3D]">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-3 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#0D1F3D]">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-3 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Password Strength:</span>
                    <span className={`font-bold ${isStrong ? 'text-emerald-600' : 'text-[#E20613]'}`}>
                      {isStrong ? 'Strong' : 'Weak'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    <div className={`rounded-full ${passedCount >= 1 ? (isStrong ? 'bg-emerald-500' : 'bg-[#E20613]') : 'bg-slate-200'}`} />
                    <div className={`rounded-full ${passedCount >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <div className={`rounded-full ${passedCount >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <div className={`rounded-full ${passedCount >= 5 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Rules checklist container */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                {rules.map((rule) => {
                  const passed = newPassword ? rule.test(newPassword) : false;
                  return (
                    <div key={rule.label} className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${passed ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className={passed ? 'font-bold text-[#0D1F3D]' : 'text-slate-500'}>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#0D1F3D]">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 py-3 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                variant="accent"
                size="lg"
                isLoading={loading}
                className="flex items-center gap-2 font-bold px-6 py-2.5 shadow-md text-xs"
              >
                <Lock className="h-4 w-4" /> Update Password
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate('/admin/profile')}
                className="font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 px-6 py-2.5 text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Password Tips (4 Cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-4 space-y-6">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Password Tips</h3>

          <div className="space-y-6">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E20613] border border-red-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0D1F3D]">Use a strong password</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                  A strong password protects your account from unauthorized access.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 border-t border-slate-100 pt-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0D1F3D]">Don't reuse passwords</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                  Avoid using the same password across multiple websites or apps.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 border-t border-slate-100 pt-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0D1F3D]">Change regularly</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                  Update your password periodically to keep your account secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
