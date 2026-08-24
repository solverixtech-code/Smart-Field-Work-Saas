import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  MessageSquare,
  Shield,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Check,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ConnectWhatsAppWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedNumber, setSelectedNumber] = useState('+91 98765 43210');

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
          <span className="text-[#0D1F3D] font-bold">WhatsApp</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Connect WhatsApp Business</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Connect your WhatsApp Business API to automatically capture enquiries and convert them into leads.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/leads/integrations')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50"
          >
            ← Back to Connect Sources
          </Button>
        </div>
      </div>

      {/* STEPPER HEADER PROGRESS BAR */}
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto relative">
          <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />
          <div
            className="absolute left-6 top-4 h-0.5 bg-emerald-600 transition-all duration-300 -z-0"
            style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%' }}
          />

          {[
            { step: 1, label: 'Connect' },
            { step: 2, label: 'Number Setup' },
            { step: 3, label: 'Rules & Mapping' },
            { step: 4, label: 'Complete' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-1 z-10 bg-white px-2">
              <div
                className={`h-8 w-8 rounded-full font-extrabold text-xs flex items-center justify-center transition-colors ${
                  currentStep >= item.step ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-300'
                }`}
              >
                {currentStep > item.step ? <Check className="h-4 w-4" /> : item.step}
              </div>
              <span className={`text-xs font-semibold ${currentStep >= item.step ? 'text-[#0D1F3D] font-extrabold' : 'text-slate-600'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: ENABLE WHATSAPP API */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <h2 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                Connect in 3 Simple Steps
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-sm border border-slate-200 bg-slate-50/70">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <span className="font-extrabold text-[#0D1F3D] text-xs block">1. Enable WhatsApp Business API</span>
                    <span className="text-xs text-slate-600 font-medium">You'll be redirected to Facebook to connect your WhatsApp Business Account.</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">1 min</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-sm border border-slate-200 bg-slate-50/70">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <span className="font-extrabold text-[#0D1F3D] text-xs block">2. Verify Your Business</span>
                    <span className="text-xs text-slate-600 font-medium">We will verify your business and fetch your WhatsApp phone numbers.</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">1 min</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-sm border border-slate-200 bg-slate-50/70">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <span className="font-extrabold text-[#0D1F3D] text-xs block">3. Select Phone Number</span>
                    <span className="text-xs text-slate-600 font-medium">Choose the WhatsApp number from which you want to receive leads.</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">1 min</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col items-center gap-2">
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => {
                    toast.success('WhatsApp API Authorized!');
                    setCurrentStep(2);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-2.5 text-xs flex items-center gap-2 shadow-md"
                >
                  <MessageSquare className="h-4 w-4" /> Connect WhatsApp Business
                </Button>
                <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                  <Lock className="h-3 w-3 text-slate-500" /> You will be redirected to Facebook to authorize securely
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                What happens after connection?
              </h3>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> All new WhatsApp enquiries will be captured automatically.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> We will detect new vs existing customers automatically.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Conversation history will be attached to the lead.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: NUMBER SETUP */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              <h2 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                WhatsApp Number Setup
              </h2>

              {/* WABA Account */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#0D1F3D] block">
                  1. WhatsApp Business Account (WABA)
                </label>
                <div className="p-3 rounded-sm border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
                      AB
                    </div>
                    <div>
                      <span className="font-extrabold text-[#0D1F3D] text-xs block">Aimbeat Business WABA</span>
                      <span className="text-xs text-slate-700 font-mono font-bold">ID: 123456789012345</span>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    Connected ✓
                  </span>
                </div>
              </div>

              {/* Select Number */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#0D1F3D]">
                    2. Select WhatsApp Business Phone Number
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Refreshed phone numbers')}
                    className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh Numbers
                  </Button>
                </div>

                <div className="space-y-2">
                  <div
                    onClick={() => setSelectedNumber('+91 98765 43210')}
                    className={`p-3.5 rounded-sm border cursor-pointer flex items-center justify-between ${
                      selectedNumber === '+91 98765 43210'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="waNum"
                        checked={selectedNumber === '+91 98765 43210'}
                        onChange={() => setSelectedNumber('+91 98765 43210')}
                        className="text-emerald-600"
                      />
                      <MessageSquare className="h-5 w-5 text-emerald-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">+91 98765 43210</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs">
                            Active
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 font-medium">Aimbeat Official Display Name</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-right">
                      <div>
                        <span className="text-xs text-slate-600 block font-medium">Quality Rating</span>
                        <span className="font-bold text-emerald-600">High</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-600 block font-medium">Messaging Limit</span>
                        <span className="font-bold text-slate-800">1,000 / day</span>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedNumber('+91 91234 56789')}
                    className={`p-3.5 rounded-sm border cursor-pointer flex items-center justify-between ${
                      selectedNumber === '+91 91234 56789'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="waNum"
                        checked={selectedNumber === '+91 91234 56789'}
                        onChange={() => setSelectedNumber('+91 91234 56789')}
                        className="text-emerald-600"
                      />
                      <MessageSquare className="h-5 w-5 text-emerald-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">+91 91234 56789</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-xs">
                            Active
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 font-medium">Sales Support Display Name</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-right">
                      <div>
                        <span className="text-xs text-slate-600 block font-medium">Quality Rating</span>
                        <span className="font-bold text-amber-600">Medium</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-600 block font-medium">Messaging Limit</span>
                        <span className="font-bold text-slate-800">250 / day</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Webhook Configuration Auto */}
              <div className="p-3.5 rounded-sm bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs font-semibold text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Webhook is automatically configured to receive messages and status updates in real-time.</span>
                </div>
                <button onClick={() => toast.info('Webhook details modal')} className="text-indigo-700 font-extrabold hover:underline">
                  View Details
                </button>
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
                  onClick={() => {
                    setCurrentStep(4);
                    toast.success('WhatsApp Business API connected!');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5"
                >
                  Save & Continue →
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
                  <span className="font-medium">WABA Account</span>
                  <span className="text-emerald-700 font-extrabold">Connected ✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Selected Number</span>
                  <span className="font-mono font-bold text-[#0D1F3D]">{selectedNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Webhook Status</span>
                  <span className="text-emerald-700 font-bold">Configured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 COMPLETE */}
      {currentStep === 4 && (
        <div className="rounded-md border border-emerald-200 bg-white p-8 shadow-xs text-center max-w-2xl mx-auto space-y-5">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Check className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0D1F3D]">WhatsApp Business Connected!</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              New inbound WhatsApp chats and click-to-WhatsApp enquiries will automatically convert into leads in real-time.
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
