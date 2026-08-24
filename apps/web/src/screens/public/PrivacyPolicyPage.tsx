import React from 'react';
import { Shield, Lock, CheckCircle2, FileText, ArrowLeft, Mail, Globe, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-4 py-1.5 rounded-full shadow-xs">
            <Shield className="h-3.5 w-3.5 text-[#E20613]" /> Official Enterprise Privacy Policy
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Privacy <span className="text-[#E20613]">Policy</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Learn how Smart Field Work collects, protects, and manages data from your account, Meta Lead Ads, and WhatsApp Business API integrations.
          </p>
          <span className="text-[11px] text-slate-400 font-mono block">Last Updated: August 24, 2026</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl space-y-9 text-xs sm:text-sm leading-relaxed text-slate-700">
          {/* SECTION 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D1F3D] flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <FileText className="h-5 w-5 text-[#E20613]" /> 1. Overview & Scope
            </h2>
            <p>
              This Privacy Policy explains how <strong>Smart Field Work</strong> ("we", "us", or "our"), operated by Solverix Technologies, collects, uses, stores, and protects information when you use our SaaS application, website (<a href="https://smartfieldwork.com" target="_blank" rel="noreferrer" className="text-[#E20613] font-bold hover:underline">smartfieldwork.com</a>), CRM platform (<a href="https://crm.smartfieldwork.com" target="_blank" rel="noreferrer" className="text-[#E20613] font-bold hover:underline">crm.smartfieldwork.com</a>), and third-party platform integrations including <strong>Meta Lead Ads (Facebook & Instagram)</strong> and <strong>WhatsApp Business Cloud API</strong>.
            </p>
          </section>

          {/* SECTION 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D1F3D] flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <Lock className="h-5 w-5 text-[#E20613]" /> 2. Information We Collect
            </h2>
            <p>We collect information in the following ways to provide seamless CRM field work and lead automation services:</p>
            <ul className="list-disc pl-5 space-y-2.5 font-medium text-slate-600">
              <li>
                <strong className="text-[#0D1F3D]">Account Information:</strong> Full name, business email address, phone number, role, employee code, and password hashes created during registration.
              </li>
              <li>
                <strong className="text-[#0D1F3D]">Meta & Social Lead Data:</strong> Information submitted by prospects through Facebook & Instagram Lead Forms connected to your account (e.g. Lead Name, Mobile Number, Email, City, Requirements, Campaign ID).
              </li>
              <li>
                <strong className="text-[#0D1F3D]">WhatsApp Cloud API Data:</strong> Inbound messages, WhatsApp profile display names, phone numbers, and timestamps processed via Meta Webhook API.
              </li>
              <li>
                <strong className="text-[#0D1F3D]">Device & Usage Logs:</strong> IP addresses, browser types, session timestamps, and audit logs recorded for security and performance optimization.
              </li>
            </ul>
          </section>

          {/* SECTION 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D1F3D] flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <CheckCircle2 className="h-5 w-5 text-[#E20613]" /> 3. How We Use Your Data
            </h2>
            <p>Your data is processed strictly for legitimate business operations within the Smart Field Work platform:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 font-medium">
                <span className="font-extrabold text-[#0D1F3D] block mb-1">Automated Lead Ingestion</span>
                Syncing leads captured from Meta Lead Ads and WhatsApp into your CRM database in real-time.
              </div>
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 font-medium">
                <span className="font-extrabold text-[#0D1F3D] block mb-1">Lead Routing & Assignment</span>
                Automatically assigning leads to designated sales managers, team leaders, and field executives.
              </div>
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 font-medium">
                <span className="font-extrabold text-[#0D1F3D] block mb-1">Automated Notifications</span>
                Sending automated SMS/WhatsApp follow-ups and CRM activity notifications.
              </div>
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 font-medium">
                <span className="font-extrabold text-[#0D1F3D] block mb-1">Security & Compliance</span>
                Enforcing role-based access control (RBAC), multi-factor authentication, and fraud prevention.
              </div>
            </div>
          </section>

          {/* SECTION 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D1F3D] flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <Shield className="h-5 w-5 text-[#E20613]" /> 4. Data Sharing & Third-Party Disclosure
            </h2>
            <p>
              <strong>We do NOT sell, rent, or trade your personal or business lead data to any third party under any circumstances.</strong> Data is shared only under the following strict scenarios:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-medium text-slate-600">
              <li>With <strong>Meta Platforms, Inc.</strong> via official OAuth endpoints and Webhook APIs authorized explicitly by your account administrator.</li>
              <li>With secure cloud infrastructure providers (PostgreSQL, Amazon Web Services S3) under strict encryption standards.</li>
              <li>When required by law or legal regulatory compliance.</li>
            </ul>
          </section>

          {/* SECTION 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D1F3D] flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <Lock className="h-5 w-5 text-[#E20613]" /> 5. Data Security & Storage
            </h2>
            <p>
              We implement enterprise-grade security measures including SSL/TLS encryption for all data in transit, AES-256 encryption for database tokens, strict database access controls, and regular vulnerability assessments.
            </p>
          </section>

          {/* SECTION 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D1F3D] flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <Globe className="h-5 w-5 text-[#E20613]" /> 6. User Rights & Data Deletion Instructions
            </h2>
            <p>
              You have the right to access, export, or request permanent deletion of your personal data and connected Meta account data at any time.
            </p>
            <p className="bg-red-50/60 p-4 rounded-2xl border border-red-100 text-[#0D1F3D] font-medium">
              For complete instructions on revoking Meta access or initiating full data purge, please visit our dedicated page:{' '}
              <a href="/data-deletion" className="font-extrabold text-[#E20613] underline hover:text-red-700">
                User Data Deletion Instructions (/data-deletion)
              </a>.
            </p>
          </section>

          {/* SECTION 7 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D1F3D] flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
              <Mail className="h-5 w-5 text-[#E20613]" /> 7. Contact Information
            </h2>
            <p>If you have any questions, privacy concerns, or data requests, please contact our Data Protection Officer:</p>
            <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 font-medium space-y-1">
              <span className="font-extrabold text-[#0D1F3D] block text-xs sm:text-sm">Solverix Technologies — Smart Field Work Team</span>
              <span className="block text-xs">Email: <a href="mailto:privacy@smartfieldwork.com" className="text-[#E20613] font-bold hover:underline">privacy@smartfieldwork.com</a> / <a href="mailto:solverixtechnologies@gmail.com" className="text-[#E20613] font-bold hover:underline">solverixtechnologies@gmail.com</a></span>
              <span className="block text-xs">Website: <a href="https://smartfieldwork.com" target="_blank" rel="noreferrer" className="text-[#E20613] font-bold hover:underline">smartfieldwork.com</a> | App: <a href="https://crm.smartfieldwork.com" target="_blank" rel="noreferrer" className="text-[#E20613] font-bold hover:underline">crm.smartfieldwork.com</a></span>
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
