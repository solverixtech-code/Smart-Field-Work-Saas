import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Lock,
  Clock,
  Shield,
  Save,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';

export default function AutomationSettingsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'General' | 'Lead Capture' | 'Duplicate & Validation' | 'Assignment & Routing' | 'Notifications' | 'SLA & Follow-up' | 'Integrations'
  >('General');

  // Toggle States
  const [realtimeCapture, setRealtimeCapture] = useState(true);
  const [dataValidation, setDataValidation] = useState(true);
  const [duplicateProtection, setDuplicateProtection] = useState(true);
  const [sourceAttribution, setSourceAttribution] = useState(true);
  const [workingHours, setWorkingHours] = useState(true);

  // Form Controls State
  const [captureMode, setCaptureMode] = useState('Real-time (Webhook / Instant)');
  const [fallbackMode, setFallbackMode] = useState('Auto Retry (Every 2 minutes)');
  const [duplicateWindow, setDuplicateWindow] = useState('30 Days');
  const [duplicateAction, setDuplicateAction] = useState('Merge with Existing Lead');
  const [utmCapture, setUtmCapture] = useState('All (Source, Medium, Campaign, Term, Content)');
  const [storeAdDetails, setStoreAdDetails] = useState('Campaign Level');
  const [storeLandingInfo, setStoreLandingInfo] = useState(true);
  const [defaultAssignment, setDefaultAssignment] = useState('Team Queue');
  const [defaultTeam, setDefaultTeam] = useState('Mumbai Sales Team');
  const [unassignedAction, setUnassignedAction] = useState('Add to Unassigned Queue');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata (IST)');
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('08:00 PM');
  const [retentionPeriod, setRetentionPeriod] = useState('3 Years');

  // Checkbox States for Data Validation
  const [validations, setValidations] = useState({
    phone: true,
    email: true,
    spaces: true,
    normalize: true,
    disposable: true,
  });

  const handleSave = () => {
    toast.success('Automation Settings saved successfully!');
  };

  const handleReset = () => {
    toast.info('Settings reset to default values');
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
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/leads/automation')}>
            Lead Automation
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Automation Settings</span>
          <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs ml-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Automation Settings</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Advanced settings to control how leads are captured, processed, and assigned.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset to Default
          </Button>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 pt-1.5 rounded-sm shadow-xs overflow-x-auto custom-scrollbar">
        {(
          [
            'General',
            'Lead Capture',
            'Duplicate & Validation',
            'Assignment & Routing',
            'Notifications',
            'SLA & Follow-up',
            'Integrations',
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-700 bg-slate-50/80 rounded-t-sm'
                  : 'border-transparent text-slate-500 hover:text-[#0D1F3D] hover:border-slate-300'
              }`}
            >
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN SETTINGS GRID: LEFT CONTENT (8 COLS) + RIGHT SIDEBAR (4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Settings Cards Grid (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Row 1: Real-time Lead Capture, Data Validation, Duplicate Protection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Real-time Lead Capture Card */}
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block">Real-time Lead Capture</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-xs mt-0.5 inline-block">
                    Recommended
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRealtimeCapture(!realtimeCapture)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    realtimeCapture ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      realtimeCapture ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <Select
                  label="Capture Mode"
                  value={captureMode}
                  onChange={(e) => setCaptureMode(e.target.value)}
                  options={[
                    { value: 'Real-time (Webhook / Instant)', label: 'Real-time (Webhook / Instant)' },
                    { value: 'Scheduled Batch (5 mins)', label: 'Scheduled Batch (5 mins)' },
                  ]}
                  searchable={true}
                />

                <Select
                  label="Fallback Mode (If real-time fails)"
                  value={fallbackMode}
                  onChange={(e) => setFallbackMode(e.target.value)}
                  options={[
                    { value: 'Auto Retry (Every 2 minutes)', label: 'Auto Retry (Every 2 minutes)' },
                    { value: 'Manual Sync', label: 'Manual Sync' },
                  ]}
                  searchable={true}
                />
              </div>

              <div className="bg-emerald-50 p-2 rounded-sm border border-emerald-100 flex items-center gap-1.5 text-[10px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>All sources are set to capture leads in real-time.</span>
              </div>
            </div>

            {/* Data Validation Card */}
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-[#0D1F3D] block">Data Validation</span>
                <button
                  type="button"
                  onClick={() => setDataValidation(!dataValidation)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    dataValidation ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      dataValidation ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <Checkbox
                  label="Validate Phone Number"
                  checked={validations.phone}
                  onChange={(checked) => setValidations({ ...validations, phone: checked })}
                />
                <Checkbox
                  label="Validate Email Address"
                  checked={validations.email}
                  onChange={(checked) => setValidations({ ...validations, email: checked })}
                />
                <Checkbox
                  label="Remove Extra Spaces"
                  checked={validations.spaces}
                  onChange={(checked) => setValidations({ ...validations, spaces: checked })}
                />
                <Checkbox
                  label="Normalize Data (Name, Email, Phone)"
                  checked={validations.normalize}
                  onChange={(checked) => setValidations({ ...validations, normalize: checked })}
                />
                <Checkbox
                  label="Block Invalid / Disposable Emails"
                  checked={validations.disposable}
                  onChange={(checked) => setValidations({ ...validations, disposable: checked })}
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button onClick={() => toast.info('Manage Validation Rules modal')} className="text-[10px] font-bold text-indigo-600 hover:underline">
                  Manage Validation Rules →
                </button>
              </div>
            </div>

            {/* Duplicate Protection Card */}
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-[#0D1F3D] block">Duplicate Protection</span>
                <button
                  type="button"
                  onClick={() => setDuplicateProtection(!duplicateProtection)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    duplicateProtection ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      duplicateProtection ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Match By</label>
                  <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-sm border border-slate-200 text-[10px] font-bold">
                    <span className="bg-white border border-slate-200 text-[#0D1F3D] px-1.5 py-0.5 rounded-xs">Mobile Number ×</span>
                    <span className="bg-white border border-slate-200 text-[#0D1F3D] px-1.5 py-0.5 rounded-xs">Email Address ×</span>
                  </div>
                </div>

                <Select
                  label="Time Window"
                  value={duplicateWindow}
                  onChange={(e) => setDuplicateWindow(e.target.value)}
                  options={[
                    { value: '30 Days', label: '30 Days' },
                    { value: '60 Days', label: '60 Days' },
                    { value: '90 Days', label: '90 Days' },
                  ]}
                  searchable={true}
                />

                <Select
                  label="Action On Duplicate"
                  value={duplicateAction}
                  onChange={(e) => setDuplicateAction(e.target.value)}
                  options={[
                    { value: 'Merge with Existing Lead', label: 'Merge with Existing Lead' },
                    { value: 'Create Duplicate Flagged', label: 'Create Duplicate Flagged' },
                    { value: 'Skip Duplicate Ingestion', label: 'Skip Duplicate Ingestion' },
                  ]}
                  searchable={true}
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button onClick={() => toast.info('Advanced Duplicate Settings')} className="text-[10px] font-bold text-indigo-600 hover:underline">
                  Advanced Duplicate Settings →
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Lead Source Attribution, Default Lead Owner, Working Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Lead Source Attribution Card */}
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-[#0D1F3D] block">Lead Source Attribution</span>
                <button
                  type="button"
                  onClick={() => setSourceAttribution(!sourceAttribution)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    sourceAttribution ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      sourceAttribution ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <Select
                  label="Capture UTM Parameters"
                  value={utmCapture}
                  onChange={(e) => setUtmCapture(e.target.value)}
                  options={[
                    { value: 'All (Source, Medium, Campaign, Term, Content)', label: 'All (Source, Medium, Campaign, Term, Content)' },
                    { value: 'Basic (Source, Medium)', label: 'Basic (Source, Medium)' },
                  ]}
                  searchable={true}
                />

                <Select
                  label="Store Ad Details"
                  value={storeAdDetails}
                  onChange={(e) => setStoreAdDetails(e.target.value)}
                  options={[
                    { value: 'Campaign Level', label: 'Campaign Level' },
                    { value: 'Ad Set & Ad Level', label: 'Ad Set & Ad Level' },
                  ]}
                  searchable={true}
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-700 font-medium">Store Landing Page / Form Info</span>
                  <button
                    type="button"
                    onClick={() => setStoreLandingInfo(!storeLandingInfo)}
                    className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      storeLandingInfo ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        storeLandingInfo ? 'translate-x-3' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50 p-2 rounded-sm border border-emerald-100 flex items-center gap-1.5 text-[10px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Helps you analyze performance across campaigns.</span>
              </div>
            </div>

            {/* Default Lead Owner Card (WITH AVATARS & SUBLABELS) */}
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
              <div className="border-b border-slate-100 pb-2">
                <span className="font-extrabold text-[#0D1F3D] block">Default Lead Owner</span>
                <span className="text-[10px] text-slate-400 font-medium">Set default team or user when no rule matches.</span>
              </div>

              <div className="space-y-2">
                <Select
                  label="Default Assignment"
                  value={defaultAssignment}
                  onChange={(e) => setDefaultAssignment(e.target.value)}
                  options={[
                    { value: 'Team Queue', label: 'Team Queue' },
                    { value: 'Specific Executive', label: 'Specific Executive' },
                    { value: 'Round Robin', label: 'Round Robin' },
                  ]}
                  searchable={true}
                />

                <Select
                  label="Default Team"
                  value={defaultTeam}
                  onChange={(e) => setDefaultTeam(e.target.value)}
                  options={[
                    { value: 'Mumbai Sales Team', label: 'Mumbai Sales Team', sublabel: 'Team Queue • 12 Executives' },
                    { value: 'Pune Sales Team', label: 'Pune Sales Team', sublabel: 'Team Queue • 8 Executives' },
                    { value: 'Delhi Sales Team', label: 'Delhi Sales Team', sublabel: 'Team Queue • 10 Executives' },
                  ]}
                  searchable={true}
                />

                <Select
                  label="Unassigned Lead Action"
                  value={unassignedAction}
                  onChange={(e) => setUnassignedAction(e.target.value)}
                  options={[
                    { value: 'Add to Unassigned Queue', label: 'Add to Unassigned Queue' },
                    { value: 'Notify Super Admin', label: 'Notify Super Admin' },
                  ]}
                  searchable={true}
                />
              </div>

              <div className="bg-emerald-50 p-2 rounded-sm border border-emerald-100 flex items-center gap-1.5 text-[10px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Leads will never go unassigned.</span>
              </div>
            </div>

            {/* Working Hours Card */}
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-[#0D1F3D] block">Working Hours</span>
                <button
                  type="button"
                  onClick={() => setWorkingHours(!workingHours)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    workingHours ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      workingHours ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <Select
                  label="Time Zone"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  options={[
                    { value: 'Asia/Kolkata (IST)', label: 'Asia/Kolkata (IST)' },
                    { value: 'UTC', label: 'UTC' },
                  ]}
                  searchable={true}
                />

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Working Days</label>
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
                      <span key={d} className="bg-indigo-600 text-white px-1.5 py-0.5 rounded-xs">
                        {d}
                      </span>
                    ))}
                    {['Sat', 'Sun'].map((d) => (
                      <span key={d} className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-xs">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Working Hours</label>
                  <div className="flex items-center gap-1 text-xs">
                    <input
                      type="text"
                      value={workingHoursStart}
                      onChange={(e) => setWorkingHoursStart(e.target.value)}
                      className="w-full rounded-sm border border-slate-200 p-1 text-center font-bold text-[#0D1F3D]"
                    />
                    <span>-</span>
                    <input
                      type="text"
                      value={workingHoursEnd}
                      onChange={(e) => setWorkingHoursEnd(e.target.value)}
                      className="w-full rounded-sm border border-slate-200 p-1 text-center font-bold text-[#0D1F3D]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-2 rounded-sm border border-emerald-100 flex items-center gap-1.5 text-[10px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Leads outside working hours will be queued.</span>
              </div>
            </div>
          </div>

          {/* Row 3: Lead Data Retention */}
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Lead Data Retention
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <Select
                  label="Retention Period"
                  value={retentionPeriod}
                  onChange={(e) => setRetentionPeriod(e.target.value)}
                  options={[
                    { value: '1 Year', label: '1 Year' },
                    { value: '3 Years', label: '3 Years' },
                    { value: '5 Years', label: '5 Years' },
                    { value: 'Forever', label: 'Forever' },
                  ]}
                  searchable={true}
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 flex items-center gap-3">
                <Lock className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block text-xs">Your lead data is safe and secure.</span>
                  <span className="text-[10px] text-slate-500 font-medium">We never delete important data without your permission.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Automation Health & Recommended (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Automation Health Status Card */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Automation Health</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                All Systems Operational
              </span>
            </div>

            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Meta Integration</span>
                <span className="font-extrabold text-emerald-700">Healthy</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Google Ads Integration</span>
                <span className="font-extrabold text-emerald-700">Healthy</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">WhatsApp Integration</span>
                <span className="font-extrabold text-emerald-700">Healthy</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Website Integration</span>
                <span className="font-extrabold text-emerald-700">Healthy</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Lead Capture</span>
                <span className="font-bold text-slate-800">Real-time</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Assignment Engine</span>
                <span className="font-bold text-emerald-700">Active</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate('/admin/leads/integrations')}
                className="bg-white text-indigo-700 border-indigo-200 font-bold hover:bg-indigo-50"
              >
                View Health Dashboard →
              </Button>
            </div>
          </div>

          {/* Recommended for You Card */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Recommended for You
            </h3>

            <ul className="space-y-2 text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Enable real-time capture for faster lead processing.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Set working hours to improve auto assignment accuracy.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Review duplicate rules to avoid missing important leads.</span>
              </li>
            </ul>

            <div className="pt-2">
              <button onClick={() => toast.info('Best Practices Guide')} className="text-[11px] font-bold text-indigo-600 hover:underline">
                View Best Practices →
              </button>
            </div>
          </div>

          {/* Save Changes Floating Button */}
          <Button
            variant="accent"
            size="md"
            fullWidth
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-md"
          >
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
