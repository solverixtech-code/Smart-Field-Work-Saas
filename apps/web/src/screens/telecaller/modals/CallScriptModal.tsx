import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Copy, Check, MessageSquare, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface CallScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallScriptModal: React.FC<CallScriptModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cold' | 'demo' | 'price' | 'email'>('cold');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const scripts = {
    cold: {
      title: 'Cold Outreach Discovery Script',
      opening: `Hi [Lead Name], this is Neha from Smart Field Work. I noticed your team manages field operations and sales reps. Am I catching you at a good time?`,
      pitch: `We help field sales teams track live executive routes, automate daily visits, and boost demo conversions by up to 35%. I wanted to ask—how are you currently tracking field visit completions?`,
      qualifyingQuestions: [
        'How many field executives or sales representatives are in your team?',
        'Are you currently using GPS tracking or manual WhatsApp updates?',
        'What is your biggest bottleneck in converting field visits to closed sales?',
      ],
      closing: `Got it! Based on what you shared, our 15-minute live interactive demo will show you exactly how to automate this. Would tomorrow 11 AM or 3 PM work better for you?`,
    },
    demo: {
      title: 'Product Demo Pitch Script',
      opening: `Thanks for joining! Today I'll show you how Visiblo Smart Field Work solves route tracking, visit verification, and sales target automation in under 10 minutes.`,
      pitch: `Our clients typically reduce mileage costs by 22% and eliminate fake visit logs completely using our geofenced check-ins.`,
      qualifyingQuestions: [
        'Would your managers prefer real-time location alerts or daily attendance reports?',
        'Do you set monthly sales targets per executive or per team?',
      ],
      closing: `Let's schedule a 3-day trial setup with your team lead so you can test it live in the field.`,
    },
    price: {
      title: 'Objection: "Your Price is Too High"',
      opening: `I completely understand budget is top of mind. Many of our enterprise clients said the same before seeing our ROI data.`,
      pitch: `By stopping unauthorized travel claims and increasing daily visit capacity from 8 to 12 calls per rep, the platform pays for itself within the first 14 days of deployment.`,
      qualifyingQuestions: [
        'If we could guarantee a 20% increase in daily visit volume, would that justify the cost?',
      ],
      closing: `Let me apply our custom slab incentive discount for your team size. Shall I send the updated commercial proposal?`,
    },
    email: {
      title: 'Objection: "Just Send Me an Email"',
      opening: `I'll gladly send over our executive summary PDF right away!`,
      pitch: `To make sure I attach the exact case study for your industry, are you more focused on field visit tracking or commission incentive rules?`,
      qualifyingQuestions: [
        'What is your direct WhatsApp number so I can send the quick 2-minute video preview as well?',
      ],
      closing: `I'll send the email right now. Let's schedule a 2-minute call on Thursday at 4 PM to confirm you received it—does that sound good?`,
    },
  };

  const currentScript = scripts[activeTab];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Script copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#0D1F3D] text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-extrabold text-white">Telecaller Call Scripts & Objection Helper</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('cold')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'cold' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cold Outreach
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'demo' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Demo Pitch
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('price')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'price' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Price Objection
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'email' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Send Email Objection
          </button>
        </div>

        {/* Script Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">{currentScript.title}</h3>
            <button
              type="button"
              onClick={() => handleCopy(`${currentScript.opening}\n\n${currentScript.pitch}\n\n${currentScript.closing}`)}
              className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors border border-red-200"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Script'}</span>
            </button>
          </div>

          {/* 1. Opening Hook */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">1. Opening Hook</span>
            <p className="text-slate-800 font-medium leading-relaxed">{currentScript.opening}</p>
          </div>

          {/* 2. Value Proposition */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">2. Value Pitch</span>
            <p className="text-slate-800 font-medium leading-relaxed">{currentScript.pitch}</p>
          </div>

          {/* 3. Discovery Questions */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 space-y-1.5">
            <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">3. Qualifying Questions</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-800 font-medium">
              {currentScript.qualifyingQuestions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>

          {/* 4. Call to Action / Closing */}
          <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">4. Call to Action / Closing</span>
            <p className="text-slate-800 font-bold leading-relaxed">{currentScript.closing}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
