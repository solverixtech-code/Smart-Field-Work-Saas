import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  Shield,
} from 'lucide-react';
import { api } from '../../common/api';
import { Button } from '../../components/ui/Button';

const rules = [
  { label: 'Use at least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Include uppercase and lowercase letters', test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { label: 'Add at least one number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Include a special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  { label: 'Avoid using personal information', test: (p: string) => p.length > 0 },
  { label: 'Do not reuse old passwords', test: (p: string) => p.length > 0 },
];

function getStrength(password: string): { label: string; color: string; fillSegments: number } {
  const passed = rules.slice(0, 4).filter((r) => r.test(password)).length;
  if (!password) return { label: '', color: 'text-slate-400', fillSegments: 0 };
  if (passed <= 1) return { label: 'Weak', color: 'text-rose-500', fillSegments: 1 };
  if (passed === 2) return { label: 'Medium', color: 'text-amber-500', fillSegments: 2 };
  if (passed === 3) return { label: 'Good', color: 'text-blue-500', fillSegments: 3 };
  return { label: 'Strong', color: 'text-emerald-500', fillSegments: 4 };
}

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

  const strength = useMemo(() => getStrength(newPassword), [newPassword]);

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
    <div className="space-y-6 font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <span>Profile</span>
        <span>›</span>
        <span>Security</span>
        <span>›</span>
        <span className="text-[#0B2E6B] font-bold">Change Password</span>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B2E6B]">Change Password</h1>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Security Tips Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-4 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4 shadow-xs">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="text-base font-extrabold text-[#0B2E6B]">Keep Your Account Secure</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Create a strong password that you don't use on other websites.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-3">
            <p className="text-xs font-extrabold text-[#0B2E6B]">Password Tips</p>
            {rules.map((rule) => {
              const passed = newPassword ? rule.test(newPassword) : false;
              return (
                <div key={rule.label} className="flex items-center gap-2.5 text-xs font-medium">
                  <CheckCircle2
                    className={`h-4 w-4 flex-shrink-0 ${
                      passed ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                  />
                  <span className={passed ? 'font-semibold text-slate-700' : 'text-slate-500'}>
                    {rule.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Info Container */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <Info className="h-4 w-4 text-blue-600" />
              <span>Your security is important to us</span>
            </div>
            <p className="text-[11px] font-medium text-slate-600 pl-6">
              Your password is encrypted and stored securely.
            </p>
          </div>
        </div>

        {/* Right Column: Change Password Form */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-8">
          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              Your password has been changed successfully.
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#0B2E6B]">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-xs font-semibold text-[#0B2E6B] placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#0B2E6B]">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-xs font-semibold text-[#0B2E6B] placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-500">Password Strength</span>
                  <span className={`font-bold ${strength.color}`}>{strength.label || 'Medium'}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className={`h-2 rounded-full transition-all ${
                        seg <= strength.fillSegments
                          ? strength.fillSegments <= 1
                            ? 'bg-rose-500'
                            : strength.fillSegments === 2
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#0B2E6B]">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-xs font-semibold text-[#0B2E6B] placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Soft Green Info Notice Box */}
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs font-semibold text-emerald-800">
              <Shield className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span>Make sure your new password is different from previous passwords.</span>
            </div>

            {/* Action Buttons using reusable Button component */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="rounded-xl px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
              >
                {!loading && <Lock className="h-4 w-4" />} Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="flex flex-col items-center gap-2 pt-6 text-center text-xs font-semibold text-slate-400 border-t border-slate-100">
        <div className="flex items-center gap-2 text-slate-500">
          <Shield className="h-4 w-4 text-slate-400" />
          <span>For your security, you may be logged out from all other devices after changing your password.</span>
        </div>
        <p className="text-[11px] text-slate-400">© 2025 VisibloAI. All rights reserved.</p>
      </div>
    </div>
  );
}
