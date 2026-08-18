import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, Send, ArrowLeft, Info } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl space-y-6">
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
          <h2 className="text-2xl font-extrabold text-[#0D1F3D]">Forgot Password?</h2>
          <p className="mt-1 text-xs font-medium text-slate-500 max-w-xs leading-relaxed">
            No worries! Enter your registered email address and we'll send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800">
              Password reset link sent to <span className="font-extrabold">{email}</span>! Please check your inbox.
            </div>
            <Link to="/admin/login">
              <Button variant="outline" size="lg" className="w-full justify-center gap-2 font-bold py-3 text-xs border-slate-200 mt-2">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0D1F3D] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none transition-all"
                  required
                />
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
                <Send className="h-4 w-4" /> Send Reset Link
              </Button>
            </div>

            <div className="relative flex items-center justify-center pt-2">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-xs font-medium text-slate-400">or</span>
            </div>

            <Link to="/admin/login" className="block pt-1">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full justify-center gap-2 font-semibold text-[#0D1F3D] border-slate-200 hover:bg-slate-50 py-3 text-xs"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Button>
            </Link>
          </form>
        )}

        {/* Spam Notice Info Box */}
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/80 p-3.5 text-xs text-blue-900 font-medium">
          <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <span>If you don't receive the email in your inbox, please check your spam or junk folder.</span>
        </div>
      </div>

      <p className="text-center text-xs font-medium text-slate-400 pt-2">
        © 2025 <span className="font-bold text-[#E20613]">Smart Field Work</span>. All rights reserved.
      </p>
    </AuthLayout>
  );
}
