import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Target,
  Globe,
  MessageSquare,
  Facebook,
  Search,
  Instagram,
  Users,
  Mail,
  PhoneCall,
  Calendar,
  CheckCircle2,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

const AVAILABLE_ICONS = [
  { name: 'Globe', label: 'Website / Internet', icon: Globe },
  { name: 'MessageSquare', label: 'WhatsApp / Chat', icon: MessageSquare },
  { name: 'Facebook', label: 'Facebook / Meta', icon: Facebook },
  { name: 'Search', label: 'Google Search / Ads', icon: Search },
  { name: 'Instagram', label: 'Instagram Ads', icon: Instagram },
  { name: 'Users', label: 'Referral / Partner', icon: Users },
  { name: 'Mail', label: 'Email Campaign', icon: Mail },
  { name: 'PhoneCall', label: 'Telecalling / Call', icon: PhoneCall },
  { name: 'Calendar', label: 'Events / Offline', icon: Calendar },
];

const POPULAR_SOURCES = [
  { name: 'Website', desc: 'Leads from your website', iconName: 'Globe', type: 'Website', code: 'WEB', channel: 'Internet' },
  { name: 'WhatsApp Campaign', desc: 'Leads from WhatsApp promotions', iconName: 'MessageSquare', type: 'WhatsApp', code: 'WA_SUMMER', channel: 'WhatsApp API' },
  { name: 'Facebook Ads', desc: 'Leads from Facebook advertising', iconName: 'Facebook', type: 'Facebook', code: 'FB_LEADGEN', channel: 'Meta Lead Ads' },
  { name: 'Google Ads', desc: 'Leads from Google advertising', iconName: 'Search', type: 'Google Ads', code: 'GOOG_SEARCH', channel: 'Google Search' },
  { name: 'Referral', desc: 'Leads from referrals & recommendations', iconName: 'Users', type: 'Referral', code: 'REFERRAL', channel: 'Word of Mouth' },
  { name: 'Events & Exhibitions', desc: 'Leads from events and exhibitions', iconName: 'Calendar', type: 'Offline', code: 'EXPO_2025', channel: 'Field Booth' },
];

