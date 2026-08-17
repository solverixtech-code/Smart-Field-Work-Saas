import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Info } from 'lucide-react';
import { useAppDispatch } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import { saveRefreshToken } from '../../common/authSession';
import { api } from '../../common/api';
import { AuthTokensSchema } from '@visiblo/shared';
import AuthLayout from '../../layouts/AuthLayout';
import { Button, Card } from '../../components/ui';

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const state = location.state as {
    challengeToken: string;
    deliveryTarget: string;
    expiresInSeconds: number;
    resendAfterSeconds: number;
  } | null;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(state?.expiresInSeconds ?? 300);
  const [resendCooldown, setResendCooldown] = useState(state?.resendAfterSeconds ?? 30);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!state?.challengeToken) navigate('/admin/login', { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
      setResendCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }, [digits]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length > 0) {
      const next = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }
      setDigits(next);
      inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    }
  }, [digits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== OTP_LENGTH) return;

    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        challengeToken: state!.challengeToken,
        otp,
      });
      const tokens = AuthTokensSchema.parse(res.data);
      saveRefreshToken(tokens.refreshToken);
      dispatch(setCredentials({ accessToken: tokens.accessToken, user: tokens.user }));
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await api.post('/auth/resend-otp', { challengeToken: state!.challengeToken });
      setResendCooldown(30);
      setCountdown(300);
    } catch { /* swallow */ }
  };

  if (!state) return null;

  return (
    <AuthLayout>
      <Card size="lg">
        <div>
          {/* Brand Logo */}
          <div className="mb-6 flex justify-center">
            <img
              src="/assets/sfw-logo.png"
              alt="Smart Field Work Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          <h2 className="text-center text-3xl font-extrabold text-[#0D1F3D]">
            Verify Your Identity
          </h2>
          <p className="mt-1.5 text-center text-xs font-medium text-slate-500">
            Enter the 6-digit code sent to your registered email
          </p>

          {/* Delivery target */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-[#0D1F3D]">
            <Mail className="h-4 w-4 text-[#E20613]" />
            <span>{state.deliveryTarget}</span>
          </div>

          {/* Reserved Fixed-Height Alert Slot */}
          <div className="mt-4 flex h-12 items-center justify-center">
            {error ? (
              <div className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 text-center animate-in fade-in duration-150">
                {error}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-2 space-y-5 font-sans">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-2.5 sm:gap-3" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="flex h-14 w-12 items-center justify-center rounded-xl border border-slate-200 bg-[#F2F4F7]/60 text-center text-xl font-bold text-[#0D1F3D] transition-all focus:border-[#E20613] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#E20613]"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Countdown */}
            <p className="text-center text-xs font-medium text-slate-500">
              Code expires in{' '}
              <span className={`font-bold ${countdown <= 60 ? 'text-rose-500' : 'text-[#0D1F3D]'}`}>
                {formatTime(countdown)}
              </span>
            </p>

            {/* Resend info block */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#F2F4F7]/60 p-3.5">
              <Info className="h-4 w-4 flex-shrink-0 text-[#E20613]" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-[#0D1F3D]">Didn't receive the code?</p>
                <p className="text-[11px] text-slate-500">Check your spam folder or request a new code.</p>
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-xs font-bold text-[#E20613] transition-colors hover:underline disabled:text-slate-400"
              >
                {resendCooldown > 0 ? `${resendCooldown}s` : 'Resend'}
              </button>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
                disabled={digits.join('').length !== OTP_LENGTH}
              >
                <ShieldCheck className="mr-2 h-4 w-4" /> Verify & Continue
              </Button>
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
