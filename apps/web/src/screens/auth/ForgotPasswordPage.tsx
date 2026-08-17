import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, ArrowLeft } from 'lucide-react';
import { api } from '../../common/api';
import AuthLayout from '../../layouts/AuthLayout';
import { Button, Card, Input } from '../../components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { identifier: email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
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

          <h2 className="text-center text-3xl font-extrabold text-[#0D1F3D]">
            Forgot Password?
          </h2>
          <p className="mt-1.5 text-center text-xs font-medium text-slate-500">
            No worries! Enter your admin email address and we'll send you a link to reset your password.
          </p>

          {/* Reserved Fixed-Height Alert Slot */}
          <div className="mt-4 flex h-12 items-center justify-center">
            {error ? (
              <div className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 text-center animate-in fade-in duration-150">
                {error}
              </div>
            ) : null}
          </div>

          {sent ? (
            <div className="mt-2 space-y-6">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-xs text-emerald-700 font-medium">
                If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox and spam folder.
              </div>
              <Link to="/admin/login" className="block">
                <Button variant="outline" size="lg" fullWidth>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-2 space-y-5 font-sans">
              <Input
                id="forgot-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your admin email address"
                leftIcon={<Mail className="h-4 w-4" />}
                required
                autoComplete="email"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                >
                  <Send className="mr-2 h-4 w-4" /> Send Reset Link
                </Button>
              </div>

              <div className="pt-1 text-center">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center text-xs font-bold text-[#E20613] transition-colors hover:underline"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          © {new Date().getFullYear()} Smart Field Work (SFW). All rights reserved.
        </p>
      </Card>
    </AuthLayout>
  );
}