export default function AddLeadSourcePage() {
  const navigate = useNavigate();

  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [channel, setChannel] = useState('');
  const [sourceCode, setSourceCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('Globe');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState('Medium');
  const [attributionModel, setAttributionModel] = useState('First Touch');
  const [costType, setCostType] = useState<'Non Paid' | 'Paid (CPC/CPM)' | 'Other'>('Non Paid');
  const [defaultOwner, setDefaultOwner] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [trackRevenue, setTrackRevenue] = useState(true);
  const [allowAssignment, setAllowAssignment] = useState(true);

  const handleNameChange = (val: string) => {
    setSourceName(val);
    if (!sourceCode) {
      const generated = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      setSourceCode(generated);
    }
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim() || !sourceType) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success(`Lead source "${sourceName}" created successfully!`);
    navigate('/admin/leads/sources');
  };

  const selectedIconObj = AVAILABLE_ICONS.find((i) => i.name === selectedIconName) || AVAILABLE_ICONS[0];
  const IconComp = selectedIconObj.icon;

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
          <span className="text-[#0D1F3D] font-bold">Create Source</span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="h-10 w-10 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Create Lead Source</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Add a new lead source to track and analyze leads from different channels
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleCreateSource} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT FORM CONTENT (8 COLS ON LG) */}
        <div className="lg:col-span-8 space-y-5">
          {/* SOURCE INFORMATION CARD */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-indigo-700 border-b border-slate-100 pb-2">
              Source Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Source Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Website, Facebook Ads, Referral"
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-indigo-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">e.g. Website, Facebook Ads, Referral</span>
              </div>

              <div>
                <Select
                  label="Source Type *"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  options={[
                    { value: '', label: 'Select source type' },
                    { value: 'Website', label: 'Website' },
                    { value: 'WhatsApp', label: 'WhatsApp' },
                    { value: 'Facebook', label: 'Facebook Ads' },
                    { value: 'Google Ads', label: 'Google Ads' },
                    { value: 'Instagram', label: 'Instagram Ads' },
                    { value: 'Referral', label: 'Referral' },
                    { value: 'Email', label: 'Email Campaign' },
                    { value: 'Telecalling', label: 'Telecalling' },
                    { value: 'Offline', label: 'Offline / Event' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  searchable={true}
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">Choose the type of lead source</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Channel / Platform</label>
                <input
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  placeholder="e.g. Google, Meta, LinkedIn"
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">e.g. Google, Meta, LinkedIn</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Source Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WEB, FBADS"
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-[#0D1F3D] focus:border-indigo-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">e.g. WEB, FBADS (3-20 characters, uppercase letters only)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-500">Description</label>
                  <span className="text-[10px] text-slate-400 font-mono">{description.length} / 300</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                  className="w-full rounded-sm border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Briefly describe this lead source</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Source Icon</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                    className="w-full flex items-center justify-between rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0D1F3D] hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <IconComp className="h-4 w-4 text-indigo-600" />
                      <span>{selectedIconObj.label}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Choose Icon ∨</span>
                  </button>

                  {isIconPickerOpen && (
                    <div className="absolute left-0 top-full mt-1 w-full rounded-md border border-slate-200 bg-white p-2 shadow-xl z-50 grid grid-cols-3 gap-2 max-h-44 overflow-y-auto">
                      {AVAILABLE_ICONS.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              setSelectedIconName(item.name);
                              setIsIconPickerOpen(false);
                            }}
                            className={`flex flex-col items-center justify-center p-2 rounded-sm border text-[10px] font-bold ${
                              selectedIconName === item.name
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <ItemIcon className="h-4 w-4 mb-1" />
                            <span className="truncate w-full text-center">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">Select an icon to represent this source</span>
              </div>
            </div>
          </div>

          {/* SOURCE SETTINGS CARD */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-indigo-700 border-b border-slate-100 pb-2">
              Source Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-extrabold ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                  Inactive sources will not be available for selection
                </span>
              </div>

              <div>
                <Select
                  label="Priority *"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={[
                    { value: 'High', label: 'High (Priority 1)' },
                    { value: 'Medium', label: 'Medium (Priority 2)' },
                    { value: 'Low', label: 'Low (Priority 3)' },
                  ]}
                  searchable={true}
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">Set priority for this source (1 = Highest, 3 = Lowest)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Attribution Model"
                  value={attributionModel}
                  onChange={(e) => setAttributionModel(e.target.value)}
                  options={[
                    { value: 'First Touch', label: 'First Touch' },
                    { value: 'Last Touch', label: 'Last Touch' },
                    { value: 'Linear', label: 'Linear' },
                  ]}
                  searchable={true}
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">Select how leads will be attributed to this source</span>
              </div>

              {/* STYLED CUSTOM RADIO CARDS FOR COST TYPE (REPLACING RAW RADIO) */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Cost Type</label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { value: 'Non Paid', label: 'Non Paid' },
                    { value: 'Paid (CPC/CPM)', label: 'Paid (CPC)' },
                    { value: 'Other', label: 'Other' },
                  ].map((ct) => (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => setCostType(ct.value as any)}
                      className={`p-2 rounded-sm border text-xs font-bold text-center cursor-pointer transition-colors ${
                        costType === ct.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">Define the cost nature of this source</span>
              </div>
            </div>

            {/* SEARCHABLE DEFAULT OWNER SELECT WITH AVATARS AND SUBLABELS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <Select
                  label="Default Owner / Assignee"
                  value={defaultOwner}
                  onChange={(e) => setDefaultOwner(e.target.value)}
                  options={[
                    { value: '', label: 'Select user or team queue (optional)' },
                    {
                      value: 'Rohit Sharma',
                      label: 'Rohit Sharma',
                      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                      sublabel: 'Sales Manager • Mumbai',
                    },
                    {
                      value: 'Priya Sharma',
                      label: 'Priya Sharma',
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                      sublabel: 'Team Leader • Andheri',
                    },
                    {
                      value: 'Vijay Patel',
                      label: 'Vijay Patel',
                      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                      sublabel: 'Senior Executive • Borivali',
                    },
                    {
                      value: 'Mumbai Sales Team',
                      label: 'Mumbai Sales Team',
                      sublabel: 'Team Queue • 12 Executives',
                    },
                  ]}
                  searchable={true}
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">New leads from this source will be assigned to this user</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">UTM Parameter (optional)</label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="Enter UTM source (e.g. website, facebook)"
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">Used for campaign tracking and analytics</span>
              </div>
            </div>

            {/* ADDITIONAL SETTINGS TOGGLES */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-slate-50/70 p-3 rounded-sm border border-slate-100">
                <div>
                  <span className="text-xs font-extrabold text-[#0D1F3D] block">Track Revenue</span>
                  <span className="text-[10px] text-slate-500 font-medium block">Enable revenue tracking for leads from this source</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTrackRevenue(!trackRevenue)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    trackRevenue ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      trackRevenue ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-50/70 p-3 rounded-sm border border-slate-100">
                <div>
                  <span className="text-xs font-extrabold text-[#0D1F3D] block">Allow in Lead Assignment</span>
                  <span className="text-[10px] text-slate-500 font-medium block">Allow leads from this source to be assigned manually</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowAssignment(!allowAssignment)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    allowAssignment ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      allowAssignment ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="accent"
              size="md"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create Source
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/admin/leads/sources')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* RIGHT SIDEBAR PREVIEW & GUIDELINES (4 COLS ON LG) */}
        <div className="lg:col-span-4 space-y-4">
          {/* LIVE SOURCE PREVIEW CARD */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Source Preview
            </h3>

            <div className="rounded-md border border-slate-100 bg-slate-50/70 p-4 space-y-2 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
                <IconComp className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#0D1F3D]">
                  {sourceName || 'Website'}
                </h4>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="font-mono text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-xs">
                    Code: {sourceCode || 'WEB'}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-2">
                  Type: <strong>{sourceType || 'Website'}</strong> | Channel: <strong>{channel || 'Internet'}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* POPULAR SOURCE TYPES CARD */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Popular Source Types
            </h3>

            <div className="space-y-2">
              {POPULAR_SOURCES.map((ps) => (
                <div
                  key={ps.name}
                  onClick={() => {
                    setSourceName(ps.name);
                    setSourceType(ps.type);
                    setChannel(ps.channel);
                    setSourceCode(ps.code);
                    setSelectedIconName(ps.iconName);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-md border border-slate-100 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-sm bg-white border border-slate-200 flex items-center justify-center text-purple-600">
                      {ps.type === 'Website' && <Globe className="h-4 w-4" />}
                      {ps.type === 'WhatsApp' && <MessageSquare className="h-4 w-4 text-emerald-600" />}
                      {ps.type === 'Facebook' && <Facebook className="h-4 w-4 text-blue-600" />}
                      {ps.type === 'Google Ads' && <Search className="h-4 w-4 text-amber-500" />}
                      {ps.type === 'Referral' && <Users className="h-4 w-4 text-indigo-600" />}
                      {ps.type === 'Offline' && <Calendar className="h-4 w-4 text-amber-600" />}
                    </div>
                    <div>
                      <span className="font-extrabold text-[#0D1F3D] block">{ps.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{ps.desc}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded-xs border border-slate-200">
                    {ps.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GUIDELINES CARD */}
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Guidelines
            </h3>

            <ul className="space-y-2 text-slate-600 font-medium text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Use clear and specific names for easy identification.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Choose the correct source type for accurate reporting.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Unique code helps in tracking and integrations.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>You can edit source details anytime.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Inactive sources will not appear in lead creation.</span>
              </li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
