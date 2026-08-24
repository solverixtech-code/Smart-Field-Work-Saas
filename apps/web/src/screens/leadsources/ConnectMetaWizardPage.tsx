import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Facebook,
  Shield,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Zap,
  HelpCircle,
  Video,
  FileText,
  Building2,
  Layers,
  Edit,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';

export default function ConnectMetaWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 2 State
  const [selectedBusiness, setSelectedBusiness] = useState('Aimbeat Technologies Pvt. Ltd.');
  const [selectedPages, setSelectedPages] = useState<{ fbPage: boolean; igAccount: boolean }>({
    fbPage: true,
    igAccount: true,
  });
  const [selectedAdAccount, setSelectedAdAccount] = useState('Aimbeat Ads Account');

  // Step 3 State
  const [isActivated, setIsActivated] = useState(false);

  const handleActivate = () => {
    setIsActivated(true);
    setCurrentStep(4);
    toast.success('Meta Lead Ads Integration activated successfully!');
  };

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
          <span className="text-[#0D1F3D] font-bold">Meta (Facebook & Instagram)</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Facebook className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Connect Meta (Facebook & Instagram)</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Connect your Meta account to capture leads from Facebook Lead Ads and Instagram Lead Ads directly into SFW CRM.
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
        <div className="flex items-center justify-between max-w-3xl mx-auto relative">
          {/* Progress Line */}
          <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />
          <div
            className="absolute left-6 top-4 h-0.5 bg-indigo-600 transition-all duration-300 -z-0"
            style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%' }}
          />

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1 z-10 bg-white px-2">
            <div
              className={`h-8 w-8 rounded-full font-extrabold text-xs flex items-center justify-center transition-colors ${
                currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              1
            </div>
            <span className={`text-xs font-bold ${currentStep >= 1 ? 'text-[#0D1F3D]' : 'text-slate-400'}`}>
              Connect Account
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1 z-10 bg-white px-2">
            <div
              className={`h-8 w-8 rounded-full font-extrabold text-xs flex items-center justify-center transition-colors ${
                currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              2
            </div>
            <span className={`text-xs font-bold ${currentStep >= 2 ? 'text-[#0D1F3D]' : 'text-slate-400'}`}>
              Select Assets
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1 z-10 bg-white px-2">
            <div
              className={`h-8 w-8 rounded-full font-extrabold text-xs flex items-center justify-center transition-colors ${
                currentStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              3
            </div>
            <span className={`text-xs font-bold ${currentStep >= 3 ? 'text-[#0D1F3D]' : 'text-slate-400'}`}>
              Auto Setup Review
            </span>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center gap-1 z-10 bg-white px-2">
            <div
              className={`h-8 w-8 rounded-full font-extrabold text-xs flex items-center justify-center transition-colors ${
                currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {currentStep === 4 ? <Check className="h-4 w-4" /> : '4'}
            </div>
            <span className={`text-xs font-bold ${currentStep >= 4 ? 'text-emerald-700' : 'text-slate-400'}`}>
              Activate
            </span>
          </div>
        </div>
      </div>

      {/* STEP 1: AUTHORIZE META */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs space-y-6 text-center">
              <h2 className="text-lg font-extrabold text-[#0D1F3D]">Connect your Meta account</h2>
              <p className="text-xs font-semibold text-slate-500 max-w-md mx-auto">
                Authorize SFW to access your Meta data securely. We never post or manage your ads.
              </p>

              <div className="flex items-center justify-center gap-6 py-4">
                <div className="h-16 w-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                  <Facebook className="h-8 w-8" />
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
                    <span className="font-extrabold text-[#0D1F3D] block">Secure OAuth Connection</span>
                    <span className="text-[10px] text-slate-500 font-medium">Official Meta Login API</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#0D1F3D] block">Read-only Lead Access</span>
                    <span className="text-[10px] text-slate-500 font-medium">Your ads & campaigns stay private</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#0D1F3D] block">Real-time Lead Sync</span>
                    <span className="text-[10px] text-slate-500 font-medium">Captured instantly via Webhooks</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#0D1F3D] block">Disconnect Anytime</span>
                    <span className="text-[10px] text-slate-500 font-medium">No lead data will ever be lost</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col items-center gap-2">
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => {
                    toast.success('Meta Account Authorized!');
                    setCurrentStep(2);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-2.5 text-xs flex items-center gap-2 shadow-md"
                >
                  <Facebook className="h-4 w-4" /> Connect with Meta
                </Button>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Secure & Encrypted Connection
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
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Meta Business Manager access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Admin access to Facebook Page
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Lead Ads forms published and active
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Stable internet connection for webhooks
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT ASSETS */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              <h2 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                Meta Account Setup
              </h2>

              {/* 1. Select Business */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#0D1F3D] block">
                  1. Select Business Manager <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Select
                      value={selectedBusiness}
                      onChange={(e) => setSelectedBusiness(e.target.value)}
                      options={[
                        { value: 'Aimbeat Technologies Pvt. Ltd.', label: 'Aimbeat Technologies Pvt. Ltd.' },
                        { value: 'Aimbeat Global Inc.', label: 'Aimbeat Global Inc.' },
                      ]}
                      searchable={false}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Refreshed Business Manager assets')}
                    className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </Button>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Business ID: 123456789012345</span>
              </div>

              {/* 2. Select Pages */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#0D1F3D]">
                    2. Select Facebook Page(s) / Instagram Account(s)
                  </label>
                  <button onClick={() => toast.info('Add Page modal opened')} className="text-[11px] font-bold text-indigo-600 hover:underline">
                    + Add Page / IG Account
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-sm border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedPages.fbPage}
                        onChange={(checked) => setSelectedPages({ ...selectedPages, fbPage: checked })}
                      />
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Facebook className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#0D1F3D] text-xs">Aimbeat Business</span>
                          <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs">
                            Facebook Page
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Page ID: 109876543210987 • Followers: 12.4K</span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      Lead Access Granted
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-sm border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedPages.igAccount}
                        onChange={(checked) => setSelectedPages({ ...selectedPages, igAccount: checked })}
                      />
                      <div className="h-8 w-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                        <Facebook className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#0D1F3D] text-xs">aimbeat_official</span>
                          <span className="bg-pink-100 text-pink-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs">
                            Instagram Account
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">IG ID: 178912345678901 • Followers: 8.7K</span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      Lead Access Granted
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Select Ad Account */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#0D1F3D]">
                    3. Select Ad Account(s)
                  </label>
                  <button onClick={() => toast.info('Add Ad Account modal opened')} className="text-[11px] font-bold text-indigo-600 hover:underline">
                    + Add Ad Account
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 bg-slate-50">
                        <th className="py-2 px-3 text-center">Select</th>
                        <th className="py-2 px-3">Ad Account Name</th>
                        <th className="py-2 px-3 font-mono">Account ID</th>
                        <th className="py-2 px-3">Currency</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="radio"
                            name="adAccount"
                            checked={selectedAdAccount === 'Aimbeat Ads Account'}
                            onChange={() => setSelectedAdAccount('Aimbeat Ads Account')}
                            className="text-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-extrabold text-[#0D1F3D]">
                          Aimbeat Ads Account <span className="bg-purple-100 text-purple-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-xs ml-1">Primary</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">238765432109876</td>
                        <td className="py-2.5 px-3 text-slate-700 font-bold">INR</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentStep(1)}
                  className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50"
                >
                  ← Back
                </Button>
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => setCurrentStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-1.5"
                >
                  Continue →
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                Connection Summary
              </h3>
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Meta Account</span>
                  <span className="text-emerald-700 font-extrabold">Connected ✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Business Manager</span>
                  <span className="font-bold text-[#0D1F3D]">Aimbeat Tech</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Pages / IG</span>
                  <span className="font-bold text-[#0D1F3D]">2 selected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Ad Accounts</span>
                  <span className="font-bold text-[#0D1F3D]">1 selected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: AUTO SETUP REVIEW */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-xs font-extrabold text-emerald-900">Great! Everything looks good.</h3>
                <p className="text-[11px] text-emerald-800 font-medium">
                  We've auto-detected your accounts, forms, and fields. Please review and activate.
                </p>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              <h2 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                Detected Configuration
              </h2>

              {/* 4 Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium block">Business Account</span>
                  <span className="font-extrabold text-[#0D1F3D] block truncate">Aimbeat Tech</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs inline-block">
                    Detected
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium block">Facebook Page</span>
                  <span className="font-extrabold text-[#0D1F3D] block truncate">Aimbeat Business</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs inline-block">
                    Detected
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium block">Ad Account</span>
                  <span className="font-extrabold text-[#0D1F3D] block truncate">Aimbeat Ads</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs inline-block">
                    Detected
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium block">Lead Forms</span>
                  <span className="font-extrabold text-[#0D1F3D] block truncate">3 Active Forms</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs inline-block">
                    Detected
                  </span>
                </div>
              </div>

              {/* Forms Detected (3) & Field Mapping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                {/* Forms Detected */}
                <div className="space-y-2">
                  <span className="font-extrabold text-[#0D1F3D] block">Forms Detected (3)</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 rounded-sm border border-slate-200 bg-slate-50">
                      <span className="font-bold text-[#0D1F3D]">Website Enquiry Form</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs">
                        Active (128 Leads)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-sm border border-slate-200 bg-slate-50">
                      <span className="font-bold text-[#0D1F3D]">Get Offer - Lead Form</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs">
                        Active (84 Leads)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-sm border border-slate-200 bg-slate-50">
                      <span className="font-bold text-[#0D1F3D]">Book a Demo Form</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs">
                        Active (56 Leads)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Auto Mapped Fields */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0D1F3D]">Field Mapping (Auto Mapped)</span>
                    <button onClick={() => toast.info('Customize mapping modal')} className="text-[11px] font-bold text-indigo-600 hover:underline">
                      Customize Mapping ✏️
                    </button>
                  </div>
                  <div className="space-y-1 bg-slate-50 p-2 rounded-sm border border-slate-200 text-[11px]">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500 font-medium">Full Name</span>
                      <span className="text-indigo-700 font-bold">→ Lead Name ✓</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500 font-medium">Email</span>
                      <span className="text-indigo-700 font-bold">→ Email ✓</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500 font-medium">Phone Number</span>
                      <span className="text-indigo-700 font-bold">→ Mobile Number ✓</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500 font-medium">Company Name</span>
                      <span className="text-indigo-700 font-bold">→ Company / Business ✓</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500 font-medium">City</span>
                      <span className="text-indigo-700 font-bold">→ City ✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentStep(2)}
                  className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50"
                >
                  ← Back
                </Button>
                <Button
                  variant="accent"
                  size="md"
                  onClick={handleActivate}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black px-6 py-2.5 text-xs flex items-center gap-2 shadow-md"
                >
                  <Zap className="h-4 w-4" /> Activate Automation ⚡
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                Summary
              </h3>
              <ul className="space-y-2 text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Meta account connected
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> 3 active lead forms found
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Fields 98% auto-mapped
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Duplicate protection enabled
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Real-time sync enabled
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: ACTIVATED & COMPLETE */}
      {currentStep === 4 && (
        <div className="rounded-md border border-emerald-200 bg-white p-8 shadow-xs text-center max-w-2xl mx-auto space-y-5">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Check className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0D1F3D]">Meta Lead Ads Connected!</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              New leads submitted on Facebook & Instagram will now flow directly into SFW CRM in real-time.
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
