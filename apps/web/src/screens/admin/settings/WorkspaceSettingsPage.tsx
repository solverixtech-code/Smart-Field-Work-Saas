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
  Bell,
  Languages,
  Banknote,
  Settings,
  Key,
  Plug,
  Calendar,
  Eye,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

// ─── Toggle Switch (reusable within this file) ───
function ToggleSwitch({ checked, onChange, label, description }: { checked: boolean; onChange: (val: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="font-extrabold text-[#0D1F3D] text-xs">{label}</span>
        {description && <p className="text-[10px] text-slate-500 font-medium">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          checked ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

// ─── Tab: Workspace Profile ───
function ProfileTab() {
  const [companyName, setCompanyName] = useState('Sunrise Healthcare Pvt Ltd');
  const [shortName, setShortName] = useState('Sunrise Healthcare');
  const [industry, setIndustry] = useState('Pharma & Healthcare');
  const [website, setWebsite] = useState('www.sunrisehealthcare.com');
  const [email, setEmail] = useState('info@sunrisehealthcare.com');
  const [phone, setPhone] = useState('9876543210');

  const [address1, setAddress1] = useState('201, Sunrise Tower, Andheri Kurla Road');
  const [address2, setAddress2] = useState('Andheri East');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('400059');

  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  const [logoInLogin, setLogoInLogin] = useState(true);

  return (
    <>
      {/* Card 1: Company Information */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Company Information</h3>
            <p className="text-[11px] text-slate-500 font-medium">Basic information about your organization.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Logo Upload Box */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-slate-100 rounded-sm bg-slate-50/50 space-y-3">
            <div className="flex h-24 w-full items-center justify-center rounded-sm bg-white border border-slate-200 p-2 shadow-xs">
              <div className="text-center">
                <p className="font-extrabold text-amber-600 text-sm tracking-tight">SUNRISE</p>
                <p className="text-[9px] font-bold text-slate-600 tracking-wider">HEALTHCARE</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info('Uploading new logo')} className="w-full text-xs font-bold text-indigo-600 border-indigo-200 bg-white">
              ↑ Change Logo
            </Button>
            <p className="text-[10px] text-slate-500 font-medium text-center">
              Recommended 512×512px<br />PNG, JPG up to 2 MB
            </p>
          </div>

          {/* Form Fields */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <Select
              label="Industry *"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              searchable={true}
              options={[
                { value: 'Pharma & Healthcare', label: 'Pharma & Healthcare' },
                { value: 'FMCG & Consumer Goods', label: 'FMCG & Consumer Goods' },
                { value: 'Solar & Renewable Energy', label: 'Solar & Renewable Energy' },
                { value: 'Manufacturing & Industrial', label: 'Manufacturing & Industrial' },
              ]}
            />
            <Input label="Short Name *" value={shortName} onChange={(e) => setShortName(e.target.value)} />
            <div>
              <label className="text-xs font-semibold text-[#0B2E6B] block mb-1.5">Tenant Code</label>
              <div className="flex rounded-sm border border-slate-200 bg-slate-100 overflow-hidden h-10">
                <span className="bg-slate-100 border-r border-slate-200 px-3 flex items-center text-xs font-bold text-slate-600">SFW-TNT-</span>
                <input type="text" value="SRHC" disabled className="flex-1 px-3 text-xs font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">Used in system URLs and identifiers</span>
            </div>
            <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            <Input label="Primary Contact Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#0B2E6B] block mb-1.5">Primary Contact Phone</label>
              <div className="flex h-10 w-full rounded-sm border border-slate-200 bg-[#F8FAFC] overflow-hidden focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
                <span className="bg-slate-100/80 border-r border-slate-200 px-3 flex items-center text-xs font-bold text-slate-700">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 px-3 text-xs font-semibold text-[#0D1F3D] bg-transparent placeholder-slate-400 focus:outline-none"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Branding & Workspace Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Branding */}
        <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Branding</h3>
              <p className="text-[10px] text-slate-500 font-medium">Customize how your brand appears in the application.</p>
            </div>
          </div>

          {/* Color Pickers */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Primary Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0B2E6B] block">Primary Color</label>
                <div className="flex items-center h-10 rounded-sm border border-slate-200 bg-[#F8FAFC] overflow-hidden focus-within:border-[#0D1F3D] focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
                  <label className="relative h-full w-10 shrink-0 cursor-pointer border-r border-slate-200" style={{ backgroundColor: primaryColor }}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value.toUpperCase())}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v.match(/^#[0-9A-Fa-f]{0,6}$/)) setPrimaryColor(v.toUpperCase());
                    }}
                    maxLength={7}
                    className="flex-1 px-3 text-xs font-mono font-bold text-[#0D1F3D] bg-transparent focus:outline-none"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0B2E6B] block">Secondary Color</label>
                <div className="flex items-center h-10 rounded-sm border border-slate-200 bg-[#F8FAFC] overflow-hidden focus-within:border-[#0D1F3D] focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
                  <label className="relative h-full w-10 shrink-0 cursor-pointer border-r border-slate-200" style={{ backgroundColor: secondaryColor }}>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value.toUpperCase())}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v.match(/^#[0-9A-Fa-f]{0,6}$/)) setSecondaryColor(v.toUpperCase());
                    }}
                    maxLength={7}
                    className="flex-1 px-3 text-xs font-mono font-bold text-[#0D1F3D] bg-transparent focus:outline-none"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            {/* Live Brand Preview */}
            <div className="rounded-sm border border-slate-100 bg-slate-50/60 p-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 block">Live Preview</span>
              <div className="flex items-center gap-2">
                <div className="h-7 rounded-sm px-3 flex items-center text-[11px] font-bold text-white shadow-xs" style={{ backgroundColor: primaryColor }}>Primary Button</div>
                <div className="h-7 rounded-sm px-3 flex items-center text-[11px] font-bold text-white shadow-xs" style={{ backgroundColor: secondaryColor }}>Secondary</div>
                <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-slate-200">
                  <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: primaryColor }} />
                </div>
              </div>
            </div>
          </div>

          {/* Toggles & Favicon */}
          <div className="space-y-3.5 border-t border-slate-100 pt-4">
            <ToggleSwitch checked={logoInLogin} onChange={setLogoInLogin} label="Logo in Login" description="Show custom logo on login screen" />

            <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
              <div>
                <span className="font-extrabold text-[#0D1F3D] text-xs">Favicon</span>
                <p className="text-[10px] text-slate-500 font-medium">Browser tab icon (16×16px)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-sm border border-slate-200 bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs">
                  ☀️
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info('Uploading favicon')} className="h-7 text-[11px] font-bold text-indigo-600">Change</Button>
                <button type="button" onClick={() => toast.info('Favicon removed')} className="p-1 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Identity */}
        <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Workspace Identity</h3>
              <p className="text-[10px] text-slate-500 font-medium">Unique identity and classification for your workspace.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Workspace ID</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-extrabold text-[#0D1F3D] text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm">ws_8f3a2d9e-7c61-4b8d</span>
                <button type="button" onClick={() => { navigator.clipboard.writeText('ws_8f3a2d9e-7c61-4b8d-a8c9-4a7f9d2b1e23'); toast.success('Workspace ID copied'); }} className="text-slate-400 hover:text-indigo-600 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Configuration Version</span>
                <span className="font-mono font-extrabold text-[#0D1F3D] text-sm">v1.2.3</span>
                <span className="text-[10px] text-slate-500 font-medium block">Updated on 24 May 2026, 10:15 AM</span>
              </div>
              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Up to date</span>
            </div>

            <div className="border-t border-slate-100 pt-2 space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Tenant Created On</span>
              <span className="font-extrabold text-[#0D1F3D] text-xs">24 May 2026, 10:30 AM</span>
            </div>

            <div className="border-t border-slate-100 pt-2">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Created By (Platform)</span>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#0D1F3D] text-white font-bold flex items-center justify-center text-[10px]">AS</div>
                <span className="font-bold text-[#0D1F3D] text-xs">Amit Sharma <span className="text-slate-500 font-medium">(Platform Super Admin)</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Address */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Address</h3>
            <p className="text-[10px] text-slate-500 font-medium">Registered address of your organization.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input label="Address Line 1" value={address1} onChange={(e) => setAddress1(e.target.value)} />
          </div>
          <Input label="Address Line 2" value={address2} onChange={(e) => setAddress2(e.target.value)} />
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Select label="State" value={state} onChange={(e) => setState(e.target.value)} searchable={true} options={[{ value: 'Maharashtra', label: 'Maharashtra' }, { value: 'Delhi', label: 'Delhi' }, { value: 'Karnataka', label: 'Karnataka' }]} />
          <Select label="Country" value={country} onChange={(e) => setCountry(e.target.value)} searchable={true} options={[{ value: 'India', label: 'India' }, { value: 'United States', label: 'United States' }]} />
          <Input label="PIN Code" value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </div>
      </div>
    </>
  );
}

