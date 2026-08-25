import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRightCircle, ShieldCheck } from 'lucide-react';
import { useAppDispatch } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import { saveRefreshToken } from '../../common/authSession';
import { api } from '../../common/api';
import { AuthTokensSchema, OtpRequiredResponseSchema } from '@visiblo/shared';
import AuthLayout from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@visibloai.com');
  const [password, setPassword] = useState('Visiblo@2025');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });

      // Check if OTP is required
      const otpResult = OtpRequiredResponseSchema.safeParse(res.data);
      if (otpResult.success) {
        navigate('/admin/verify', {
          state: {
            challengeToken: otpResult.data.challengeToken,
            deliveryTarget: otpResult.data.deliveryTarget,
            expiresInSeconds: otpResult.data.expiresInSeconds,
            resendAfterSeconds: otpResult.data.resendAfterSeconds,
          },
        });
        return;
      }

      // Direct login — no OTP
      const tokens = AuthTokensSchema.parse(res.data);
      saveRefreshToken(tokens.refreshToken, remember);
      dispatch(setCredentials({ accessToken: tokens.accessToken, user: tokens.user }));
      toast.success('Welcome back! Login successful.');
      navigate('/admin/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full min-h-[580px] flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl space-y-6">
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
          <h2 className="text-2xl font-extrabold text-[#0D1F3D]">Admin Login</h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Welcome back! Please login to your admin account to continue.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 text-center animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-[#0D1F3D] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:ring-2 focus:ring-red-100 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-[#0D1F3D] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#E20613] focus:ring-[#E20613]"
              />
              <span className="font-semibold text-slate-700">Remember Me</span>
            </label>
            <Link
              to="/admin/forgot-password"
              className="font-bold text-[#E20613] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full justify-center gap-2 font-bold py-3 text-sm shadow-md"
              isLoading={loading}
            >
              <ArrowRightCircle className="h-4 w-4" /> Login
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-xs font-medium text-slate-400">or</span>
        </div>

        {/* Login with SSO */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => toast.info('Redirecting to Single Sign-On (SSO)...')}
          className="w-full justify-center gap-2 font-semibold text-[#0D1F3D] border-slate-200 hover:bg-slate-50 py-3 text-xs"
        >
          <ShieldCheck className="h-4 w-4 text-blue-600" /> Login with SSO
        </Button>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Secure admin access. All data is encrypted and protected.</span>
        </div>
      </div>

      <p className="text-center text-xs font-medium text-slate-400 pt-2">
        © 2025 <span className="font-bold text-[#E20613]">Smart Field Work</span>. All rights reserved.
      </p>
    </AuthLayout>
  );
}
