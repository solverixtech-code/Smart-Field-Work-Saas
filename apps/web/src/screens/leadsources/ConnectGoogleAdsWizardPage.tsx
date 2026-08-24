import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search,
  Shield,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Check,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ConnectGoogleAdsWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/leads/sources')}>
            Lead Sources
          </span>
          <span>/</span>
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/leads/integrations')}>
            Integrations
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Google Ads</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Connect Google Ads</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Connect your Google Ads account to capture leads from Google Ads lead forms directly into SFW CRM.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/leads/integrations')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50"
          >
            ← Back to Integrations
          </Button>
        </div>
      </div>

      {/* STEPPER HEADER PROGRESS BAR */}
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-4xl mx-auto relative">
          <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />
          <div
            className="absolute left-6 top-4 h-0.5 bg-indigo-600 transition-all duration-300 -z-0"
            style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '25%' : currentStep === 3 ? '50%' : currentStep === 4 ? '75%' : '100%' }}
          />

          {[
            { step: 1, label: 'Connect Account' },
            { step: 2, label: 'Select Ads Account' },
            { step: 3, label: 'Conversion Actions' },
            { step: 4, label: 'Field Mapping' },
            { step: 5, label: 'Routing & Complete' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-1 z-10 bg-white px-2">
              <div
                className={`h-8 w-8 rounded-full font-extrabold text-xs flex items-center justify-center transition-colors ${
                  currentStep >= item.step ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {currentStep > item.step ? <Check className="h-4 w-4" /> : item.step}
              </div>
              <span className={`text-xs font-bold ${currentStep >= item.step ? 'text-[#0D1F3D]' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1 AUTHORIZE */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs space-y-6 text-center">
              <h2 className="text-lg font-extrabold text-[#0D1F3D]">Connect your Google Ads account</h2>
              <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto">
                Authorize SFW to access your Google Ads data securely through Google's official API.
              </p>

              <div className="flex items-center justify-center gap-6 py-4">
                <div className="h-16 w-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-xs">
                  <Search className="h-8 w-8" />
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <span className="h-0.5 w-12 bg-slate-200 border-t border-dashed border-slate-300" />
                  <Lock className="h-5 w-5 text-indigo-600" />
                  <span className="h-0.5 w-12 bg-slate-200 border-t border-dashed border-slate-300" />
                </div>
                <div className="h-16 w-16 rounded-full bg-indigo-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  SFW
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto text-xs font-semibold">
                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#0D1F3D] block">Secure & Safe Connection</span>
                    <span className="text-[10px] text-slate-500 font-medium">Redirected to Google to sign in</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#0D1F3D] block">Read-only Access</span>
                    <span className="text-[10px] text-slate-500 font-medium">We only read your lead form data</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#0D1F3D] block">Lead Form Sync</span>
                    <span className="text-[10px] text-slate-500 font-medium">Capture leads in real-time</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#0D1F3D] block">Auto Assignment</span>
                    <span className="text-[10px] text-slate-500 font-medium">Auto-assign leads to your team</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col items-center gap-2">
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => {
                    toast.success('Google Ads Account Connected!');
                    setCurrentStep(5);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-2.5 text-xs flex items-center gap-2 shadow-md"
                >
                  <Search className="h-4 w-4" /> Connect with Google
                </Button>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Lock className="h-3 w-3" /> You will be redirected to Google to authorize
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                Requirements
              </h3>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Google Ads admin or standard access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Active lead form conversion actions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Stable internet connection for real-time sync
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5 COMPLETE */}
      {currentStep === 5 && (
        <div className="rounded-md border border-emerald-200 bg-white p-8 shadow-xs text-center max-w-2xl mx-auto space-y-5">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Check className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0D1F3D]">Google Ads Lead Forms Connected!</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Google Ads lead extension submissions will now sync directly into SFW CRM every 5 minutes.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="accent"
              size="md"
              onClick={() => navigate('/admin/leads/automation/activity')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              View Live Lead Activity →
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/admin/leads/integrations')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50"
            >
              Back to Integrations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