// ─── Tab: Localization ───
function LocalizationTab() {
  const [timezone, setTimezone] = useState('(GMT+05:30) Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY');
  const [timeFormat, setTimeFormat] = useState('12-hour (hh:mm AM/PM)');
  const [language, setLanguage] = useState('English');
  const [weekStart, setWeekStart] = useState('Monday');
  const [numberFormat, setNumberFormat] = useState('1,23,456.78 (Indian)');

  return (
    <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Languages className="h-4 w-4 text-indigo-600 shrink-0" />
        <div>
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Localization Settings</h3>
          <p className="text-[11px] text-slate-500 font-medium">Configure date, time, language and regional preferences for your workspace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          label="Timezone *"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          searchable={true}
          options={[
            { value: '(GMT+05:30) Asia/Kolkata', label: '(GMT+05:30) Asia/Kolkata' },
            { value: '(GMT+00:00) UTC', label: '(GMT+00:00) UTC' },
            { value: '(GMT-05:00) America/New_York', label: '(GMT-05:00) America/New_York' },
            { value: '(GMT+01:00) Europe/London', label: '(GMT+01:00) Europe/London' },
          ]}
        />
        <Select
          label="Date Format *"
          value={dateFormat}
          onChange={(e) => setDateFormat(e.target.value)}
          searchable={true}
          options={[
            { value: 'DD MMM YYYY', label: 'DD MMM YYYY (27 Aug 2026)' },
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (08/27/2026)' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-08-27)' },
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (27/08/2026)' },
          ]}
        />
        <Select
          label="Time Format *"
          value={timeFormat}
          onChange={(e) => setTimeFormat(e.target.value)}
          searchable={true}
          options={[
            { value: '12-hour (hh:mm AM/PM)', label: '12-hour (hh:mm AM/PM)' },
            { value: '24-hour (HH:mm)', label: '24-hour (HH:mm)' },
          ]}
        />
        <Select
          label="Primary Language *"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          searchable={true}
          options={[
            { value: 'English', label: 'English' },
            { value: 'Hindi', label: 'Hindi' },
            { value: 'Marathi', label: 'Marathi' },
          ]}
        />
        <Select
          label="Week Start Day *"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          searchable={true}
          options={[
            { value: 'Monday', label: 'Monday' },
            { value: 'Sunday', label: 'Sunday' },
            { value: 'Saturday', label: 'Saturday' },
          ]}
        />
        <Select
          label="Number Format *"
          value={numberFormat}
          onChange={(e) => setNumberFormat(e.target.value)}
          searchable={true}
          options={[
            { value: '1,23,456.78 (Indian)', label: '1,23,456.78 (Indian)' },
            { value: '123,456.78 (International)', label: '123,456.78 (International)' },
          ]}
        />
      </div>

      <div className="rounded-sm border border-purple-100 bg-[#F4F0FF] p-4 text-xs space-y-1.5">
        <p className="font-extrabold text-purple-950 flex items-center gap-1.5">
          <Info className="h-4 w-4 text-purple-600" /> About Localization
        </p>
        <p className="text-[11px] text-purple-900 font-medium">
          These settings affect how dates, times, numbers, and currency values are displayed across the entire workspace for all users.
        </p>
      </div>
    </div>
  );
}

