import React from 'react';
import { Shield, Lock, CheckCircle2, FileText, ArrowLeft, Mail, Globe, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 text-left selection:bg-indigo-100 selection:text-indigo-900">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img src="/assets/sfw-logo.png" alt="Smart Field Work" className="h-8 object-contain" onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }} />
          <div>
            <span className="font-extrabold text-[#0D1F3D] text-base block tracking-tight">Smart Field Work SFW CRM</span>
            <span className="text-[10px] font-semibold text-slate-500 block">Enterprise Field Work & Automation SaaS</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/admin/login'}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 text-xs shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to CRM Login
          </Button>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="bg-[#0D1F3D] text-white py-12 px-4 sm:px-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold px-3.5 py-1 rounded-full">
          <Shield className="h-3.5 w-3.5 text-indigo-400" /> Meta & Enterprise Data Privacy Compliant
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
          Learn how Smart Field Work SFW CRM collects, protects, and manages data from your account, Meta Lead Ads, and WhatsApp Business API integrations.
        </p>
        <span className="text-[11px] text-slate-400 font-mono block">Last Updated: August 24, 2026</span>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700">
          {/* SECTION 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="h-5 w-5 text-indigo-600" /> 1. Overview & Scope
            </h2>
            <p>
              This Privacy Policy explains how <strong>Smart Field Work SFW CRM</strong> ("we", "us", or "our"), operated by Solverix Technologies, collects, uses, stores, and protects information when you use our SaaS application, website (<a href="https://smartfieldwork.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">smartfieldwork.com</a>), CRM platform (<a href="https://crm.smartfieldwork.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">crm.smartfieldwork.com</a>), and third-party platform integrations including <strong>Meta Lead Ads (Facebook & Instagram)</strong> and <strong>WhatsApp Business Cloud API</strong>.
            </p>
          </section>

          {/* SECTION 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="h-5 w-5 text-indigo-600" /> 2. Information We Collect
            </h2>
            <p>We collect information in the following ways to provide seamless CRM field work and lead automation services:</p>
            <ul className="list-disc pl-5 space-y-2 font-medium text-slate-600">
              <li>
                <strong>Account Information:</strong> Full name, business email address, phone number, role, employee code, and password hashes created during registration.
              </li>
              <li>
                <strong>Meta & Social Lead Data:</strong> Information submitted by prospects through Facebook & Instagram Lead Forms connected to your account (e.g. Lead Name, Mobile Number, Email, City, Requirements, Campaign ID).
              </li>
              <li>
                <strong>WhatsApp Cloud API Data:</strong> Inbound messages, WhatsApp profile display names, phone numbers, and timestamps processed via Meta Webhook API.
              </li>
              <li>
                <strong>Device & Usage Logs:</strong> IP addresses, browser types, session timestamps, and audit logs recorded for security and performance optimization.
              </li>
            </ul>
          </section>

          {/* SECTION 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> 3. How We Use Your Data
            </h2>
            <p>Your data is processed strictly for legitimate business operations within the Smart Field Work CRM platform:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 font-medium">
                <span className="font-extrabold text-[#0D1F3D] block mb-0.5">Automated Lead Ingestion</span>
                Syncing leads captured from Meta Lead Ads and WhatsApp into your CRM database in real-time.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 font-medium">
                <span className="font-extrabold text-[#0D1F3D] block mb-0.5">Lead Routing & Assignment</span>
                Automatically assigning leads to designated sales managers, team leaders, and field executives.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 font-medium">
                <span className="font-extrabold text-[#0D1F3D] block mb-0.5">Automated Notifications</span>
                Sending automated SMS/WhatsApp follow-ups and CRM activity notifications.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 font-medium">
                <span className="font-extrabold text-[#0D1F3D] block mb-0.5">Security & Compliance</span>
                Enforcing role-based access control (RBAC), multi-factor authentication, and fraud prevention.
              </div>
            </div>
          </section>

          {/* SECTION 4 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Shield className="h-5 w-5 text-indigo-600" /> 4. Data Sharing & Third-Party Disclosure
            </h2>
            <p>
              <strong>We do NOT sell, rent, or trade your personal or business lead data to any third party under any circumstances.</strong> Data is shared only under the following strict scenarios:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-600">
              <li>With <strong>Meta Platforms, Inc.</strong> via official OAuth endpoints and Webhook APIs authorized explicitly by your account administrator.</li>
              <li>With secure cloud infrastructure providers (PostgreSQL, Amazon Web Services S3) under strict encryption standards.</li>
              <li>When required by law or legal regulatory compliance.</li>
            </ul>
          </section>

          {/* SECTION 5 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="h-5 w-5 text-indigo-600" /> 5. Data Security & Storage
            </h2>
            <p>
              We implement enterprise-grade security measures including SSL/TLS encryption for all data in transit, AES-256 encryption for database tokens, strict database access controls, and regular vulnerability assessments.
            </p>
          </section>

          {/* SECTION 6 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Globe className="h-5 w-5 text-indigo-600" /> 6. User Rights & Data Deletion Instructions
            </h2>
            <p>
              You have the right to access, export, or request permanent deletion of your personal data and connected Meta account data at any time.
            </p>
            <p className="bg-indigo-50/80 p-3.5 rounded-lg border border-indigo-200 text-indigo-900 font-medium">
              For complete instructions on revoking Meta access or initiating full data purge, please visit our dedicated page:{' '}
              <a href="/data-deletion" className="font-extrabold text-indigo-700 underline hover:text-indigo-900">
                User Data Deletion Instructions (/data-deletion)
              </a>.
            </p>
          </section>

          {/* SECTION 7 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Mail className="h-5 w-5 text-indigo-600" /> 7. Contact Information
            </h2>
            <p>If you have any questions, privacy concerns, or data requests, please contact our Data Protection Officer:</p>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-medium space-y-1">
              <span className="font-extrabold text-[#0D1F3D] block text-xs">Solverix Technologies — Smart Field Work Team</span>
              <span className="block text-xs">Email: <a href="mailto:privacy@smartfieldwork.com" className="text-indigo-600 font-bold hover:underline">privacy@smartfieldwork.com</a> / <a href="mailto:solverixtechnologies@gmail.com" className="text-indigo-600 font-bold hover:underline">solverixtechnologies@gmail.com</a></span>
              <span className="block text-xs">Website: <a href="https://smartfieldwork.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">smartfieldwork.com</a> | App: <a href="https://crm.smartfieldwork.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">crm.smartfieldwork.com</a></span>
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
