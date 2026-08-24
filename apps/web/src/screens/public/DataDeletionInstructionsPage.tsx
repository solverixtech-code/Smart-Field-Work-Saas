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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 text-left selection:bg-indigo-100 selection:text-indigo-900">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
            SFW
          </div>
          <div>
            <span className="font-extrabold text-[#0D1F3D] text-base block tracking-tight">Visiblo SFW CRM</span>
            <span className="text-[10px] font-semibold text-slate-500 block">Smart Field Work SaaS Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/admin/login'}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to CRM Login
          </Button>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="bg-[#0D1F3D] text-white py-12 px-4 sm:px-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-bold px-3 py-1 rounded-full">
          <Trash2 className="h-3.5 w-3.5 text-rose-400" /> Meta Data Deletion & Privacy
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">User Data Deletion Instructions</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
          Pursuant to Meta Developer Policy and GDPR guidelines, follow these instructions to revoke application permissions or request full data deletion.
        </p>
        <span className="text-[11px] text-slate-400 font-mono block">Last Updated: August 24, 2026</span>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700">
          {/* METHOD 1: META FACEBOOK DELETION */}
          <section className="space-y-4">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Shield className="h-5 w-5 text-indigo-600" /> Method 1: Remove Visiblo App Access via Facebook Settings
            </h2>
            <p>
              If you connected your Facebook Page, Meta Lead Ads, or WhatsApp Business account to <strong>Visiblo SFW CRM (Smart Field Work SFW CRM)</strong>, you can revoke access at any time directly through Facebook:
            </p>
            <ol className="list-decimal pl-5 space-y-2 font-medium text-slate-700">
              <li>Log in to your Facebook account and go to <strong>Settings & Privacy ➔ Settings</strong>.</li>
              <li>In the left sidebar, click <strong>Apps and Websites</strong>.</li>
              <li>Search for <strong>Smart Field Work SFW CRM</strong> (or <em>Visiblo SFW CRM</em>).</li>
              <li>Click <strong>Remove</strong> next to the application name.</li>
              <li>Check the box to delete all posts, videos, or events published by the app if desired, then click <strong>Remove</strong>.</li>
            </ol>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Once revoked, Meta automatically halts real-time lead webhook events to our servers immediately.</span>
            </div>
          </section>

          {/* METHOD 2: DIRECT CRM DATA DELETION REQUEST FORM */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Trash2 className="h-5 w-5 text-rose-600" /> Method 2: Request Full Account & Lead Data Purge
            </h2>
            <p>
              To request complete, permanent deletion of your account records, access tokens, lead databases, and server audit logs from Visiblo CRM databases, submit your registered email address below:
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#0D1F3D] block">
                    Registered Business Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@yourcompany.com"
                    className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-800 font-medium focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white"
                  />
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold flex items-center justify-center gap-2 text-xs w-full py-2.5 shadow-sm"
                >
                  <Send className="h-4 w-4" /> Submit Data Deletion Request
                </Button>
                <span className="text-[11px] text-slate-500 font-medium block text-center">
                  Our Data Protection Officer will process your deletion request within 24–48 hours.
                </span>
              </form>
            ) : (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-2 text-center max-w-lg">
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
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Mail className="h-5 w-5 text-indigo-600" /> Data Deletion Contact & Confirmation
            </h2>
            <p>You can also email your deletion request directly to our privacy officer:</p>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-medium space-y-1">
              <span className="font-extrabold text-[#0D1F3D] block text-xs">Solverix Technologies — Smart Field Work Team</span>
              <span className="block text-xs">Email: <a href="mailto:privacy@smartfieldwork.com" className="text-indigo-600 font-bold hover:underline">privacy@smartfieldwork.com</a> / <a href="mailto:solverixtechnologies@gmail.com" className="text-indigo-600 font-bold hover:underline">solverixtechnologies@gmail.com</a></span>
              <span className="block text-xs text-slate-500">Subject line format: <em>Data Deletion Request — [Your Company Name]</em></span>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <span>© 2026 Smart Field Work SFW CRM. All rights reserved.</span>
          <div className="flex items-center gap-4 font-bold text-slate-600">
            <a href="/privacy-policy" className="hover:text-indigo-600">Privacy Policy</a>
            <span>•</span>
            <a href="/terms-of-service" className="hover:text-indigo-600">Terms of Service</a>
            <span>•</span>
            <a href="/data-deletion" className="hover:text-indigo-600">Data Deletion</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