// ─── Tab: Business & Financial ───
function BusinessFinancialTab() {
  const [currency, setCurrency] = useState('INR - Indian Rupee (₹)');
  const [fyStart, setFyStart] = useState('April');
  const [gstNumber, setGstNumber] = useState('27ABCDE1234F1ZH');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [billingAddress, setBillingAddress] = useState('201, Sunrise Tower, Andheri Kurla Road, Andheri East, Mumbai 400059');
  const [autoInvoice, setAutoInvoice] = useState(true);

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Banknote className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Financial Settings</h3>
            <p className="text-[11px] text-slate-500 font-medium">Currency, tax identifiers, and financial year configuration.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Currency *"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            searchable={true}
            options={[
              { value: 'INR - Indian Rupee (₹)', label: 'INR - Indian Rupee (₹)' },
              { value: 'USD - US Dollar ($)', label: 'USD - US Dollar ($)' },
              { value: 'EUR - Euro (€)', label: 'EUR - Euro (€)' },
            ]}
          />
          <Select
            label="Financial Year Start *"
            value={fyStart}
            onChange={(e) => setFyStart(e.target.value)}
            searchable={true}
            options={[
              { value: 'January', label: 'January' },
              { value: 'April', label: 'April' },
              { value: 'July', label: 'July' },
            ]}
          />
          <Input label="GST / Tax ID" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
          <Input label="PAN Number" value={panNumber} onChange={(e) => setPanNumber(e.target.value)} />
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Billing Information</h3>
            <p className="text-[11px] text-slate-500 font-medium">Billing address and invoice preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#0B2E6B] block mb-1.5">Billing Address</label>
            <textarea
              rows={2}
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-[#F8FAFC] p-3 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D1F3D] transition-all"
            />
          </div>
          <ToggleSwitch checked={autoInvoice} onChange={setAutoInvoice} label="Auto-Generate Monthly Invoice" description="Automatically generate invoices on the billing date each month" />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Preferences ───
function PreferencesTab() {
  const [defaultLandingPage, setDefaultLandingPage] = useState('Dashboard');
  const [sessionTimeout, setSessionTimeout] = useState('30 minutes');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [showMapView, setShowMapView] = useState(true);
  const [compactTable, setCompactTable] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">General Preferences</h3>
            <p className="text-[11px] text-slate-500 font-medium">Default workspace behavior and display settings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Default Landing Page"
            value={defaultLandingPage}
            onChange={(e) => setDefaultLandingPage(e.target.value)}
            searchable={true}
            options={[
              { value: 'Dashboard', label: 'Dashboard' },
              { value: 'Leads', label: 'Leads' },
              { value: 'Field Visits', label: 'Field Visits' },
              { value: 'Reports', label: 'Reports' },
            ]}
          />
          <Select
            label="Session Timeout"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            searchable={true}
            options={[
              { value: '15 minutes', label: '15 minutes' },
              { value: '30 minutes', label: '30 minutes' },
              { value: '1 hour', label: '1 hour' },
              { value: '4 hours', label: '4 hours' },
            ]}
          />
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Notification Preferences</h3>
            <p className="text-[11px] text-slate-500 font-medium">Default notification settings for all users in this workspace.</p>
          </div>
        </div>

        <div className="space-y-3">
          <ToggleSwitch checked={emailNotifications} onChange={setEmailNotifications} label="Email Notifications" description="Send email alerts for important updates" />
          <div className="border-t border-slate-100 pt-3">
            <ToggleSwitch checked={pushNotifications} onChange={setPushNotifications} label="Push Notifications" description="Browser and mobile push notifications" />
          </div>
          <div className="border-t border-slate-100 pt-3">
            <ToggleSwitch checked={dailyDigest} onChange={setDailyDigest} label="Daily Digest Email" description="Send a summary email at the end of each day" />
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Eye className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Display Preferences</h3>
            <p className="text-[11px] text-slate-500 font-medium">Default view settings applied workspace-wide.</p>
          </div>
        </div>

        <div className="space-y-3">
          <ToggleSwitch checked={showMapView} onChange={setShowMapView} label="Show Map View in Field Visits" description="Enable the live map view by default for field tracking" />
          <div className="border-t border-slate-100 pt-3">
            <ToggleSwitch checked={compactTable} onChange={setCompactTable} label="Compact Table Mode" description="Use smaller row heights in data tables by default" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Policies & Security ───
function PoliciesSecurityTab() {
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [passwordExpiry, setPasswordExpiry] = useState('90 days');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [geoFenceAttendance, setGeoFenceAttendance] = useState(true);
  const [forceLogoutOnInactivity, setForceLogoutOnInactivity] = useState(true);

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Authentication & Security</h3>
            <p className="text-[11px] text-slate-500 font-medium">Password policies, 2FA, and access control settings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Minimum Password Length" type="number" value={passwordMinLength} onChange={(e) => setPasswordMinLength(e.target.value)} />
          <Select
            label="Password Expiry"
            value={passwordExpiry}
            onChange={(e) => setPasswordExpiry(e.target.value)}
            searchable={true}
            options={[
              { value: '30 days', label: '30 days' },
              { value: '60 days', label: '60 days' },
              { value: '90 days', label: '90 days' },
              { value: 'Never', label: 'Never' },
            ]}
          />
          <Select
            label="Max Login Attempts"
            value={maxLoginAttempts}
            onChange={(e) => setMaxLoginAttempts(e.target.value)}
            searchable={true}
            options={[
              { value: '3', label: '3 attempts' },
              { value: '5', label: '5 attempts' },
              { value: '10', label: '10 attempts' },
            ]}
          />
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <ToggleSwitch checked={enforce2FA} onChange={setEnforce2FA} label="Enforce Two-Factor Authentication" description="Require all users to enable 2FA for account access" />
          <div className="border-t border-slate-100 pt-3">
            <ToggleSwitch checked={forceLogoutOnInactivity} onChange={setForceLogoutOnInactivity} label="Force Logout on Inactivity" description="Automatically log out users after the session timeout period" />
          </div>
          <div className="border-t border-slate-100 pt-3">
            <ToggleSwitch checked={ipWhitelist} onChange={setIpWhitelist} label="IP Whitelist Restriction" description="Only allow login from whitelisted IP addresses" />
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Field Policies</h3>
            <p className="text-[11px] text-slate-500 font-medium">Location and attendance enforcement policies.</p>
          </div>
        </div>

        <ToggleSwitch checked={geoFenceAttendance} onChange={setGeoFenceAttendance} label="Geofence Attendance Check-in" description="Require field executives to be within geofenced zones for attendance" />
      </div>
    </div>
  );
}

// ─── Tab: Integrations ───
function IntegrationsTab() {
  const integrations = [
    { name: 'WhatsApp Business API', desc: 'Automated messages, lead capture, and team notifications via WhatsApp.', status: 'Connected', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '💬' },
    { name: 'Google Maps Platform', desc: 'Route optimization, geofencing, and live location tracking.', status: 'Connected', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🗺️' },
    { name: 'Razorpay Payment Gateway', desc: 'Collect online payments, subscription billing, and invoicing.', status: 'Connected', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '💳' },
    { name: 'Slack Notifications', desc: 'Send real-time alerts and reports to Slack channels.', status: 'Not Connected', statusColor: 'bg-slate-50 text-slate-500 border-slate-200', icon: '🔔' },
    { name: 'Zoho CRM Sync', desc: 'Two-way sync leads, contacts, and deals with Zoho CRM.', status: 'Not Connected', statusColor: 'bg-slate-50 text-slate-500 border-slate-200', icon: '🔄' },
    { name: 'Custom Webhook', desc: 'Send event payloads to any external URL via HTTP webhooks.', status: 'Not Connected', statusColor: 'bg-slate-50 text-slate-500 border-slate-200', icon: '🔗' },
  ];

  return (
    <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Integrations</h3>
            <p className="text-[11px] text-slate-500 font-medium">Connect third-party services and APIs to your workspace.</p>
          </div>
        </div>
        <span className="rounded-sm bg-indigo-50 px-3 py-1 text-[10px] font-extrabold text-indigo-700 border border-indigo-200">
          {integrations.filter(i => i.status === 'Connected').length} / {integrations.length} Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => (
          <div key={item.name} className="rounded-sm border border-slate-200 p-4 space-y-3 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{item.icon}</span>
                <h4 className="text-xs font-extrabold text-[#0D1F3D]">{item.name}</h4>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-snug">{item.desc}</p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${item.statusColor}`}>
                {item.status}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info(item.status === 'Connected' ? `Managing ${item.name}` : `Connecting ${item.name}`)}
                className="h-7 text-[11px] font-bold text-indigo-600"
              >
                {item.status === 'Connected' ? 'Manage' : 'Connect'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Right Sidebar (always visible) ───
function RightSidebar() {
  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Workspace Summary */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">Workspace Summary</h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Plan</span>
            <span className="font-extrabold text-[#0D1F3D]">Professional (Yearly) <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200 ml-1">Active</span></span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Subscription Status</span>
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Active</span>
          </div>

          <div className="border-t border-slate-100 pt-2 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Current Period</span>
              <span className="font-extrabold text-[#0D1F3D]">24 May 2026 – 23 May 2027</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium block text-right">29 days remaining</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-slate-600 font-medium">Next Billing Date</span>
            <span className="font-extrabold text-[#0D1F3D]">24 Jun 2026</span>
          </div>

          <div className="border-t border-slate-100 pt-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Users / Seats</span>
              <span className="font-extrabold text-[#0D1F3D]">126 / 150</span>
            </div>
            <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '84%' }} />
            </div>
            <span className="text-[10px] text-slate-500 font-medium block text-right">84% used</span>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => toast.info('Managing subscription')} className="w-full text-xs font-bold text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50">
          Manage Subscription
        </Button>
      </div>

      {/* What You Can Edit */}
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

      {/* Platform Controlled */}
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

      {/* Need Help */}
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
  );
}

// ─── MAIN EXPORT ───
export function WorkspaceSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'profile', label: 'Workspace Profile' },
    { id: 'localization', label: 'Localization' },
    { id: 'business-financial', label: 'Business & Financial' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'policies-security', label: 'Policies & Security' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16">
      {/* Header */}
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

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-[#0D1F3D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'localization' && <LocalizationTab />}
          {activeTab === 'business-financial' && <BusinessFinancialTab />}
          {activeTab === 'preferences' && <PreferencesTab />}
          {activeTab === 'policies-security' && <PoliciesSecurityTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
        </div>

        <RightSidebar />
      </div>
    </div>
  );
}
