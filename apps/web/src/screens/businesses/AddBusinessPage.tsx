import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Save,
  X,
  UploadCloud,
  FileText,
  Trash2,
  Clock,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { mockBusinesses } from './businessesData';

interface AddBusinessPageProps {
  isEdit?: boolean;
}

export default function AddBusinessPage({ isEdit = false }: AddBusinessPageProps) {
  const navigate = useNavigate();
  const { businessId } = useParams();

  const existingBusiness = isEdit
    ? mockBusinesses.find((b) => b.id === businessId) || mockBusinesses[0]
    : null;

  // Form State
  const [formData, setFormData] = useState({
    name: existingBusiness ? existingBusiness.name : '',
    type: existingBusiness ? existingBusiness.businessType : '',
    category: existingBusiness ? existingBusiness.category : '',
    gstin: existingBusiness ? existingBusiness.gstin || '' : '',
    website: existingBusiness ? existingBusiness.website || '' : '',
    yearEstablished: existingBusiness ? existingBusiness.establishedYear.toString() : '2018',
    description: existingBusiness ? existingBusiness.description || '' : '',

    // Location
    address1: existingBusiness ? existingBusiness.address : '',
    address2: '',
    city: existingBusiness ? existingBusiness.city : '',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',

    // Contact
    contactName: existingBusiness ? existingBusiness.contactPerson : '',
    designation: existingBusiness ? existingBusiness.contactRole || 'Owner' : '',
    mobile: existingBusiness ? existingBusiness.phone : '',
    email: existingBusiness ? existingBusiness.email : '',
    altPhone: '',
    landline: '',
    contactPreference: 'Phone Call',
    bestTime: 'Morning (9 AM - 12 PM)',

    // Details
    employees: existingBusiness ? existingBusiness.employees : '11-50',
    turnover: existingBusiness ? existingBusiness.annualRevenue : '₹50L - ₹2 Cr',
    serviceAreas: existingBusiness ? existingBusiness.city : '',
    languages: 'English, Hindi, Marathi',
    workingDays: 'Monday - Saturday',
    workingHoursStart: '09:00 AM',
    workingHoursEnd: '06:00 PM',

    // Assignment
    assignedExecutive: existingBusiness ? existingBusiness.assignedToName : 'Rahul Verma',
    assignedTeam: 'Mumbai North Team',
    source: existingBusiness ? existingBusiness.source : 'Field Visit',
    tags: 'High Priority, Gym, Retail',
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      }));
      setUploadedFiles((prev) => [...prev, ...filesArray]);
      toast.success(`${filesArray.length} file(s) attached successfully.`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter business name.');
      return;
    }
    if (!formData.contactName.trim()) {
      toast.error('Please enter primary contact name.');
      return;
    }
    if (!formData.mobile.trim()) {
      toast.error('Please enter mobile number.');
      return;
    }

    toast.success(
      isEdit
        ? `Business "${formData.name}" updated successfully!`
        : `Business "${formData.name}" added to database!`,
    );

    setTimeout(() => {
      navigate('/admin/businesses');
    }, 1000);
  };

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Top Breadcrumb & Page Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span
              onClick={() => navigate('/admin/dashboard')}
              className="hover:text-[#0D1F3D] cursor-pointer transition-colors"
            >
              Dashboard
            </span>
            <ChevronRight className="h-3 w-3" />
            <span
              onClick={() => navigate('/admin/businesses')}
              className="hover:text-[#0D1F3D] cursor-pointer transition-colors"
            >
              Businesses
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0D1F3D] font-bold">
              {isEdit ? 'Edit Business' : 'Add Business'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="rounded-sm bg-red-50 p-2 text-[#E20613]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0D1F3D]">
                {isEdit ? `Edit Business: ${formData.name}` : 'Add Business'}
              </h1>
              <p className="text-xs font-normal text-slate-500">
                {isEdit
                  ? 'Update business details, contact information, and executive assignment'
                  : 'Add a new business / lead to your database'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/businesses')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-sm"
          >
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={handleSubmit}
            className="flex items-center gap-2 font-bold shadow-sm bg-[#E20613] hover:bg-red-700 text-white rounded-sm"
          >
            <Save className="h-4 w-4" /> {isEdit ? 'Update Business' : 'Save Business'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Form Sections (8 Cols) + Right Sidebar Summary & Upload (4 Cols) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column Form Sections */}
        <div className="space-y-6 lg:col-span-8">
          {/* Section 1: Business Information */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-5 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="font-extrabold text-[#E20613]">1.</span>
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Business Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Business Name *</label>
                <input
                  type="text"
                  placeholder="Enter business name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Business Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="">Select business type</option>
                  <option value="Gym / Fitness">Gym / Fitness</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Security Services">Security Services</option>
                  <option value="Construction">Construction</option>
                  <option value="Retail Supermarket">Retail Supermarket</option>
                  <option value="Beauty & Salon">Beauty & Salon</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Category / Industry *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="">Select category</option>
                  <option value="Fitness & Wellness">Fitness & Wellness</option>
                  <option value="Hospitality & Dining">Hospitality & Dining</option>
                  <option value="Facility & Security">Facility & Security</option>
                  <option value="Building & Real Estate">Building & Real Estate</option>
                  <option value="Retail & FMCG">Retail & FMCG</option>
                  <option value="Corporate Services">Corporate Services</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">GSTIN</label>
                <input
                  type="text"
                  placeholder="Enter GSTIN (Optional)"
                  value={formData.gstin}
                  onChange={(e) => handleInputChange('gstin', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Website</label>
                <input
                  type="url"
                  placeholder="https://www.example.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Year Established</label>
                <select
                  value={formData.yearEstablished}
                  onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 30 }, (_, i) => 2025 - i).map((y) => (
                    <option key={y} value={y.toString()}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 block">Description</label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {formData.description.length}/500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                placeholder="Brief description about the business..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white p-3 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Business Location */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-5 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="h-4 w-4 text-[#E20613]" />
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Business Location</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Address Inputs (7 Cols) */}
              <div className="space-y-4 lg:col-span-7">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Address Line 1 *</label>
                  <input
                    type="text"
                    placeholder="Building, Street, Area"
                    value={formData.address1}
                    onChange={(e) => handleInputChange('address1', e.target.value)}
                    className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Address Line 2</label>
                  <input
                    type="text"
                    placeholder="Landmark, Near by place (Optional)"
                    value={formData.address2}
                    onChange={(e) => handleInputChange('address2', e.target.value)}
                    className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">City *</label>
                    <input
                      type="text"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">State *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                    >
                      <option value="">Select state</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Delhi">Delhi NCR</option>
                      <option value="Telangana">Telangana</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Pincode *</label>
                    <input
                      type="text"
                      placeholder="Enter pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Country *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                  >
                    <option value="India">India</option>
                    <option value="UAE">United Arab Emirates</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>
              </div>

              {/* Right Map Preview Container (5 Cols) */}
              <div className="space-y-2 lg:col-span-5 flex flex-col justify-between">
                <div className="relative overflow-hidden rounded-sm border border-slate-200 bg-slate-100 h-52 flex flex-col justify-between p-3">
                  {/* Map SVG Pattern Background */}
                  <div className="absolute inset-0 bg-blue-50/60 opacity-80 pointer-events-none">
                    <svg className="w-full h-full text-slate-300/40" width="100%" height="100%">
                      <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#mapGrid)" />
                    </svg>
                  </div>

                  {/* Pick On Map Button Header */}
                  <div className="relative z-10 flex justify-end">
                    <button
                      type="button"
                      onClick={() => toast.info('Interactive map pin picker opened.')}
                      className="flex items-center gap-1.5 rounded-sm bg-[#0D1F3D] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5 text-[#E20613]" /> Pick on Map
                    </button>
                  </div>

                  {/* Center Map Pin */}
                  <div className="relative z-10 flex flex-col items-center justify-center space-y-1 my-auto">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute h-10 w-10 animate-ping rounded-full bg-red-400/40 opacity-75" />
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E20613] text-white shadow-lg ring-4 ring-white">
                        <MapPin className="h-5 w-5" />
                      </div>
                    </div>
                    <span className="rounded-sm bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-[#0D1F3D] shadow-xs border border-slate-200">
                      {formData.name || 'Selected Location'}
                    </span>
                  </div>

                  {/* Zoom Controls */}
                  <div className="relative z-10 flex flex-col items-end gap-1">
                    <div className="flex flex-col rounded-sm border border-slate-200 bg-white shadow-xs">
                      <button type="button" className="px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 border-b border-slate-100">+</button>
                      <button type="button" className="px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100">-</button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-sm border border-blue-200/80 bg-blue-50/70 p-2.5 text-[11px] font-semibold text-blue-900">
                  <Info className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Accurate location helps in better route planning and visit tracking.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Contact Information */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-5 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="font-extrabold text-[#E20613]">2.</span>
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Primary Contact Name *</label>
                <input
                  type="text"
                  placeholder="Enter contact person name"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Owner, Manager"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Mobile Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-sm border border-r-0 border-slate-200 bg-slate-50 px-3 font-bold text-slate-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className="w-full rounded-r-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Alternate Contact</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-sm border border-r-0 border-slate-200 bg-slate-50 px-3 font-bold text-slate-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter alternate number"
                    value={formData.altPhone}
                    onChange={(e) => handleInputChange('altPhone', e.target.value)}
                    className="w-full rounded-r-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Landline Number</label>
                <input
                  type="text"
                  placeholder="Enter landline number"
                  value={formData.landline}
                  onChange={(e) => handleInputChange('landline', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Contact Preference</label>
                <select
                  value={formData.contactPreference}
                  onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="Phone Call">Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="In-Person Visit">In-Person Visit</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Best Time to Contact</label>
                <select
                  value={formData.bestTime}
                  onChange={(e) => handleInputChange('bestTime', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Business Details */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-5 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="font-extrabold text-[#E20613]">3.</span>
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Business Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Number of Employees</label>
                <select
                  value={formData.employees}
                  onChange={(e) => handleInputChange('employees', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="1-10">1 - 10 Employees</option>
                  <option value="11-50">11 - 50 Employees</option>
                  <option value="51-200">51 - 200 Employees</option>
                  <option value="200+">200+ Employees</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Annual Turnover</label>
                <select
                  value={formData.turnover}
                  onChange={(e) => handleInputChange('turnover', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="< ₹50 Lakhs">&lt; ₹50 Lakhs</option>
                  <option value="₹50L - ₹2 Cr">₹50 Lakhs - ₹2 Cr</option>
                  <option value="₹2 Cr - ₹10 Cr">₹2 Cr - ₹10 Cr</option>
                  <option value="₹10 Cr+">₹10 Cr+</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Service Areas / Locations</label>
                <input
                  type="text"
                  placeholder="Select or add service areas"
                  value={formData.serviceAreas}
                  onChange={(e) => handleInputChange('serviceAreas', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Languages Known</label>
                <input
                  type="text"
                  placeholder="Select languages"
                  value={formData.languages}
                  onChange={(e) => handleInputChange('languages', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Working Days</label>
                <select
                  value={formData.workingDays}
                  onChange={(e) => handleInputChange('workingDays', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="Monday - Saturday">Monday - Saturday</option>
                  <option value="Monday - Friday">Monday - Friday</option>
                  <option value="All 7 Days">All 7 Days</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Working Hours</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formData.workingHoursStart}
                      onChange={(e) => handleInputChange('workingHoursStart', e.target.value)}
                      className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D]"
                    />
                    <Clock className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <span className="text-slate-400 font-bold">+</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formData.workingHoursEnd}
                      onChange={(e) => handleInputChange('workingHoursEnd', e.target.value)}
                      className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D]"
                    />
                    <Clock className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Assignment */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-5 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="font-extrabold text-[#E20613]">4.</span>
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Assignment</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Assign To Executive</label>
                <select
                  value={formData.assignedExecutive}
                  onChange={(e) => handleInputChange('assignedExecutive', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="Rahul Verma">Rahul Verma (FE-1001)</option>
                  <option value="Sanjay Yadav">Sanjay Yadav (FE-1002)</option>
                  <option value="Vikram Joshi">Vikram Joshi (FE-1003)</option>
                  <option value="Neha Patil">Neha Patil (FE-1004)</option>
                  <option value="Arun Kumar">Arun Kumar (FE-1005)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Assign To Team (Optional)</label>
                <select
                  value={formData.assignedTeam}
                  onChange={(e) => handleInputChange('assignedTeam', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="Mumbai North Team">Mumbai North Team</option>
                  <option value="Pune Central Team">Pune Central Team</option>
                  <option value="Thane Territory Team">Thane Territory Team</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                >
                  <option value="Field Visit">Field Visit</option>
                  <option value="Website Lead">Website Lead</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Exhibition">Exhibition</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Tags (Optional)</label>
                <input
                  type="text"
                  placeholder="Add tags and press enter"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-sm border border-blue-100 bg-blue-50/70 p-3 text-xs font-semibold text-blue-900">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Fields marked with * are mandatory. You can add more details after creating the business.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Quick Summary & Document Upload Sidebar */}
        <div className="space-y-6 lg:col-span-4">
          {/* Quick Summary Live Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="rounded-sm bg-red-50 p-1.5 text-[#E20613]">
                <Building2 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Quick Summary</h3>
            </div>

            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Business Name</span>
                <span className="font-bold text-[#0D1F3D] truncate max-w-[160px]">
                  {formData.name || '-'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Primary Contact</span>
                <span className="font-bold text-[#0D1F3D]">
                  {formData.contactName || '-'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Mobile</span>
                <span className="font-bold text-[#0D1F3D]">
                  {formData.mobile ? `+91 ${formData.mobile}` : '-'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Business Type</span>
                <span className="font-bold text-[#E20613]">
                  {formData.type || '-'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Location</span>
                <span className="font-bold text-[#0D1F3D]">
                  {formData.city ? `${formData.city}, ${formData.state || ''}` : '-'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Assigned To</span>
                <span className="font-bold text-emerald-600">
                  {formData.assignedExecutive || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Upload Documents Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UploadCloud className="h-4 w-4 text-[#0D1F3D]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Upload Documents (Optional)</h3>
            </div>

            {/* Drop Zone */}
            <div className="relative flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center hover:bg-slate-100/60 transition-colors">
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-[#0D1F3D] mb-1">
                Drag & drop files here or
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs font-bold border-slate-200 text-slate-700 bg-white rounded-sm pointer-events-none"
              >
                Browse Files
              </Button>
            </div>

            <p className="text-[10px] text-slate-400 font-medium text-center">
              Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 5MB)
            </p>

            {/* Uploaded File List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-600">Attached Files ({uploadedFiles.length})</p>
                <div className="space-y-1.5">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-sm bg-slate-50 p-2 border border-slate-200 text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2 truncate max-w-[180px]">
                        <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="truncate text-[#0D1F3D]">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{file.size}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
