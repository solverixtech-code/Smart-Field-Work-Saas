import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import { Select } from '../../components/ui/Select';
import { ClockTimePickerModal } from '../../components/ui/ClockTimePickerModal';
import { GoogleMapPicker } from '../../components/ui/GoogleMapPicker';
import { mockBusinesses } from './businessesData';
import { mockTerritoriesList, mockTerritoryBusinesses } from '../territories/territoriesData';

interface AddBusinessPageProps {
  isEdit?: boolean;
}

export default function AddBusinessPage({ isEdit = false }: AddBusinessPageProps) {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const [searchParams] = useSearchParams();

  const territoryIdFromQuery = searchParams.get('territoryId');
  const targetTerritory = mockTerritoriesList.find(
    (t) => t.id === territoryIdFromQuery || t.code === territoryIdFromQuery,
  );

  const existingBusiness = isEdit
    ? mockBusinesses.find((b) => b.id === businessId) || mockBusinesses[0]
    : null;

  // Form State with automatic Territory Pre-Population
  const [formData, setFormData] = useState({
    name: existingBusiness ? existingBusiness.name : '',
    type: existingBusiness ? existingBusiness.businessType : 'Gym / Fitness',
    category: existingBusiness ? existingBusiness.category : 'Fitness & Wellness',
    gstin: existingBusiness ? existingBusiness.gstin || '' : '',
    website: existingBusiness ? existingBusiness.website || '' : '',
    yearEstablished: existingBusiness ? existingBusiness.establishedYear.toString() : '2021',
    description: existingBusiness ? existingBusiness.description || '' : '',

    // Location (Pre-populated from target territory if creating for a territory)
    address1: existingBusiness
      ? existingBusiness.address
      : targetTerritory
      ? `Plot 12, ${targetTerritory.name}, ${targetTerritory.regionArea}`
      : '',
    address2: '',
    city: existingBusiness
      ? existingBusiness.city
      : targetTerritory
      ? targetTerritory.city
      : 'Mumbai',
    state: targetTerritory?.hierarchy?.state || 'Maharashtra',
    pincode: targetTerritory?.hierarchy?.pincode || '400059',
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
    serviceAreas: targetTerritory ? targetTerritory.name : 'Mumbai',
    languages: 'English, Hindi, Marathi',
    workingDays: 'Monday - Saturday',
    workingHoursStart: '09:00 AM',
    workingHoursEnd: '06:00 PM',

    // Assignment (Pre-populated for territory team)
    assignedTerritory: targetTerritory ? targetTerritory.id : 'TERR-1001',
    assignedExecutive: existingBusiness
      ? existingBusiness.assignedToName
      : targetTerritory
      ? 'Arjun Mehta'
      : 'Rahul Verma',
    assignedTeam: targetTerritory ? `${targetTerritory.name} Team` : 'Mumbai Central Team',
    source: existingBusiness ? existingBusiness.source : 'Field Visit',
    tags: 'High Priority, Territory Business',
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

    const selectedTerritoryObj = mockTerritoriesList.find((t) => t.id === formData.assignedTerritory);

    const newBiz: any = {
      id: `BUS-${Date.now()}`,
      name: formData.name,
      badge: 'New',
      businessType: formData.type || 'Electronics Store',
      contactPerson: formData.contactName,
      contactRole: formData.designation || 'Owner',
      phone: formData.mobile,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: formData.address1 || `${selectedTerritoryObj?.name || 'Andheri East'}, Mumbai`,
      assignedToName: formData.assignedExecutive,
      assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      lastVisitDate: 'Just now',
      status: 'Active',
      category: formData.category || 'Retail',
      revenueFormatted: '₹ 1,80,000',
      visitStatus: 'Visited',
      lat: 19.118,
      lng: 72.868,
    };

    mockTerritoryBusinesses.unshift(newBiz);

    toast.success(
      isEdit
        ? `Business "${formData.name}" updated successfully!`
        : `Business "${formData.name}" assigned to ${selectedTerritoryObj ? selectedTerritoryObj.name : 'Territory'}!`,
    );

    setTimeout(() => {
      if (selectedTerritoryObj) {
        navigate(`/admin/territories/${selectedTerritoryObj.id}`);
      } else {
        navigate('/admin/businesses');
      }
    }, 800);
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

              <Select
                label="Business Type *"
                placeholder="Select business type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                options={[
                  { label: 'Select business type', value: '' },
                  { label: 'Gym / Fitness', value: 'Gym / Fitness' },
                  { label: 'Food & Beverage', value: 'Food & Beverage' },
                  { label: 'Security Services', value: 'Security Services' },
                  { label: 'Construction', value: 'Construction' },
                  { label: 'Retail Supermarket', value: 'Retail Supermarket' },
                  { label: 'Beauty & Salon', value: 'Beauty & Salon' },
                  { label: 'Technology', value: 'Technology' },
                  { label: 'Healthcare', value: 'Healthcare' },
                ]}
              />

              <Select
                label="Category / Industry *"
                placeholder="Select category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                options={[
                  { label: 'Select category', value: '' },
                  { label: 'Fitness & Wellness', value: 'Fitness & Wellness' },
                  { label: 'Hospitality & Dining', value: 'Hospitality & Dining' },
                  { label: 'Facility & Security', value: 'Facility & Security' },
                  { label: 'Building & Real Estate', value: 'Building & Real Estate' },
                  { label: 'Retail & FMCG', value: 'Retail & FMCG' },
                  { label: 'Corporate Services', value: 'Corporate Services' },
                ]}
              />
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

              <Select
                label="Year Established"
                placeholder="Select year"
                value={formData.yearEstablished}
                onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                options={[
                  { label: 'Select year', value: '' },
                  ...Array.from({ length: 30 }, (_, i) => {
                    const y = (2025 - i).toString();
                    return { label: y, value: y };
                  }),
                ]}
              />
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

                  <Select
                    label="State *"
                    placeholder="Select state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    options={[
                      { label: 'Select state', value: '' },
                      { label: 'Maharashtra', value: 'Maharashtra' },
                      { label: 'Gujarat', value: 'Gujarat' },
                      { label: 'Karnataka', value: 'Karnataka' },
                      { label: 'Delhi NCR', value: 'Delhi' },
                      { label: 'Telangana', value: 'Telangana' },
                    ]}
                  />

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

                <Select
                  label="Country *"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  options={[
                    { label: 'India', value: 'India' },
                    { label: 'United Arab Emirates', value: 'UAE' },
                    { label: 'Singapore', value: 'Singapore' },
                  ]}
                />
              </div>

              {/* Right Google Maps Container (5 Cols) */}
              <div className="space-y-2 lg:col-span-5 flex flex-col justify-between">
                <GoogleMapPicker
                  address={
                    formData.address1 || formData.city
                      ? `${formData.address1 ? formData.address1 + ', ' : ''}${formData.city || ''}, ${formData.state || 'Maharashtra'}`
                      : 'Mumbai, Maharashtra'
                  }
                  onAddressChange={(newAddr) => handleInputChange('address1', newAddr)}
                  height="h-64"
                  showLocateMe
                />

                <div className="flex items-center gap-2 rounded-sm border border-blue-200/80 bg-blue-50/70 p-2.5 text-[11px] font-semibold text-blue-900">
                  <Info className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Accurate Google Maps location helps in better route planning and visit tracking.</span>
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

              <Select
                label="Contact Preference"
                value={formData.contactPreference}
                onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                options={[
                  { label: 'Phone Call', value: 'Phone Call' },
                  { label: 'WhatsApp', value: 'WhatsApp' },
                  { label: 'Email', value: 'Email' },
                  { label: 'In-Person Visit', value: 'In-Person Visit' },
                ]}
              />

              <Select
                label="Best Time to Contact"
                value={formData.bestTime}
                onChange={(e) => handleInputChange('bestTime', e.target.value)}
                options={[
                  { label: 'Morning (9 AM - 12 PM)', value: 'Morning (9 AM - 12 PM)' },
                  { label: 'Afternoon (12 PM - 4 PM)', value: 'Afternoon (12 PM - 4 PM)' },
                  { label: 'Evening (4 PM - 8 PM)', value: 'Evening (4 PM - 8 PM)' },
                ]}
              />
            </div>
          </div>

          {/* Section 4: Business Details */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-5 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="font-extrabold text-[#E20613]">3.</span>
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Business Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Select
                label="Number of Employees"
                value={formData.employees}
                onChange={(e) => handleInputChange('employees', e.target.value)}
                options={[
                  { label: '1 - 10 Employees', value: '1-10' },
                  { label: '11 - 50 Employees', value: '11-50' },
                  { label: '51 - 200 Employees', value: '51-200' },
                  { label: '200+ Employees', value: '200+' },
                ]}
              />

              <Select
                label="Annual Turnover"
                value={formData.turnover}
                onChange={(e) => handleInputChange('turnover', e.target.value)}
                options={[
                  { label: '< ₹50 Lakhs', value: '< ₹50 Lakhs' },
                  { label: '₹50 Lakhs - ₹2 Cr', value: '₹50L - ₹2 Cr' },
                  { label: '₹2 Cr - ₹10 Cr', value: '₹2 Cr - ₹10 Cr' },
                  { label: '₹10 Cr+', value: '₹10 Cr+' },
                ]}
              />

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
              <Select
                label="Working Days"
                value={formData.workingDays}
                onChange={(e) => handleInputChange('workingDays', e.target.value)}
                options={[
                  { label: 'Monday - Saturday', value: 'Monday - Saturday' },
                  { label: 'Monday - Friday', value: 'Monday - Friday' },
                  { label: 'All 7 Days', value: 'All 7 Days' },
                ]}
              />

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Working Hours</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <ClockTimePickerModal
                      value={formData.workingHoursStart}
                      onChange={(val) => handleInputChange('workingHoursStart', val)}
                      placeholder="Start Time"
                    />
                  </div>
                  <span className="text-slate-400 font-bold">+</span>
                  <div className="flex-1">
                    <ClockTimePickerModal
                      value={formData.workingHoursEnd}
                      onChange={(val) => handleInputChange('workingHoursEnd', val)}
                      placeholder="End Time"
                    />
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
              <Select
                label="Assign Territory *"
                value={formData.assignedTerritory}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const terr = mockTerritoriesList.find((t) => t.id === selectedId);
                  setFormData((prev) => ({
                    ...prev,
                    assignedTerritory: selectedId,
                    city: terr ? terr.city : prev.city,
                    address1: terr ? `Plot 12, ${terr.name}, ${terr.regionArea}` : prev.address1,
                    serviceAreas: terr ? terr.name : prev.serviceAreas,
                    assignedTeam: terr ? `${terr.name} Team` : prev.assignedTeam,
                  }));
                }}
                options={[
                  { label: '-- Select Territory --', value: '' },
                  ...mockTerritoriesList.map((terr) => ({
                    label: `${terr.name} (${terr.code} - ${terr.city})`,
                    value: terr.id,
                  })),
                ]}
              />

              <Select
                label="Assign To Executive"
                value={formData.assignedExecutive}
                onChange={(e) => handleInputChange('assignedExecutive', e.target.value)}
                options={[
                  { label: 'Arjun Mehta (Senior Executive)', value: 'Arjun Mehta' },
                  { label: 'Neha Sharma (Sales Executive)', value: 'Neha Sharma' },
                  { label: 'Pooja Yadav (Field Rep)', value: 'Pooja Yadav' },
                  { label: 'Rakesh Patel (Sales Executive)', value: 'Rakesh Patel' },
                  { label: 'Kiran Jadhav (Field Rep)', value: 'Kiran Jadhav' },
                ]}
              />

              <Select
                label="Assign To Team (Optional)"
                value={formData.assignedTeam}
                onChange={(e) => handleInputChange('assignedTeam', e.target.value)}
                options={[
                  { label: 'Mumbai North Team', value: 'Mumbai North Team' },
                  { label: 'Pune Central Team', value: 'Pune Central Team' },
                  { label: 'Thane Territory Team', value: 'Thane Territory Team' },
                ]}
              />

              <Select
                label="Source"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                options={[
                  { label: 'Field Visit', value: 'Field Visit' },
                  { label: 'Website Lead', value: 'Website Lead' },
                  { label: 'Referral', value: 'Referral' },
                  { label: 'Cold Call', value: 'Cold Call' },
                  { label: 'Exhibition', value: 'Exhibition' },
                ]}
              />

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
        <div className="space-y-6 lg:col-span-4 sticky top-4 self-start">
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
