import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Globe,
  Sliders,
  Shield,
  Zap,
  Lock,
  Clock,
  MapPin,
  Check,
  Info,
  FileText,
  Upload,
  Save,
  RotateCcw,
  Copy,
  Trash2,
  ExternalLink,
  HelpCircle,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

export function WorkspaceSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Form States
  const [companyName, setCompanyName] = useState('Sunrise Healthcare Pvt Ltd');
  const [shortName, setShortName] = useState('Sunrise Healthcare');
  const [industry, setIndustry] = useState('Pharma & Healthcare');
  const [website, setWebsite] = useState('www.sunrisehealthcare.com');
  const [email, setEmail] = useState('info@sunrisehealthcare.com');
  const [phone, setPhone] = useState('9876543210');

  // Address State
  const [address1, setAddress1] = useState('201, Sunrise Tower, Andheri Kurla Road');
  const [address2, setAddress2] = useState('Andheri East');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('400059');

  // Colors
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  const [logoInLogin, setLogoInLogin] = useState(true);

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16">
      {/* 1. Header Breadcrumb & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Admin & Settings</span>
            <span>›</span>
            <span className="font-extrabold text-[#0D1F3D]">Workspace Settings</span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight mt-1">Workspace Settings</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your workspace profile, preferences and configuration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => toast.info('Viewing preview mode')} className="gap-1.5 font-bold text-slate-700">
            <UserCheck className="h-4 w-4" /> View as Other Role
          </Button>
          <Button variant="accent" size="sm" onClick={() => toast.success('Workspace settings saved')} className="gap-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Form reset to saved defaults')} className="gap-1.5 font-bold text-slate-700">
            <RotateCcw className="h-4 w-4 text-slate-400" /> Reset
          </Button>
        </div>
      </div>

      {/* 2. Sub-Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('profile')}
          className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
            activeTab === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Workspace Profile
        </button>
        <button
          type="button"
          onClick={() => setTab('localization')}
          className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
            activeTab === 'localization' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Localization
        </button>
        <button
          type="button"
          onClick={() => setTab('business-financial')}
          className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
            activeTab === 'business-financial' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Business & Financial
        </button>
        <button
          type="button"
          onClick={() => setTab('preferences')}
          className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
            activeTab === 'preferences' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Preferences
        </button>
        <button
          type="button"
          onClick={() => setTab('policies-security')}
          className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
            activeTab === 'policies-security' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Policies & Security
        </button>
        <button
          type="button"
          onClick={() => setTab('integrations')}
          className={`pb-3 text-xs font-extrabold transition-all border-b-2 ${
            activeTab === 'integrations' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Integrations
        </button>
      </div>

      {/* 3. Main Grid Layout (2/3 Left Main, 1/3 Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT MAIN AREA */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Company Information */}
          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="h-4 w-4 text-indigo-600 shrink-0" />
              <div>
                <h3 className="text-sm font-extrabold text-[#0D1F3D]">Company Information</h3>
                <p className="text-[11px] text-slate-400 font-medium">Basic information about your organization.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Logo Upload Box (Left 4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-slate-100 rounded-sm bg-slate-50/50 space-y-3">
                <div className="flex h-24 w-full items-center justify-center rounded-sm bg-white border border-slate-200 p-2 shadow-xs">
                  <div className="text-center">
                    <p className="font-extrabold text-amber-600 text-sm tracking-tight">SUNRISE</p>
                    <p className="text-[9px] font-bold text-slate-500 tracking-wider">HEALTHCARE</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info('Uploading new logo')} className="w-full text-xs font-bold text-indigo-600 border-indigo-200 bg-white">
                  ↑ Change Logo
                </Button>
                <p className="text-[10px] text-slate-400 font-medium text-center">
                  Recommended 512x512px<br />PNG, JPG up to 2MB
                </p>
              </div>

              {/* Form Fields (Right 8 cols) */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                <Select label="Industry *" value={industry} onChange={(e) => setIndustry(e.target.value)} options={[{ value: 'Pharma & Healthcare', label: 'Pharma & Healthcare' }]} />
                <Input label="Short Name *" value={shortName} onChange={(e) => setShortName(e.target.value)} />
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Tenant Code</label>
                  <input type="text" value="SRHC-TNT" disabled className="w-full h-9 px-3 text-xs font-mono font-bold bg-slate-100 border border-slate-200 text-slate-500 rounded-sm cursor-not-allowed" />
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Used in system URLs and identifiers</span>
                </div>
                <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                <Input label="Primary Contact Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <div className="sm:col-span-2">
                  <Input label="Primary Contact Phone" type="tel" value={`+91 ${phone}`} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Card 2 (Branding) & Card 3 (Workspace Identity) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 2: Branding */}
            <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="h-4 w-4 text-indigo-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-extrabold text-[#0D1F3D]">Branding</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Customize how your brand appears in the application.</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Primary Color</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-sm p-1 bg-slate-50">
                      <span className="h-6 w-6 rounded-xs shrink-0 shadow-xs" style={{ backgroundColor: primaryColor }} />
                      <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full font-mono text-xs font-bold bg-transparent border-none focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Secondary Color</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-sm p-1 bg-slate-50">
                      <span className="h-6 w-6 rounded-xs shrink-0 shadow-xs" style={{ backgroundColor: secondaryColor }} />
                      <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-full font-mono text-xs font-bold bg-transparent border-none focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="font-extrabold text-[#0D1F3D]">Logo in Login</span>
                    <p className="text-[10px] text-slate-400 font-medium">Show custom logo on login screen</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogoInLogin(!logoInLogin)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      logoInLogin ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ${logoInLogin ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="font-extrabold text-[#0D1F3D]">Favicon</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-sm border border-slate-200 bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs">
                      ☀️
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info('Uploading favicon')} className="h-7 text-[11px] font-bold text-indigo-600">Change</Button>
                    <button type="button" className="p-1 text-slate-400 hover:text-slate-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Workspace Identity */}
            <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Globe className="h-4 w-4 text-indigo-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-extrabold text-[#0D1F3D]">Workspace Identity</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Unique identity and classification for your workspace.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">Workspace ID</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-extrabold text-slate-800 text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm">ws_8f3a2d9e-7c61-4b8d-a8c9-4a7f9d2b1e23</span>
                    <button type="button" onClick={() => toast.success('Workspace ID copied')} className="text-slate-400 hover:text-slate-600"><Copy className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-bold">Configuration Version</span>
                    <span className="font-mono font-extrabold text-slate-800 text-sm">v1.2.3</span>
                    <span className="text-[10px] text-slate-400 font-medium block">Updated on 24 May 2026, 10:15 AM</span>
                  </div>
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Up to date</span>
                </div>

                <div className="border-t border-slate-100 pt-2 space-y-1">
                  <span className="text-slate-400 text-[10px] block font-bold">Tenant Created On</span>
                  <span className="font-extrabold text-slate-700 text-xs">24 May 2026, 10:30 AM</span>
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <span className="text-slate-400 text-[10px] block font-bold">Created By (Platform)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-6 w-6 rounded-full bg-[#0D1F3D] text-white font-bold flex items-center justify-center text-[10px]">AS</div>
                    <span className="font-bold text-slate-800 text-xs">Amit Sharma <span className="text-slate-400 font-medium">(Platform Super Admin)</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Address */}
          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
              <div>
                <h3 className="text-sm font-extrabold text-[#0D1F3D]">Address</h3>
                <p className="text-[10px] text-slate-400 font-medium">Registered address of your organization.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input label="Address Line 1" value={address1} onChange={(e) => setAddress1(e.target.value)} />
              </div>
              <Input label="Address Line 2" value={address2} onChange={(e) => setAddress2(e.target.value)} />
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <Select label="State" value={state} onChange={(e) => setState(e.target.value)} options={[{ value: 'Maharashtra', label: 'Maharashtra' }]} />
              <Select label="Country" value={country} onChange={(e) => setCountry(e.target.value)} options={[{ value: 'India', label: 'India' }]} />
              <Input label="PIN Code" value={pincode} onChange={(e) => setPincode(e.target.value)} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR AREA */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Workspace Summary */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">Workspace Summary</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Plan</span>
                <span className="font-extrabold text-[#0D1F3D]">Professional (Yearly) <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200 ml-1">Active</span></span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Subscription Status</span>
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Active</span>
              </div>

              <div className="border-t border-slate-100 pt-2 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Current Period</span>
                  <span className="font-extrabold text-[#0D1F3D]">24 May 2026 – 23 May 2027</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block text-right">29 days remaining</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-500 font-medium">Next Billing Date</span>
                <span className="font-extrabold text-[#0D1F3D]">24 Jun 2026</span>
              </div>

              <div className="border-t border-slate-100 pt-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Users / Seats</span>
                  <span className="font-extrabold text-[#0D1F3D]">126 / 150</span>
                </div>
                <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '84%' }} />
                </div>
                <span className="text-[10px] text-slate-400 font-medium block text-right">84% used</span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => toast.info('Managing subscription')} className="w-full text-xs font-bold text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50">
              Manage Subscription
            </Button>
          </div>

          {/* Card 2: What You Can Edit (Green Soft Box) */}
          <div className="rounded-sm border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-emerald-950">What You Can Edit</h4>
                <p className="text-[10px] text-emerald-900 font-medium mt-0.5">
                  You can update all settings on this page except the fields marked as platform controlled.
                </p>
              </div>
            </div>

            <ul className="space-y-1 text-xs text-emerald-900 font-semibold pt-1">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600" /> Company information</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600" /> Branding</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600" /> Localization</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600" /> Business & Financial settings</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600" /> Workspace preferences</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600" /> Policies & security settings</li>
            </ul>
          </div>

          {/* Card 3: Platform Controlled (Red/Pink Soft Box) */}
          <div className="rounded-sm border border-rose-200 bg-rose-50/40 p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <Lock className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-rose-950">Platform Controlled</h4>
                <p className="text-[10px] text-rose-900 font-medium mt-0.5">
                  These settings are managed by the platform and cannot be changed.
                </p>
              </div>
            </div>

            <ul className="space-y-1 text-xs text-rose-900 font-semibold pt-1">
              <li className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-rose-500" /> Tenant Code</li>
              <li className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-rose-500" /> Workspace ID</li>
              <li className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-rose-500" /> Configuration Version</li>
              <li className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-rose-500" /> Subscription Details</li>
            </ul>
          </div>

          {/* Card 4: Need Help? (Blue Soft Box) */}
          <div className="rounded-sm border border-blue-200 bg-blue-50/40 p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-blue-950">Need Help?</h4>
                <p className="text-[10px] text-blue-900 font-medium mt-0.5">
                  Learn more about workspace settings and best practices.
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => toast.info('Opening help articles')} className="w-fit text-xs font-bold text-blue-600 border-blue-200 bg-white gap-1.5">
              View Help Articles <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
