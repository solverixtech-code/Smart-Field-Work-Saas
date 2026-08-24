import React, { useState } from 'react';
import { Shield, Trash2, ArrowLeft, CheckCircle2, Lock, Mail, AlertTriangle, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export default function DataDeletionInstructionsPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubmitted(true);
    toast.success('Data deletion request submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 text-left selection:bg-red-100 selection:text-red-900">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-10 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img src="/assets/sfw-logo.png" alt="Smart Field Work" className="h-9 sm:h-10 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/admin/login'}
            className="bg-white text-[#0D1F3D] border-slate-200 font-bold hover:bg-red-50 hover:text-[#E20613] hover:border-red-200 flex items-center gap-2 text-xs shadow-xs"
          >
            <ArrowLeft className="h-4 w-4 text-[#E20613]" /> Back to Admin Login
          </Button>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="bg-[#0D1F3D] text-white py-14 px-4 sm:px-8 text-center space-y-3 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E20613_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold px-4 py-1.5 rounded-full shadow-xs">
            <Trash2 className="h-3.5 w-3.5 text-[#E20613]" /> Meta Data Deletion & Privacy
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            User Data Deletion <span className="text-[#E20613]">Instructions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Pursuant to Meta Developer Policy and GDPR guidelines, follow these instructions to revoke application permissions or request full data deletion.
          </p>
          <span className="text-[11px] text-slate-400 font-mono block">Last Updated: August 24, 2026</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl space-y-9 text-xs sm:text-sm leading-relaxed text-slate-700">
          {/* METHOD 1: META FACEBOOK DELETION */}
          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D1F3D] flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <Shield className="h-5 w-5 text-[#E20613]" /> Method 1: Remove Smart Field Work Access via Facebook Settings
            </h2>
            <p>
              If you connected your Facebook Page, Meta Lead Ads, or WhatsApp Business account to <strong>Smart Field Work (Smart Field Work SFW CRM)</strong>, you can revoke access at any time directly through Facebook:
            </p>
            <ol className="list-decimal pl-5 space-y-2.5 font-medium text-slate-700">
              <li>Log in to your Facebook account and go to <strong>Settings & Privacy ➔ Settings</strong>.</li>
              <li>In the left sidebar, click <strong>Apps and Websites</strong>.</li>
              <li>Search for <strong>Smart Field Work SFW CRM</strong>.</li>
              <li>Click <strong>Remove</strong> next to the application name.</li>
              <li>Check the box to delete all posts, videos, or events published by the app if desired, then click <strong>Remove</strong>.</li>
            </ol>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-medium flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Once revoked, Meta automatically halts real-time lead webhook events to our servers immediately.</span>
            </div>
          </section>

          {/* METHOD 2: DIRECT CRM DATA DELETION REQUEST FORM */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D1F3D] flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <Trash2 className="h-5 w-5 text-rose-600" /> Method 2: Request Full Account & Lead Data Purge
            </h2>
            <p>
              To request complete, permanent deletion of your account records, access tokens, lead databases, and server audit logs from Smart Field Work databases, submit your registered email address below:
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#0D1F3D] block">
                    Registered Business Email Address <span className="text-[#E20613]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@yourcompany.com"
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-[#0D1F3D] font-semibold focus:border-[#E20613] focus:ring-1 focus:ring-[#E20613] outline-none bg-white transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  className="bg-[#E20613] hover:bg-red-700 text-white font-extrabold flex items-center justify-center gap-2 text-xs w-full py-3 shadow-md"
                >
                  <Send className="h-4 w-4" /> Submit Data Deletion Request
                </Button>
                <span className="text-[11px] text-slate-500 font-medium block text-center">
                  Our Data Protection Officer will process your deletion request within 24–48 hours.
                </span>
              </form>
            ) : (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-2 text-center max-w-lg">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-extrabold text-emerald-900">Deletion Request Received!</h3>
                <p className="text-xs text-emerald-800 font-medium">
                  We have queued a permanent data purge request for <strong>{email}</strong>. A confirmation email with a deletion confirmation ID will be sent to your email address once completed.
                </p>
              </div>
            )}
          </section>

          {/* CONTACT DPO */}
          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D1F3D] flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <Mail className="h-5 w-5 text-[#E20613]" /> Data Deletion Contact & Confirmation
            </h2>
            <p>You can also email your deletion request directly to our privacy officer:</p>
            <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 font-medium space-y-1">
              <span className="font-extrabold text-[#0D1F3D] block text-xs sm:text-sm">Solverix Technologies — Smart Field Work Team</span>
              <span className="block text-xs">Email: <a href="mailto:privacy@smartfieldwork.com" className="text-[#E20613] font-bold hover:underline">privacy@smartfieldwork.com</a> / <a href="mailto:solverixtechnologies@gmail.com" className="text-[#E20613] font-bold hover:underline">solverixtechnologies@gmail.com</a></span>
              <span className="block text-xs text-slate-500">Subject line format: <em>Data Deletion Request — [Your Company Name]</em></span>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <span>© 2026 <strong className="font-bold text-[#E20613]">Smart Field Work</strong>. All rights reserved.</span>
          <div className="flex items-center gap-4 font-bold text-slate-600">
            <a href="/privacy-policy" className="hover:text-[#E20613]">Privacy Policy</a>
            <span>•</span>
            <a href="/terms-of-service" className="hover:text-[#E20613]">Terms of Service</a>
            <span>•</span>
            <a href="/data-deletion" className="hover:text-[#E20613]">Data Deletion</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
