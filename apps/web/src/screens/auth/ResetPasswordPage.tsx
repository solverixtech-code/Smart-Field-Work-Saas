import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { api } from '../../common/api';
import AuthLayout from '../../layouts/AuthLayout';
import { Button, Card, Input } from '../../components/ui';

const rules = [
  { label: 'At least 8 characters long', test: (p: string) => p.length >= 8 },
  { label: 'Include uppercase and lowercase letters', test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { label: 'Include a number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Include a special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password: string): { label: string; color: string; percent: number } {
  const passed = rules.filter((r) => r.test(password)).length;
  if (passed <= 1) return { label: 'Weak', color: 'text-rose-500', percent: 25 };
  if (passed === 2) return { label: 'Fair', color: 'text-amber-500', percent: 50 };
  if (passed === 3) return { label: 'Medium', color: 'text-[#0D1F3D]', percent: 75 };
  return { label: 'Strong', color: 'text-emerald-500', percent: 100 };
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getStrength(newPassword), [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword, confirmPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <Card size="lg">
          <div>
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#E20613]" />
            <h2 className="mb-2 text-center text-2xl font-extrabold text-[#0D1F3D]">Password Reset!</h2>
            <p className="mb-6 text-center text-xs font-medium text-slate-500">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <Link to="/admin/login" className="block">
              <Button variant="primary" size="lg" fullWidth>
                Back to Login
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-center text-xs font-medium text-slate-400">
            © {new Date().getFullYear()} Smart Field Work (SFW). All rights reserved.
          </p>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card size="lg">
        <div>
          {/* SFW Brand Logo */}
          <div className="mb-6 flex justify-center">
            <img
              src="/assets/sfw-logo.png"
              alt="Smart Field Work Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          <h2 className="text-center text-3xl font-extrabold text-[#0D1F3D]">Reset Password</h2>
          <p className="mt-1.5 text-center text-xs font-medium text-slate-500">
            Enter your new password below. Make sure it's strong and secure.
          </p>

          {/* Reserved Fixed-Height Alert Slot */}
          <div className="mt-4 flex h-12 items-center justify-center">
            {error ? (
              <div className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 text-center animate-in fade-in duration-150">
                {error}
              </div>
            ) : token ? (
              <div className="w-full rounded-xl bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 text-center">
                Valid reset link. Create a new password.
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-2 space-y-4 font-sans">
            {/* New Password */}
            <div>
              <Input
                id="new-password"
                label="New Password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
              />
              {newPassword && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500">Strength:</span>
                  <span className={`text-[11px] font-semibold ${strength.color}`}>{strength.label}</span>
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i <= strength.percent / 25 ? 'bg-[#E20613]' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <Input
              id="confirm-password"
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              required
            />

            {/* Rules checklist */}
            <div className="rounded-xl border border-slate-100 bg-[#F2F4F7]/60 p-3 text-[11px]">
              <p className="mb-1.5 font-bold text-[#0D1F3D]">Password must:</p>
              {rules.map((rule) => {
                const passed = newPassword ? rule.test(newPassword) : false;
                return (
                  <div key={rule.label} className="flex items-center gap-2 py-0.5 font-medium">
                    {passed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-slate-300" />
                    )}
                    <span className={passed ? 'font-semibold text-slate-700' : 'text-slate-400'}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
              >
                <Shield className="mr-2 h-4 w-4" /> Reset Password
              </Button>
            </div>

            <div className="pt-1 text-center">
              <Link
                to="/admin/login"
                className="text-xs font-bold text-[#E20613] transition-colors hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          © {new Date().getFullYear()} Smart Field Work (SFW). All rights reserved.
        </p>
      </Card>
    </AuthLayout>
  );
}
