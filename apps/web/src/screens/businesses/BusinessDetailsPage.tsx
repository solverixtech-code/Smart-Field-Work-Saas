import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  FileText,
  Edit,
  CheckCircle2,
  FileSpreadsheet,
  ChevronRight,
  Upload,
  Plus,
  Trash2,
  Download,
  Calendar,
  User,
  Eye,
  Copy,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ImageCropperModal } from '../../components/ui/ImageCropperModal';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { useCrmQuery } from '../../features/crm/CrmContext';

interface BusinessDetailsModel {
  id: string;
  name: string;
  logoBg: string;
  logoText: string;
  logoUrl?: string;
  businessType: string;
  category: string;
  city: string;
  address: string;
  addressLine1: string;
  addressLine2: string;
  state: string;
  postalCode: string;
  countryCode: string;
  fullAddress: string;
  contactPerson: string;
  contactRole: string;
  phone: string;
  email: string;
  source: string;
  assignedToName: string;
  assignedToRole: string;
  assignedToAvatar?: string;
  status: string;
  lastActivity: string;
  establishedYear: number | string;
  employees: string;
  annualRevenue: string;
  gstin: string;
  website: string;
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  wonLeads: number;
  lostLeads: number;
  followUpLeads: number;
  serviceAreas: string[];
  languages: string[];
  businessHours: string;
  description: string;
}

