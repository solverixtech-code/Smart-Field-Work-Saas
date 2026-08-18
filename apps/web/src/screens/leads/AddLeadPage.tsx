import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Globe,
  Phone,
  Calendar,
  Upload,
  Save,
  Check,
  ChevronDown,
  CloudUpload,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

export default function AddLeadPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [leadType, setLeadType] = useState<'business' | 'individual'>('business');

  // Basic Information
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');

  // Lead Details
  const [leadSource, setLeadSource] = useState('');
  const [leadStage, setLeadStage] = useState('New');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [leadScore, setLeadScore] = useState('0');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [expectedClosingDate, setExpectedClosingDate] = useState('');

  // Address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Right Column: Assign & Ownership
  const [assignTo, setAssignTo] = useState('');
  const [assignTeam, setAssignTeam] = useState('');
  const [assignTeamLeader, setAssignTeamLeader] = useState('');

  // Follow-up & Next Action
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextActionNotes, setNextActionNotes] = useState('');

  // Additional Information
  const [productsInterested, setProductsInterested] = useState('');
  const [howHeard, setHowHeard] = useState('');
  const [remarks, setRemarks] = useState('');

  // Attachments
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = (e?: React.FormEvent, andAddAnother: boolean = false) => {
    if (e) e.preventDefault();
    if (leadType === 'business' && !businessName.trim() && !contactPerson.trim()) {
      toast.error('Please enter a Business Name or Contact Person Name.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        andAddAnother
          ? `Saved lead "${businessName || contactPerson}". Ready for next lead!`
          : `Lead "${businessName || contactPerson}" created successfully!`
      );
      if (andAddAnother) {
        setBusinessName('');
        setContactPerson('');
        setMobileNumber('');
        setEmailAddress('');
        setEstimatedValue('');
      } else {
        navigate('/admin/leads');
      }
    }, 600);
  };

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2">
      {/* Breadcrumbs & Header Bar */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>Leads & Businesses</span>
          <span>&gt;</span>
          <span>Leads</span>
          <span>&gt;</span>
          <span className="font-bold text-[#0D1F3D]">Add Lead</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1F3D]">Add Lead</h1>
            <p className="text-xs font-normal text-slate-500">
              Add a new lead or business to your CRM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Indicator Button */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>May 18, 2025</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(undefined, true)}
              className="bg-white text-slate-800 font-semibold border-slate-200 hover:bg-slate-50 shadow-xs"
            >
              Save & Add Another
            </Button>

            <Button
              type="button"
              variant="accent"
              onClick={(e) => handleSubmit(e, false)}
              isLoading={isSubmitting}
              className="font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white"
            >
              Save Lead
            </Button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid Layout (matching moodboard screenshot) */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT COLUMN (8 COLS) */}
        <div className="space-y-4 lg:col-span-8">
          {/* Card 1: Lead Type */}
          <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <label className="text-xs font-bold text-[#0D1F3D] block">
              Lead Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
              {/* Option 1: Business / Company */}
              <label
                onClick={() => setLeadType('business')}
                className={`flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
                  leadType === 'business'
                    ? 'border-purple-600 bg-purple-50/20 ring-1 ring-purple-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  leadType === 'business' ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                }`}>
                  {leadType === 'business' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <Building2 className={`h-4 w-4 ${leadType === 'business' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className={`font-bold ${leadType === 'business' ? 'text-purple-900' : 'text-slate-700'}`}>
                  Business / Company
                </span>
              </label>

              {/* Option 2: Individual / Person */}
              <label
                onClick={() => setLeadType('individual')}
                className={`flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
                  leadType === 'individual'
                    ? 'border-purple-600 bg-purple-50/20 ring-1 ring-purple-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  leadType === 'individual' ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                }`}>
                  {leadType === 'individual' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <User className={`h-4 w-4 ${leadType === 'individual' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className={`font-bold ${leadType === 'individual' ? 'text-purple-900' : 'text-slate-700'}`}>
                  Individual / Person
                </span>
              </label>
            </div>
          </div>

          {/* Card 2: Basic Information */}
          <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Basic Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Business Name */}
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-slate-700 block">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter business or company name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Contact Person Name */}
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-slate-700 block">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-slate-700 block">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:border-purple-600">
                  <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-2 border-r border-slate-200 text-slate-600 font-bold">
                    <span>🇮🇳</span>
                    <span>+91</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-slate-700 block">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Website */}
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-slate-700 block">Website</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Industry / Category */}
              <div className="sm:col-span-1">
                <Select
                  label="Industry / Category"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  options={[
                    { value: '', label: 'Select industry or category' },
                    { value: 'Real Estate', label: 'Real Estate & Infrastructure' },
                    { value: 'Healthcare', label: 'Healthcare & Pharma' },
                    { value: 'FMCG', label: 'FMCG & Consumer Goods' },
                    { value: 'Logistics', label: 'Logistics & Supply Chain' },
                    { value: 'BFSI', label: 'Banking & Finance' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Lead Details */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Lead Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Lead Source */}
              <div>
                <Select
                  label="Lead Source *"
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  options={[
                    { value: '', label: 'Select lead source' },
                    { value: 'Website', label: 'Website' },
                    { value: 'Field Visit', label: 'Field Visit' },
                    { value: 'Referral', label: 'Referral' },
                    { value: 'LinkedIn', label: 'LinkedIn' },
                    { value: 'Inbound Call', label: 'Inbound Call' },
                    { value: 'Cold Outreach', label: 'Cold Outreach' },
                  ]}
                />
              </div>

              {/* Lead Stage */}
              <div>
                <Select
                  label="Lead Stage *"
                  value={leadStage}
                  onChange={(e) => setLeadStage(e.target.value)}
                  options={[
                    { value: 'New', label: 'New' },
                    { value: 'Contacted', label: 'Contacted' },
                    { value: 'Meeting Scheduled', label: 'Meeting Scheduled' },
                    { value: 'Demo Completed', label: 'Demo Completed' },
                    { value: 'Proposal Sent', label: 'Proposal Sent' },
                    { value: 'Negotiation', label: 'Negotiation' },
                    { value: 'Won / Converted', label: 'Won / Converted' },
                  ]}
                />
              </div>

              {/* Lead Priority Segmented Pills */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Lead Priority</label>
                <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-slate-200 p-1 bg-white">
                  {(['Low', 'Medium', 'High'] as const).map((p) => {
                    const isSelected = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-extrabold transition-all ${
                          isSelected
                            ? p === 'High'
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : p === 'Medium'
                                ? 'bg-purple-50 text-purple-600 border border-purple-200'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${
                          p === 'High' ? 'bg-red-500' : p === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <span>{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lead Score */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Lead Score</label>
                <div className="relative">
                  <input
                    type="number"
                    value={leadScore}
                    onChange={(e) => setLeadScore(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 focus:border-purple-600 focus:outline-none font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">0 - 100</span>
                </div>
              </div>

              {/* Estimated Value */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Estimated Value (₹)</label>
                <input
                  type="number"
                  placeholder="Enter estimated value"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Expected Closing Date */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Expected Closing Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={expectedClosingDate}
                    onChange={(e) => setExpectedClosingDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-700 focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Address */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Address</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Address Line 1</label>
                <input
                  type="text"
                  placeholder="Enter address line 1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Address Line 2</label>
                <input
                  type="text"
                  placeholder="Enter address line 2 (optional)"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">City</label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <Select
                    label="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    options={[
                      { value: '', label: 'Select state' },
                      { value: 'Maharashtra', label: 'Maharashtra' },
                      { value: 'Gujarat', label: 'Gujarat' },
                      { value: 'Karnataka', label: 'Karnataka' },
                      { value: 'Delhi', label: 'Delhi' },
                    ]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Pincode</label>
                  <input
                    type="text"
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Tags */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Tags</h3>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Add Tags</label>
              <input
                type="text"
                placeholder="Type tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 font-normal">Example: Retail, Premium, Hot Lead</p>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 text-xs font-bold"
                  >
                    <span>{t}</span>
                    <button type="button" onClick={() => handleRemoveTag(t)} className="text-purple-400 hover:text-purple-900">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Left Actions */}
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/leads')}
              className="bg-white text-slate-700 border-slate-200 font-semibold hover:bg-slate-50"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS - MATCHING MOODBOARD) */}
        <div className="space-y-4 lg:col-span-4">
          {/* Card 1: Assign & Ownership */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Assign & Ownership</h3>

            <div className="space-y-3">
              <div>
                <Select
                  label="Assign To *"
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  options={[
                    { value: '', label: 'Select executive' },
                    { value: 'Rahul Verma', label: 'Rahul Verma (FE-1001)' },
                    { value: 'Priya Mehta', label: 'Priya Mehta (FE-1002)' },
                    { value: 'Sanjay Yadav', label: 'Sanjay Yadav (FE-1003)' },
                  ]}
                />
              </div>

              <div>
                <Select
                  label="Assign Team"
                  value={assignTeam}
                  onChange={(e) => setAssignTeam(e.target.value)}
                  options={[
                    { value: '', label: 'Select team' },
                    { value: 'Mumbai North Team', label: 'Mumbai North Team' },
                    { value: 'Mumbai West Team', label: 'Mumbai West Team' },
                    { value: 'Thane Team', label: 'Thane Central' },
                  ]}
                />
              </div>

              <div>
                <Select
                  label="Assign Team Leader"
                  value={assignTeamLeader}
                  onChange={(e) => setAssignTeamLeader(e.target.value)}
                  options={[
                    { value: '', label: 'Select team leader' },
                    { value: 'Sanjay Yadav', label: 'Sanjay Yadav (TL-1003)' },
                    { value: 'Priya Mehta', label: 'Priya Mehta (TL-1007)' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Follow-up & Next Action */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Follow-up & Next Action</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Next Follow-up Date</label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-700 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Next Action / Notes</label>
                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder="What is the next action or follow-up plan?"
                  value={nextActionNotes}
                  onChange={(e) => setNextActionNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 text-right block">{nextActionNotes.length}/500</span>
              </div>
            </div>
          </div>

          {/* Card 3: Additional Information */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Additional Information</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Products / Services Interested In</label>
                <input
                  type="text"
                  placeholder="Enter products or services"
                  value={productsInterested}
                  onChange={(e) => setProductsInterested(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <Select
                  label="How did they hear about us?"
                  value={howHeard}
                  onChange={(e) => setHowHeard(e.target.value)}
                  options={[
                    { value: '', label: 'Select an option' },
                    { value: 'Google Search', label: 'Google Search' },
                    { value: 'Social Media', label: 'Social Media' },
                    { value: 'Event / Expo', label: 'Event / Expo' },
                    { value: 'Word of Mouth', label: 'Word of Mouth' },
                  ]}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Remarks</label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Additional remarks or notes"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 text-right block">{remarks.length}/500</span>
              </div>
            </div>
          </div>

          {/* Card 4: Attachments */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Attachments</h3>

            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center space-y-2">
              <CloudUpload className="h-6 w-6 text-slate-400 mx-auto" />
              <div className="flex items-center justify-center gap-1.5 text-[11px]">
                <span className="text-slate-600 font-semibold">Drag & drop files here or</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  id="right-file-input"
                  className="hidden"
                />
                <label htmlFor="right-file-input" className="cursor-pointer font-bold text-blue-600 hover:underline">
                  Choose Files
                </label>
              </div>
              <p className="text-[10px] text-slate-400 font-normal">Supports: JPG, PNG, PDF, DOC (Max 5MB each)</p>
            </div>
          </div>

          {/* Bottom Right Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="accent"
              isLoading={isSubmitting}
              className="w-full sm:w-auto bg-[#0D1F3D] hover:bg-slate-800 text-white font-bold px-6 shadow-xs"
            >
              Save Lead
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
