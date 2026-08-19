import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Shield, RefreshCw, ArrowLeft, Check } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isLengthValid = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const passedCount = [isLengthValid, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const isStrong = passedCount >= 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please try again.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/admin/login');
    }, 800);
  };

  return (
    <AuthLayout>
      <div className="w-full min-h-[580px] flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl space-y-5">
        {/* Top Brand Logo & Shield Lock Icon */}
        <div className="flex flex-col items-center text-center">
          <img
            src="/assets/sfw-logo.png"
            alt="Smart Field Work Logo"
            className="h-14 sm:h-16 w-auto object-contain mb-4"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#E20613] border border-red-100 mb-3 shadow-xs">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0D1F3D]">Reset Your Password</h2>
          <p className="mt-1 text-xs font-medium text-slate-500 max-w-xs leading-relaxed">
            Enter your new password below. Make sure it's strong and secure.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-[#0D1F3D] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {newPassword.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Password Strength:</span>
                <span className={isStrong ? 'text-emerald-600' : 'text-[#E20613]'}>
                  {isStrong ? 'Strong' : 'Weak'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-1.5">
                <div className={`rounded-full ${passedCount >= 1 ? (isStrong ? 'bg-emerald-500' : 'bg-[#E20613]') : 'bg-slate-200'}`} />
                <div className={`rounded-full ${passedCount >= 3 ? (isStrong ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-200'}`} />
                <div className={`rounded-full ${isStrong ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              </div>
            </div>
          )}

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-[#0D1F3D] mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Rules Checklist */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2 text-xs">
            <p className="font-semibold text-[#0D1F3D]">Password must contain:</p>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div className="flex items-center gap-1.5">
                <Check className={`h-3.5 w-3.5 ${isLengthValid ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className={`h-3.5 w-3.5 ${hasLower ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>One lowercase letter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className={`h-3.5 w-3.5 ${hasUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>One uppercase letter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className={`h-3.5 w-3.5 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>One special character</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className={`h-3.5 w-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>One number</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full justify-center gap-2 font-bold py-3 text-sm shadow-md"
              isLoading={loading}
            >
              <RefreshCw className="h-4 w-4" /> Reset Password
            </Button>
          </div>

          <div className="pt-1">
            <Link to="/admin/login" className="block">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full justify-center gap-2 font-semibold text-[#0D1F3D] border-slate-200 hover:bg-slate-50 py-3 text-xs"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Button>
            </Link>
          </div>
        </form>
      </div>

      <p className="text-center text-xs font-medium text-slate-400 pt-2">
        © 2025 <span className="font-bold text-[#E20613]">Smart Field Work</span>. All rights reserved.
      </p>
    </AuthLayout>
  );
}