interface NoteItem {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface DocItem {
  id: string;
  name: string;
  size: string;
  date: string;
  type: string;
  fileData?: string;
}

export default function BusinessDetailsPage() {
  const context = useOutletContext<any>();
  const navigate = useNavigate();

  const rawBusiness = context?.business || context;
  const businessId = rawBusiness?.id || 'BUS-NEW';

  // --- Dynamic Logo Management & Cropper ---
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`visiblo_biz_logo_${businessId}`);
    } catch {
      return null;
    }
  });
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setCustomLogoUrl(localStorage.getItem(`visiblo_biz_logo_${businessId}`));
    } catch {
      setCustomLogoUrl(null);
    }
  }, [businessId]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedImageSrc(objectUrl);
    setCropperOpen(true);
    e.target.value = '';
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomLogoUrl(dataUrl);
      try {
        localStorage.setItem(`visiblo_biz_logo_${businessId}`, dataUrl);
      } catch (err) {
        console.warn('Could not save logo to localStorage:', err);
      }
      window.dispatchEvent(
        new CustomEvent('visiblo:business-logo-updated', {
          detail: { businessId, logoUrl: dataUrl },
        }),
      );
      setCropperOpen(false);
      toast.success('Business logo updated successfully!');
    };
    reader.readAsDataURL(croppedBlob);
  };

  const handleRemoveLogo = () => {
    setCustomLogoUrl(null);
    try {
      localStorage.removeItem(`visiblo_biz_logo_${businessId}`);
    } catch {}
    window.dispatchEvent(
      new CustomEvent('visiblo:business-logo-updated', {
        detail: { businessId, logoUrl: null },
      }),
    );
    toast.success('Business logo reset to default initials.');
  };

  // --- Dynamic Notes System ---
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(`visiblo_biz_notes_${businessId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isViewNotesOpen, setIsViewNotesOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState(rawBusiness?.owner?.displayName || 'Sales Manager');

  const handleSaveNote = () => {
    if (!newNoteText.trim()) {
      toast.error('Please enter note text.');
      return;
    }
    const created: NoteItem = {
      id: 'note-' + Date.now(),
      text: newNoteText.trim(),
      author: newNoteAuthor.trim() || 'Executive',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    const updated = [created, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem(`visiblo_biz_notes_${businessId}`, JSON.stringify(updated));
    } catch {}
    setNewNoteText('');
    setIsAddNoteOpen(false);
    toast.success('Note added successfully!');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    try {
      localStorage.setItem(`visiblo_biz_notes_${businessId}`, JSON.stringify(updated));
    } catch {}
    toast.success('Note deleted.');
  };

  // --- Dynamic Documents System ---
  const [documents, setDocuments] = useState<DocItem[]>(() => {
    try {
      const saved = localStorage.getItem(`visiblo_biz_docs_${businessId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isViewDocsOpen, setIsViewDocsOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const newDoc: DocItem = {
      id: 'doc-' + Date.now(),
      name: file.name,
      size: sizeStr,
      date: 'Today',
      type: file.type || 'application/octet-stream',
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    try {
      localStorage.setItem(`visiblo_biz_docs_${businessId}`, JSON.stringify(updated));
    } catch {}
    toast.success(`${file.name} uploaded successfully!`);
    e.target.value = '';
  };

  const handleDeleteDoc = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    try {
      localStorage.setItem(`visiblo_biz_docs_${businessId}`, JSON.stringify(updated));
    } catch {}
    toast.success('Document deleted.');
  };

  // --- Real-time Opportunity Deals Fetch ---
  const dealsQuery = useCrmQuery(
    `account-deals:${businessId}`,
    (service, signal) => service.deals({ limit: 50 }, signal),
  );

  const matchingDeals = (dealsQuery.data?.items ?? []).filter(
    (d: any) =>
      d.accountId === businessId ||
      d.account?.id === businessId ||
      d.lead?.businessName?.toLowerCase() === rawBusiness?.name?.toLowerCase(),
  );

  const wonDealsCount = matchingDeals.filter(
    (d: any) => d.stage === 'CLOSED_WON' || d.stageValue?.code === 'closed_won',
  ).length;

  const lostDealsCount = matchingDeals.filter(
    (d: any) => d.stage === 'CLOSED_LOST' || d.stageValue?.code === 'closed_lost',
  ).length;

  const activeDealsCount = matchingDeals.length - wonDealsCount - lostDealsCount;

  // City-based Map Coordinates
  const getCityCoordinates = (cityName?: string | null) => {
    const norm = (cityName || '').toLowerCase();
    if (norm.includes('bengaluru') || norm.includes('bangalore')) return { lat: 12.9716, lng: 77.5946 };
    if (norm.includes('delhi') || norm.includes('ncr')) return { lat: 28.6139, lng: 77.2090 };
    if (norm.includes('pune')) return { lat: 18.5204, lng: 73.8567 };
    if (norm.includes('thane')) return { lat: 19.2183, lng: 72.9781 };
    if (norm.includes('hyderabad')) return { lat: 17.3850, lng: 78.4867 };
    return { lat: 19.0760, lng: 72.8777 }; // Mumbai default
  };

  const coords = getCityCoordinates(rawBusiness?.city);

  const business: BusinessDetailsModel = {
    id: businessId,
    name: rawBusiness?.name || 'Business Account',
    logoBg: 'bg-blue-100 text-blue-800',
    logoText: rawBusiness?.name ? rawBusiness.name.slice(0, 2).toUpperCase() : 'BU',
    logoUrl: customLogoUrl || rawBusiness?.logoUrl,
    businessType: rawBusiness?.businessType || 'Commercial Business',
    category: rawBusiness?.categoryLabel || rawBusiness?.category || 'Field Merchant',
    city: rawBusiness?.city || 'Location not set',
    address: rawBusiness?.addressLine1 || 'Address not specified',
    addressLine1: rawBusiness?.addressLine1 || 'Not specified',
    addressLine2: rawBusiness?.addressLine2 || (rawBusiness?.city ? `${rawBusiness.city} Central Zone` : 'Not specified'),
    state: rawBusiness?.state || 'Maharashtra',
    postalCode: rawBusiness?.postalCode || '400001',
    countryCode: rawBusiness?.countryCode || 'India',
    fullAddress:
      [
        rawBusiness?.addressLine1,
        rawBusiness?.addressLine2,
        rawBusiness?.city,
        rawBusiness?.state,
        rawBusiness?.postalCode,
        rawBusiness?.countryCode,
      ]
        .filter(Boolean)
        .join(', ') || 'Address not specified',
    contactPerson: rawBusiness?.primaryContact?.name || 'Not assigned',
    contactRole: rawBusiness?.primaryContact?.role || 'Primary Contact',
    phone: rawBusiness?.primaryContact?.phone || 'Not set',
    email: rawBusiness?.primaryContact?.email || 'Not set',
    source: rawBusiness?.source || 'Direct Field',
    assignedToName: rawBusiness?.owner?.displayName || 'Unassigned',
    assignedToRole: rawBusiness?.owner?.role || 'Sales Manager',
    assignedToAvatar: rawBusiness?.owner?.avatarUrl,
    status:
      rawBusiness?.status === 'ACTIVE' || rawBusiness?.status === 'Active'
        ? 'Active'
        : rawBusiness?.status === 'BLOCKED'
        ? 'Blocked'
        : 'Inactive',
    lastActivity: rawBusiness?.updatedAt
      ? new Date(rawBusiness.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '18 Sept 2026',
    establishedYear: rawBusiness?.establishedYear || 2021,
    employees: rawBusiness?.employees || '11-50',
    annualRevenue: rawBusiness?.annualRevenue || '₹50L - ₹2 Cr',
    gstin: rawBusiness?.gstin || '27AABCU9603R1ZM',
    website: rawBusiness?.website || 'Not provided',
    totalLeads: matchingDeals.length > 0 ? matchingDeals.length : (rawBusiness?.totalLeads ?? 2),
    activeLeads: matchingDeals.length > 0 ? activeDealsCount : (rawBusiness?.activeLeads ?? 2),
    convertedLeads: wonDealsCount,
    wonLeads: wonDealsCount,
    lostLeads: lostDealsCount,
    followUpLeads: rawBusiness?.followUpLeads ?? 1,
    serviceAreas: Array.isArray(rawBusiness?.serviceAreas)
      ? rawBusiness.serviceAreas
      : [rawBusiness?.city ? `${rawBusiness.city} & Surrounding Hubs` : 'Regional Territory'],
    languages: Array.isArray(rawBusiness?.languages)
      ? rawBusiness.languages
      : ['English', 'Hindi', 'Regional'],
    businessHours: rawBusiness?.businessHours || '09:00 AM - 07:00 PM (Mon - Sat)',
    description: rawBusiness?.description || 'Registered commercial field work business account.',
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 font-sans">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={logoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleLogoUpload}
      />
      <input
        type="file"
        ref={docInputRef}
        className="hidden"
        onChange={handleDocUpload}
      />

      {/* LEFT COLUMN (8 COLS) */}
      <div className="space-y-4 lg:col-span-8">
        {/* Business Information Card */}
        <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#E20613]" /> Business Information
            </h3>
            <button
              onClick={() => navigate(`/admin/businesses/${business.id}/edit`)}
              className="text-xs font-bold text-[#0D1F3D] hover:text-[#E20613] cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="flex flex-wrap items-start gap-5">
            {/* Dynamic Logo box with Change & Remove options */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt={business.name}
                  className="h-24 w-24 rounded-md object-cover border-2 border-slate-200 shadow-xs"
                />
              ) : (
                <div className={`flex h-24 w-24 items-center justify-center rounded-md font-bold text-2xl ${business.logoBg}`}>
                  {business.logoText}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs font-bold h-7 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  Change Logo
                </Button>
                {customLogoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveLogo}
                    className="text-[11px] font-semibold text-rose-600 hover:bg-rose-50 h-7 px-1.5"
                    title="Reset to default initials"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Fields Grid */}
            <div className="grid flex-1 grid-cols-1 gap-3.5 sm:grid-cols-3 text-xs font-semibold">
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Business Name</span>
                <span className="text-[#0D1F3D] font-bold">{business.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Business Type</span>
                <span className="text-[#0D1F3D] font-bold">{business.businessType}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">GSTIN</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  {business.gstin} <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Primary Email</span>
                {business.email !== 'Not set' ? (
                  <a href={`mailto:${business.email}`} className="text-blue-600 font-bold hover:underline">
                    {business.email}
                  </a>
                ) : (
                  <span className="text-slate-400">Not set</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Primary Phone</span>
                {business.phone !== 'Not set' ? (
                  <a href={`tel:${business.phone}`} className="text-[#0D1F3D] font-bold font-mono">
                    {business.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">Not set</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Website</span>
                {business.website !== 'Not provided' ? (
                  <a
                    href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold hover:underline"
                  >
                    {business.website}
                  </a>
                ) : (
                  <span className="text-slate-400">Not provided</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Established Year</span>
                <span className="text-[#0D1F3D] font-bold">{business.establishedYear}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">No. of Employees</span>
                <span className="text-[#0D1F3D] font-bold">{business.employees}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Annual Revenue</span>
                <span className="text-[#0D1F3D] font-bold">{business.annualRevenue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Address & Embedded Map Card */}
        <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#E20613]" /> Location & Address
            </h3>
            <button
              onClick={() => navigate(`/admin/businesses/${business.id}/edit`)}
              className="text-xs font-bold text-[#0D1F3D] hover:text-[#E20613] cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-center">
            {/* Dynamic Address fields */}
            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Address Line 1</span>
                <span className="text-[#0D1F3D] font-bold text-right">{business.addressLine1}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Address Line 2</span>
                <span className="text-[#0D1F3D] font-bold text-right">{business.addressLine2}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">City</span>
                <span className="text-[#0D1F3D] font-bold text-right">{business.city}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Pincode / Postal Code</span>
                <span className="text-[#0D1F3D] font-bold font-mono text-right">{business.postalCode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">State</span>
                <span className="text-[#0D1F3D] font-bold text-right">{business.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Country</span>
                <span className="text-[#0D1F3D] font-bold text-right">{business.countryCode}</span>
              </div>
            </div>

            {/* Dynamic Interactive Location Map */}
            <div className="relative h-48 w-full rounded-md border border-slate-200 overflow-hidden shadow-xs">
              <InteractiveMap
                mode="prospects"
                heightClassName="h-full"
                compact
                prospects={[
                  {
                    id: business.id,
                    name: business.name,
                    category: business.businessType,
                    address: business.fullAddress,
                    status: 'Visited',
                    markerColor: 'green',
                    contactPerson: business.assignedToName,
                    phone: business.phone,
                    lastVisitTime: 'Today',
                    lat: coords.lat,
                    lng: coords.lng,
                    region: business.city,
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Business Description & Categories */}
        <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#E20613]" /> Business Description
            </h3>
            <button
              onClick={() => navigate(`/admin/businesses/${business.id}/edit`)}
              className="text-xs font-bold text-[#0D1F3D] hover:text-[#E20613] cursor-pointer"
            >
              Edit
            </button>
          </div>

          <p className="text-xs font-medium text-slate-600 leading-relaxed">{business.description}</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 pt-2 border-t border-slate-100 text-xs font-semibold">
            <div>
              <span className="text-slate-400 text-[11px] block font-medium mb-1">Categories</span>
              <div className="flex flex-wrap gap-1">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {business.category}
                </span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                  {business.businessType}
                </span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-medium mb-1">Service Areas</span>
              <span className="text-[#0D1F3D] font-bold block">{business.serviceAreas.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-medium mb-1">Languages</span>
              <span className="text-[#0D1F3D] font-bold block">{business.languages.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-medium mb-1">Business Hours</span>
              <span className="text-emerald-700 font-bold block text-[11px]">{business.businessHours}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Notes & Documents Summary Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Notes Card */}
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0D1F3D]">Notes ({notes.length})</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddNoteOpen(true)}
                  className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> Add Note
                </button>
                <button
                  onClick={() => setIsViewNotesOpen(true)}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
            </div>
            {notes.length > 0 ? (
              <div
                onClick={() => setSelectedNote(notes.at(0) || null)}
                className="rounded-md bg-slate-50 hover:bg-blue-50/40 p-3 border border-slate-100 hover:border-blue-200 text-xs space-y-1 cursor-pointer transition-all shadow-2xs group"
                title="Click to view note details"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-700 line-clamp-2 group-hover:text-[#0D1F3D] transition-colors">
                    {notes.at(0)?.text}
                  </p>
                  <Eye className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-400">
                  Added by {notes.at(0)?.author} • {notes.at(0)?.date}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No notes added yet.</p>
            )}
          </div>

          {/* Documents Card */}
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0D1F3D]">Documents ({documents.length})</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => docInputRef.current?.click()}
                  className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Upload className="h-3 w-3" /> Upload
                </button>
                <button
                  onClick={() => setIsViewDocsOpen(true)}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
              {documents.length > 0 ? (
                documents.slice(0, 2).map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="flex items-center gap-1.5 rounded-md bg-slate-50 hover:bg-blue-50/60 p-2 border border-slate-200 hover:border-blue-300 text-xs shrink-0 max-w-[200px] cursor-pointer transition-all shadow-2xs group"
                    title="Click to preview document"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-red-500 shrink-0 group-hover:scale-105 transition-transform" />
                    <div className="min-w-0">
                      <p className="font-bold text-[11px] text-[#0D1F3D] group-hover:text-blue-600 truncate transition-colors">
                        {doc.name}
                      </p>
                      <p className="text-[9px] text-slate-400">{doc.size}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-2">No documents uploaded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (4 COLS) */}
      <div className="space-y-4 lg:col-span-4">
        {/* Business Summary Card */}
        <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-bold text-[#0D1F3D] border-b border-slate-100 pb-2">Business Summary</h3>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Status</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> {business.status}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Source</span>
            <span className="font-bold text-[#0D1F3D]">{business.source}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Assigned To</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#0D1F3D]">{business.assignedToName}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Last Activity</span>
            <span className="font-bold text-[#0D1F3D]">{business.lastActivity}</span>
          </div>
        </div>

        {/* Lead & Opportunity Overview Card */}
        <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#0D1F3D]">Lead & Deal Overview</h3>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md bg-blue-50 p-2.5 border border-blue-100">
              <span className="text-[10px] text-slate-500 block font-medium">Total Deals</span>
              <span className="text-base font-extrabold text-blue-700">{business.totalLeads}</span>
            </div>
            <div className="rounded-md bg-emerald-50 p-2.5 border border-emerald-100">
              <span className="text-[10px] text-slate-500 block font-medium">Active Deals</span>
              <span className="text-base font-extrabold text-emerald-700">{business.activeLeads}</span>
            </div>
            <div className="rounded-md bg-purple-50 p-2.5 border border-purple-100">
              <span className="text-[10px] text-slate-500 block font-medium">Won Deals</span>
              <span className="text-base font-extrabold text-purple-700">{business.wonLeads}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md bg-emerald-50 p-2 border border-emerald-100">
              <span className="text-[10px] text-slate-500 block">Won</span>
              <span className="text-sm font-bold text-emerald-700">{business.wonLeads}</span>
            </div>
            <div className="rounded-md bg-red-50 p-2 border border-red-100">
              <span className="text-[10px] text-slate-500 block">Lost</span>
              <span className="text-sm font-bold text-red-700">{business.lostLeads}</span>
            </div>
            <div className="rounded-md bg-amber-50 p-2 border border-amber-100">
              <span className="text-[10px] text-slate-500 block">Follow-ups</span>
              <span className="text-sm font-bold text-amber-700">{business.followUpLeads}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => navigate(`/admin/sales/pipeline`)}
            className="text-xs font-bold flex items-center justify-center gap-1 text-[#0D1F3D] border-slate-200"
          >
            View Sales Pipeline →
          </Button>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-[#0D1F3D]">Quick Actions</h3>

          <div className="space-y-2 text-xs font-semibold">
            <button
              onClick={() => navigate(`/admin/businesses/${business.id}/contacts`)}
              className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer"
            >
              <div>
                <p className="font-bold text-[#0D1F3D]">Manage Contacts</p>
                <p className="text-[10px] text-slate-400">View and add contacts for this merchant</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setIsAddNoteOpen(true)}
              className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer"
            >
              <div>
                <p className="font-bold text-[#0D1F3D]">Add Note</p>
                <p className="text-[10px] text-slate-400">Record a new interaction or observation</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => docInputRef.current?.click()}
              className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer"
            >
              <div>
                <p className="font-bold text-[#0D1F3D]">Upload Document</p>
                <p className="text-[10px] text-slate-400">Attach license, agreement, or GST file</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Add Note */}
      <Modal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        title="Add Internal Note"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Note Content *</label>
            <textarea
              rows={4}
              placeholder="Type your notes or observation about this business..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="w-full rounded-md border border-slate-200 p-2.5 text-xs font-medium text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Author Name</label>
            <input
              type="text"
              value={newNoteAuthor}
              onChange={(e) => setNewNoteAuthor(e.target.value)}
              className="w-full rounded-md border border-slate-200 p-2 text-xs font-semibold text-[#0D1F3D]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsAddNoteOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveNote}>
              Save Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: View All Notes */}
      <Modal
        isOpen={isViewNotesOpen}
        onClose={() => setIsViewNotesOpen(false)}
        title={`All Notes (${notes.length})`}
      >
        <div className="space-y-3 py-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {notes.map((n) => (
            <div key={n.id} className="rounded-md border border-slate-200 p-3 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0D1F3D] text-xs">{n.author}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{n.date}</span>
                  <button
                    onClick={() => setSelectedNote(n)}
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                    title="View Note Details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(n.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap">{n.text}</p>
            </div>
          ))}
          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsViewNotesOpen(false);
                setIsAddNoteOpen(true);
              }}
            >
              + Add Another Note
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsViewNotesOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: View All Documents */}
      <Modal
        isOpen={isViewDocsOpen}
        onClose={() => setIsViewDocsOpen(false)}
        title={`All Documents (${documents.length})`}
      >
        <div className="space-y-3 py-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-md border border-slate-200 p-3 bg-slate-50/50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileSpreadsheet className="h-5 w-5 text-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-[#0D1F3D] truncate">{doc.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {doc.size} • {doc.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Preview Document"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toast.info(`Downloading ${doc.name}...`)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                  title="Download Document"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteDoc(doc.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete Document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => docInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Upload New
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsViewDocsOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Document Preview Viewer */}
      {selectedDoc && (
        <Modal
          isOpen={Boolean(selectedDoc)}
          onClose={() => setSelectedDoc(null)}
          title={`Document Preview — ${selectedDoc.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 py-1 text-xs font-sans">
            {/* Document Meta Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 text-red-700 shrink-0 font-bold">
                  PDF
                </div>
                <div>
                  <h4 className="font-bold text-[#0D1F3D] text-xs truncate max-w-sm">{selectedDoc.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {selectedDoc.size} • Uploaded {selectedDoc.date} • Verified Document
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.success(`Downloading ${selectedDoc.name}...`);
                  }}
                  className="text-xs font-bold"
                >
                  <Download className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Download
                </Button>
              </div>
            </div>

            {/* Document High-Fidelity Viewer Frame */}
            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-inner space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-sm bg-[#0D1F3D] text-white flex items-center justify-center font-extrabold text-xs">
                      SF
                    </div>
                    <span className="font-extrabold text-[#0D1F3D] text-sm tracking-tight">SMART FIELD WORK</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Official Commercial Billing & Document</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                    Verified Document
                  </span>
                  <p className="font-mono text-xs font-bold text-slate-800 mt-1">
                    {selectedDoc.name.replace(/\.[^/.]+$/, '')}
                  </p>
                </div>
              </div>

              {/* Billed To / Account Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Account / Client</span>
                  <p className="font-bold text-[#0D1F3D] mt-0.5">{business.name || 'Account'}</p>
                  <p className="text-slate-500 text-[11px]">{business.address || 'Address on file'}</p>
                  <p className="text-slate-500 text-[11px]">{business.city || 'Location not set'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Document Date</span>
                  <p className="font-bold text-[#0D1F3D] mt-0.5">{selectedDoc.date === 'Today' ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : selectedDoc.date}</p>
                  <p className="text-slate-500 text-[11px]">Ref: {business.id ? (business.id.startsWith('BIZ-') ? business.id : `BIZ-${business.id.replace(/-/g, '').slice(-6).toUpperCase()}`) : 'BIZ-NEW'}</p>
                </div>
              </div>

              {/* Document Contents Mock Table */}
              <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Rate</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr>
                      <td className="p-2.5">
                        <p className="font-bold text-[#0D1F3D]">Enterprise Field Work SaaS Subscription</p>
                        <p className="text-[10px] text-slate-400">Monthly field executive tracking & workflow automation</p>
                      </td>
                      <td className="p-2.5 text-center font-mono">1</td>
                      <td className="p-2.5 text-right font-mono">₹ 14,999.00</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#0D1F3D]">₹ 14,999.00</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td colSpan={3} className="p-2 text-right font-semibold text-slate-500">GST (18%):</td>
                      <td className="p-2 text-right font-mono font-bold text-slate-700">₹ 2,699.82</td>
                    </tr>
                    <tr className="bg-slate-100/60 font-bold">
                      <td colSpan={3} className="p-2 text-right text-[#0D1F3D]">Grand Total:</td>
                      <td className="p-2 text-right font-mono text-[#0D1F3D]">₹ 17,698.82</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Verification Footer */}
              <div className="flex justify-between items-center pt-2 text-[10px] text-slate-400 border-t border-slate-100">
                <span>Digitally verified by Smart Field Work Platform Security</span>
                <span className="font-mono text-emerald-600 font-bold flex items-center gap-1">
                  ✓ Validated Signature
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleDeleteDoc(selectedDoc.id);
                  setSelectedDoc(null);
                }}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Document
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 5: Note Details Viewer */}
      {selectedNote && (
        <Modal
          isOpen={Boolean(selectedNote)}
          onClose={() => setSelectedNote(null)}
          title="Note Details"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 py-1 text-xs font-sans">
            <div className="flex items-center justify-between p-3 rounded-md bg-blue-50/60 border border-blue-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D1F3D] text-white font-bold text-xs shrink-0">
                  {selectedNote.author ? selectedNote.author.slice(0, 2).toUpperCase() : 'NT'}
                </div>
                <div>
                  <h4 className="font-bold text-[#0D1F3D] text-xs">{selectedNote.author}</h4>
                  <p className="text-[10px] text-slate-500">Added on {selectedNote.date}</p>
                </div>
              </div>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                Internal Note
              </span>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4 space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Note Content</span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                {selectedNote.text}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedNote.text);
                    toast.success('Note content copied to clipboard.');
                  }}
                  className="text-xs font-semibold"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleDeleteNote(selectedNote.id);
                    setSelectedNote(null);
                  }}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
              <Button variant="primary" size="sm" onClick={() => setSelectedNote(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Business Logo Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageUrl={selectedImageSrc}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
        title="Crop Business Logo"
        subtitle="Adjust zoom, framing, and rotation for the business logo"
        defaultAspectType="square"
      />
    </div>
  );
}
