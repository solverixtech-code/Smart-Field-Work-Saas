import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import { saveRefreshToken } from '../../common/authSession';
import { api } from '../../common/api';
import { AuthTokensSchema, OtpRequiredResponseSchema } from '@visiblo/shared';
import AuthLayout from '../../layouts/AuthLayout';
import { Button, Card, Input, Checkbox } from '../../components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
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
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

          {/* Heading */}
          <h2 className="text-center text-3xl font-extrabold text-[#0D1F3D]">
            Welcome Back!
          </h2>
          <p className="mt-1.5 text-center text-xs font-medium text-slate-500">
            Login to your Smart Field Work Admin Panel
          </p>

          {/* Reserved Fixed-Height Alert Slot */}
          <div className="mt-4 flex h-12 items-center justify-center">
            {error ? (
              <div className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 text-center animate-in fade-in duration-150">
                {error}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-2 space-y-4 font-sans">
            {/* Email */}
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              leftIcon={<Mail className="h-4 w-4" />}
              required
              autoComplete="email"
            />

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-semibold text-[#0D1F3D]">
                  Password
                </label>
                <Link
                  to="/admin/forgot-password"
                  className="text-[11px] font-bold text-[#E20613] transition-colors hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
                autoComplete="current-password"
              />
            </div>

            {/* Custom Designed Checkbox */}
            <div className="pt-1">
              <Checkbox
                id="remember"
                checked={remember}
                onChange={setRemember}
                label="Remember me"
              />
            </div>

            {/* Solid Primary Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
              >
                Login
              </Button>
            </div>
          </form>
        </div>

        {/* Footer pinned at bottom */}
        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          © {new Date().getFullYear()} Smart Field Work (SFW). All rights reserved.
        </p>
      </Card>
    </AuthLayout>
  );
}
