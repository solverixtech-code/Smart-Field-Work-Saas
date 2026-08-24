import React from 'react';
import { Shield, FileText, ArrowLeft, CheckCircle2, AlertCircle, Scale, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function TermsOfServicePage() {
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
          <Scale className="h-3.5 w-3.5 text-indigo-400" /> SaaS Terms & Service Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
          Please read these terms carefully before accessing or using the Smart Field Work SFW CRM application and Meta platform integrations.
        </p>
        <span className="text-[11px] text-slate-400 font-mono block">Last Updated: August 24, 2026</span>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm leading-relaxed text-slate-700">
          {/* SECTION 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="h-5 w-5 text-indigo-600" /> 1. Acceptance of Terms
            </h2>
            <p>
              By creating an account, accessing, or using the <strong>Smart Field Work SFW CRM</strong> platform, mobile application, or connected API services operated by Solverix Technologies ("Company", "we", "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the platform.
            </p>
          </section>

          {/* SECTION 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> 2. License & Service Provision
            </h2>
            <p>
              Subject to your compliance with these Terms and payment of applicable subscription fees, Smart Field Work grants you a non-exclusive, non-transferable, revocable right to access and use the SaaS CRM platform for internal business lead management, field activity tracking, and automated sales reporting.
            </p>
          </section>

          {/* SECTION 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Shield className="h-5 w-5 text-indigo-600" /> 3. External Platform Integrations (Meta, Google & WhatsApp)
            </h2>
            <p>
              Smart Field Work SFW CRM enables integration with third-party advertising and messaging networks including <strong>Meta Lead Ads (Facebook & Instagram)</strong>, <strong>Google Ads Lead Forms</strong>, and <strong>WhatsApp Business Cloud API</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-2 font-medium text-slate-600">
              <li>You are responsible for obtaining appropriate permissions from your leads before initiating communications.</li>
              <li>You agree to comply with all third-party platform terms, including Meta's Commercial Terms and WhatsApp Business Messaging Policies.</li>
              <li>Smart Field Work is not liable for service interruptions caused by third-party API rate limits, access revocations, or downtime.</li>
            </ul>
          </section>

          {/* SECTION 4 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <AlertCircle className="h-5 w-5 text-amber-600" /> 4. Prohibited Uses
            </h2>
            <p>You agree NOT to engage in any of the following prohibited activities:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-rose-50/50 rounded-lg border border-rose-200/80 font-medium text-rose-950">
                <span className="font-extrabold block mb-0.5 text-rose-900">Unsolicited Spamming</span>
                Sending unauthorized spam, mass unsolicited marketing messages, or phishing content via WhatsApp API.
              </div>
              <div className="p-3.5 bg-rose-50/50 rounded-lg border border-rose-200/80 font-medium text-rose-950">
                <span className="font-extrabold block mb-0.5 text-rose-900">Unauthorized Data Scraping</span>
                Using automated scripts, web crawlers, or scrapers to extract platform data without permission.
              </div>
              <div className="p-3.5 bg-rose-50/50 rounded-lg border border-rose-200/80 font-medium text-rose-950">
                <span className="font-extrabold block mb-0.5 text-rose-900">Security Circumvention</span>
                Attempting to bypass authentication, role-based permissions, or system security layers.
              </div>
              <div className="p-3.5 bg-rose-50/50 rounded-lg border border-rose-200/80 font-medium text-rose-950">
                <span className="font-extrabold block mb-0.5 text-rose-900">Illegal Lead Capture</span>
                Capturing or harvesting sensitive personal data without proper GDPR/DPDP consent disclosure.
              </div>
            </div>
          </section>

          {/* SECTION 5 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Scale className="h-5 w-5 text-indigo-600" /> 5. Limitation of Liability & Warranties
            </h2>
            <p>
              The Smart Field Work SFW CRM service is provided "AS IS" and "AS AVAILABLE". To the maximum extent permitted by law, Solverix Technologies disclaims all warranties, express or implied. In no event shall Solverix Technologies be liable for indirect, incidental, special, or consequential damages resulting from platform usage.
            </p>
          </section>

          {/* SECTION 6 */}
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Mail className="h-5 w-5 text-indigo-600" /> 6. Contact Information
            </h2>
            <p>For legal enquiries or questions regarding these Terms of Service, please contact us:</p>
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
