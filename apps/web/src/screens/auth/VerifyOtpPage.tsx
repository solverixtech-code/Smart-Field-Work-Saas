import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { useAppDispatch } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';
import { saveRefreshToken } from '../../common/authSession';
import { api } from '../../common/api';
import { AuthTokensSchema } from '@visiblo/shared';
import AuthLayout from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';

export default function VerifyOtpPage() {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(48);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const challengeToken = location.state?.challengeToken;
  const deliveryTarget = location.state?.deliveryTarget || 'admin@example.com';

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Auto-focus the first OTP digit input immediately when page loads
    const timerId = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);

    return () => {
      clearInterval(interval);
      clearTimeout(timerId);
    };
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('Text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      e.preventDefault();
      const newDigits = pastedData.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 6) {
      const errText = 'Please enter complete 6-digit OTP passcode.';
      setError(errText);
      toast.error(errText);
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (challengeToken) {
        const res = await api.post('/auth/verify-otp', { challengeToken, otp });
        const tokens = AuthTokensSchema.parse(res.data);
        saveRefreshToken(tokens.refreshToken, true);
        dispatch(setCredentials({ accessToken: tokens.accessToken, user: tokens.user }));
      }
      toast.success('Passcode verified! Logged in successfully.');
      navigate('/admin/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid or expired OTP passcode.';
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
          <h2 className="text-2xl font-extrabold text-[#0D1F3D]">Verify It's You</h2>
          <p className="mt-1 text-xs font-medium text-slate-500 max-w-xs leading-relaxed">
            Enter the 6-digit passcode we sent to <br />
            <span className="font-bold text-[#0D1F3D]">{deliveryTarget}</span>
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 text-center animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-center text-[#0D1F3D] mb-3">
              Enter OTP
            </label>
            <div className="flex justify-center gap-2 sm:gap-2.5">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  autoFocus={idx === 0}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className="h-12 w-10 sm:w-11 rounded-xl border border-slate-200 bg-slate-50/50 text-center text-lg font-bold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:ring-2 focus:ring-red-100 focus:outline-none transition-all shadow-xs"
                />
              ))}
            </div>
          </div>

          <div className="text-center text-xs font-semibold text-slate-500">
            Didn't receive the code?{' '}
            {timer > 0 ? (
              <span className="text-[#E20613] font-bold">Resend OTP in 00:{timer < 10 ? `0${timer}` : timer}</span>
            ) : (
              <button
                type="button"
                onClick={() => setTimer(48)}
                className="text-[#E20613] font-bold hover:underline cursor-pointer"
              >
                Resend OTP Now
              </button>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full justify-center gap-2 font-bold py-3 text-sm shadow-md"
              isLoading={loading}
            >
              <CheckCircle2 className="h-4 w-4" /> Verify & Continue
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-xs font-medium text-slate-400">or</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => toast.info('Please enter your 8-character backup security code.')}
            className="w-full justify-center gap-2 font-semibold text-[#0D1F3D] border-slate-200 hover:bg-slate-50 py-3 text-xs"
          >
            <ShieldCheck className="h-4 w-4 text-blue-600" /> Use Backup Code
          </Button>

          <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 pt-2">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>This helps us keep your account secure.</span>
          </div>
        </form>
      </div>

      <p className="text-center text-xs font-medium text-slate-400 pt-2">
        © 2025 <span className="font-bold text-[#E20613]">Smart Field Work</span>. All rights reserved.
      </p>
    </AuthLayout>
  );
}
