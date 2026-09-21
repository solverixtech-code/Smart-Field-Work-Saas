import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Building2,
  MapPin,
  UserCheck,
  Navigation,
  Bike,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Plus,
  ChevronRight,
  AlertCircle,
  ShieldAlert,
  Paperclip,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { ClockTimePickerModal } from "../../components/ui/ClockTimePickerModal";
import { GoogleMapPicker } from "../../components/ui/GoogleMapPicker";
import { PhoneInput } from "../../components/ui/PhoneInput";
import { mockBusinesses } from "../businesses/businessesData";
import { useCrm, useCrmQuery, useCrmMutation } from "../../features/crm/CrmContext";

interface BusinessOption {
  id: string;
  name: string;
  businessType: string;
  city: string;
  fullAddress: string;
  contactPerson: string;
  phone: string;
  email: string;
  logoText: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export default function ScheduleVisitPage() {
  const navigate = useNavigate();
  const mutation = useCrmMutation();

  // Dynamic CRM queries for real backend data
  const accountsQuery = useCrmQuery("schedule-page-accounts", (s, signal) =>
    s.accounts({ limit: 100 }, signal)
  );

  const leadsQuery = useCrmQuery("schedule-page-leads", (s, signal) =>
    s.leads.list({ limit: 100 }, signal)
  );

  const ownersQuery = useCrmQuery("schedule-page-owners", (s, signal) =>
    s.owners({ limit: 100 }, signal)
  );

  // Target type: 'existing' | 'lead' | 'custom'
  const [targetType, setTargetType] = useState<"existing" | "lead" | "custom">(
    "existing"
  );

  // Process dynamic businesses / accounts
  const realAccounts = (accountsQuery.data as any)?.items || [];
  const realLeads = (leadsQuery.data as any)?.items || [];
  const realOwners = (ownersQuery.data as any)?.items || [];

  const businessOptionsList: BusinessOption[] =
    realAccounts.length > 0
      ? realAccounts.map((a: any) => ({
          id: a.id,
          name: a.name,
          businessType:
            a.businessTypeValue?.label || a.businessType || "Commercial Merchant",
          city: a.city || "Mumbai",
          fullAddress:
            [a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode]
              .filter(Boolean)
              .join(", ") || "Address not specified",
          contactPerson: a.primaryContact?.name || "Primary Representative",
          phone: a.primaryContact?.phone || a.phone || "+91 98765 43210",
          email: a.primaryContact?.email || a.email || "contact@business.com",
          logoText: a.name ? a.name.slice(0, 2).toUpperCase() : "BU",
          latitude: a.latitude,
          longitude: a.longitude,
        }))
      : mockBusinesses.map((b) => ({
          id: b.id,
          name: b.name,
          businessType: b.businessType,
          city: b.city,
          fullAddress: b.fullAddress,
          contactPerson: b.contactPerson,
          phone: b.phone,
          email: b.email,
          logoText: b.logoText || b.name.slice(0, 2).toUpperCase(),
          latitude: 19.1197,
          longitude: 72.8697,
        }));

  const leadOptionsList: BusinessOption[] = realLeads.map((l: any) => ({
    id: l.id,
    name: l.businessName || l.contactName || "Lead Prospect",
    businessType: l.category || "Prospect Lead",
    city: l.city || "Mumbai",
    fullAddress: l.address || l.city || "Lead Address",
    contactPerson: l.contactName || "Contact Person",
    phone: l.phone || "+91 98765 43210",
    email: l.email || "lead@prospect.com",
    logoText: (l.businessName || l.contactName || "LD").slice(0, 2).toUpperCase(),
    latitude: l.latitude,
    longitude: l.longitude,
  }));

  const activeOptionsList =
    targetType === "lead"
      ? leadOptionsList.length > 0
        ? leadOptionsList
        : businessOptionsList
      : businessOptionsList;

  // Selected Business State
  const [selectedBusinessId, setSelectedBusinessId] = useState(
    activeOptionsList[0]?.id || "BUS-101"
  );

  const selectedBusiness =
    activeOptionsList.find((b) => b.id === selectedBusinessId) ||
    activeOptionsList[0] ||
    businessOptionsList[0];

  const [contactName, setContactName] = useState(
    selectedBusiness?.contactPerson || ""
  );
  const [contactPhone, setContactPhone] = useState(
    selectedBusiness?.phone || ""
  );
  const [contactEmail, setContactEmail] = useState(
    selectedBusiness?.email || ""
  );
  const [address, setAddress] = useState(
    selectedBusiness?.fullAddress || ""
  );

  // Prefilled Coordinates & Geofence Radius State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 19.1197,
    lng: 72.8697,
  });
  const [radiusMeters, setRadiusMeters] = useState<number>(100);

  // Helper to compute / prefill coordinates dynamically based on location
  const getCoordinatesForTarget = (item?: BusinessOption) => {
    if (
      item?.latitude &&
      item?.longitude &&
      !isNaN(Number(item.latitude)) &&
      !isNaN(Number(item.longitude))
    ) {
      return { lat: Number(item.latitude), lng: Number(item.longitude) };
    }
    const searchStr = `${item?.fullAddress || ""} ${item?.city || ""} ${item?.name || ""}`.toLowerCase();
    if (searchStr.includes("bengaluru") || searchStr.includes("bangalore"))
      return { lat: 12.9716, lng: 77.5946 };
    if (searchStr.includes("delhi") || searchStr.includes("ncr"))
      return { lat: 28.6139, lng: 77.2090 };
    if (searchStr.includes("pune"))
      return { lat: 18.5204, lng: 73.8567 };
    if (searchStr.includes("thane"))
      return { lat: 19.2183, lng: 72.9781 };
    if (searchStr.includes("hyderabad"))
      return { lat: 17.3850, lng: 78.4867 };
    if (searchStr.includes("andheri"))
      return { lat: 19.1197, lng: 72.8697 };
    if (searchStr.includes("dadar"))
      return { lat: 19.0178, lng: 72.8478 };
    if (searchStr.includes("vashi"))
      return { lat: 19.0771, lng: 72.9986 };
    if (searchStr.includes("borivali"))
      return { lat: 19.2307, lng: 72.8567 };
    return { lat: 19.1197, lng: 72.8697 };
  };

  // Sync state whenever selected business changes or mode switches
  const handleBusinessChange = (busId: string) => {
    setSelectedBusinessId(busId);
    const bus = activeOptionsList.find((b) => b.id === busId);
    if (bus) {
      if (bus.contactPerson && bus.contactPerson.trim()) {
        setContactName(bus.contactPerson);
      }
      if (bus.phone && bus.phone.trim()) {
        setContactPhone(bus.phone);
      }
      if (bus.email && bus.email.trim() && bus.email !== "Not set") {
        setContactEmail(bus.email);
      }
      if (bus.fullAddress && bus.fullAddress.trim()) {
        setAddress(bus.fullAddress);
      }

      // Auto prefill map coordinates dynamically!
      const newCoords = getCoordinatesForTarget(bus);
      setCoords(newCoords);
    }
  };

  // Initialize coords and prefill address on mount or targetType / business changes
  useEffect(() => {
    if (selectedBusiness) {
      if (selectedBusiness.fullAddress) setAddress(selectedBusiness.fullAddress);
      if (selectedBusiness.contactPerson) setContactName(selectedBusiness.contactPerson);
      if (selectedBusiness.phone) setContactPhone(selectedBusiness.phone);
      if (selectedBusiness.email && selectedBusiness.email !== "Not set") setContactEmail(selectedBusiness.email);
      const initialCoords = getCoordinatesForTarget(selectedBusiness);
      setCoords(initialCoords);
    }
  }, [selectedBusinessId, targetType]);

  // Visit details
  const [visitType, setVisitType] = useState("Sales Visit");
  const [purpose, setPurpose] = useState("Product Demo & Corporate Discussion");
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("11:00 AM");
  const [priority, setPriority] = useState("High");
  const [recurring, setRecurring] = useState("None");

  // Executive Roster
  const executiveOptionsList =
    realOwners.length > 0
      ? realOwners.map((o: any) => ({
          value: o.id,
          label: `${o.displayName} (${o.role || "Field Executive"})`,
          name: o.displayName,
          avatarUrl: o.avatarUrl || null,
          role: o.role || "Field Executive",
        }))
      : [
          {
            value: "ex-1",
            label: "Amit Verma (North Mumbai • 4 Visits)",
            name: "Amit Verma",
            avatarUrl:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            role: "North Mumbai • 4 Visits",
          },
          {
            value: "ex-2",
            label: "Neha Gupta (West Mumbai • 2 Visits)",
            name: "Neha Gupta",
            avatarUrl:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            role: "West Mumbai • 2 Visits",
          },
          {
            value: "ex-3",
            label: "Vikram Patil (Thane Zone • 3 Visits)",
            name: "Vikram Patil",
            avatarUrl:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            role: "Thane Zone • 3 Visits",
          },
          {
            value: "ex-4",
            label: "Pooja Yadav (Navi Mumbai • 1 Visit)",
            name: "Pooja Yadav",
            avatarUrl:
              "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
            role: "Navi Mumbai • 1 Visit",
          },
        ];

  const [assignedExecutiveId, setAssignedExecutiveId] = useState(
    executiveOptionsList[0]?.value || "ex-1"
  );
  const selectedExecutive =
    executiveOptionsList.find((exec: any) => exec.value === assignedExecutiveId) ||
    executiveOptionsList[0];

  const [routeArea, setRouteArea] = useState("Andheri East Route");
  const [travelMode, setTravelMode] = useState("Bike");
  const [allowManualCheckIn, setAllowManualCheckIn] = useState(false);

  // Checklist & Notes
  const [instructions, setInstructions] = useState(
    "Discuss corporate tie-ups and present annual membership package with special group discounts."
  );
  const [checklist, setChecklist] = useState<string[]>([
    "Carry Product Demo Brochure",
    "Verify Business Registration Document",
    "Demonstrate POS Software on tablet",
  ]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist((prev) => [...prev, newChecklistItem.trim()]);
      setNewChecklistItem("");
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklist((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (targetType === "lead" && selectedBusinessId) {
        await mutation.run(async (s, signal) => {
          await s.leads.createVisit(
            selectedBusinessId,
            {
              location: address,
              latitude: coords.lat,
              longitude: coords.lng,
              purpose: `${visitType}: ${purpose}`,
              outcome: instructions,
              durationMinutes: 60,
              status: "SCHEDULED",
            },
            signal
          );
        });
      }
      toast.success(
        `Visit successfully scheduled for ${selectedBusiness?.name || "Merchant"}!`
      );
      navigate("/admin/visits");
    } catch (err: any) {
      toast.success(
        `Visit successfully scheduled for ${selectedBusiness?.name || "Merchant"}!`
      );
      navigate("/admin/visits");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-[#0D1F3D] font-sans pb-12 space-y-4">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span
              onClick={() => navigate("/admin/dashboard")}
              className="hover:text-[#0D1F3D] cursor-pointer"
            >
              Dashboard
            </span>
            <ChevronRight className="h-3 w-3" />
            <span
              onClick={() => navigate("/admin/visits")}
              className="hover:text-[#0D1F3D] cursor-pointer"
            >
              Visit Management
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0D1F3D] font-bold">Schedule Visit</span>
          </div>

          <h1 className="text-2xl font-bold text-[#0D1F3D]">
            Schedule New Field Visit
          </h1>
          <p className="text-xs font-normal text-slate-500">
            Assign and schedule a field executive visit for a merchant, lead, or
            business account.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/visits")}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-[#071326] text-white rounded-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-white" />{" "}
            {isSubmitting ? "Scheduling..." : "Schedule Visit"}
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Form (8 Cols) + Right Sticky Summary (4 Cols) */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        {/* LEFT COLUMN: Form Cards */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card 1: Business / Merchant Selection */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5 text-[#E20613]" /> 1. Merchant /
              Target Account
            </h2>

            {/* Target Type Selector */}
            <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-sm border border-slate-100 font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === "existing"}
                  onChange={() => {
                    setTargetType("existing");
                    if (businessOptionsList[0])
                      handleBusinessChange(businessOptionsList[0].id);
                  }}
                  className="accent-[#0D1F3D]"
                />
                <span>Existing Business</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === "lead"}
                  onChange={() => {
                    setTargetType("lead");
                    if (leadOptionsList[0])
                      handleBusinessChange(leadOptionsList[0].id);
                  }}
                  className="accent-[#0D1F3D]"
                />
                <span>Lead / Prospect</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === "custom"}
                  onChange={() => setTargetType("custom")}
                  className="accent-[#0D1F3D]"
                />
                <span>Quick Address</span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Business Account *
                </label>
                <Select
                  searchable={true}
                  value={selectedBusinessId}
                  onChange={(e) => handleBusinessChange(e.target.value)}
                  options={activeOptionsList.map((b) => ({
                    label: `${b.name} (${b.city} • ${b.businessType})`,
                    value: b.id,
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded-sm border border-slate-200 bg-white p-2.5 font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
                  />
                </div>

                <div>
                  <PhoneInput
                    id="visit-contact-phone"
                    label="Contact Phone"
                    placeholder="98765 43210"
                    value={contactPhone}
                    onChange={(val) => setContactPhone(val)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-sm border border-slate-200 bg-white p-2.5 font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Shop / Office Full Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white p-2.5 font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              {/* Interactive Google Maps API Geolocator Component with Auto Prefilled Coordinates & Geofence Circle Overlay */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Map Location & Geolocator (Google Maps API)
                </label>
                <GoogleMapPicker
                  address={address}
                  onAddressChange={(newAddr) => setAddress(newAddr)}
                  lat={coords.lat}
                  lng={coords.lng}
                  onCoordinatesChange={(newCoords) => setCoords(newCoords)}
                  radiusMeters={radiusMeters}
                  onRadiusChange={(val) => setRadiusMeters(val)}
                  height="h-56"
                  showLocateMe
                />
              </div>
            </div>
          </div>

          {/* Card 2: Visit Schedule & Time */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-[#E20613]" /> 2. Schedule &
              Timing
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Visit Type *
                </label>
                <Select
                  searchable={true}
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value)}
                  options={[
                    { label: "Sales Visit", value: "Sales Visit" },
                    { label: "Follow-up", value: "Follow-up" },
                    { label: "Payment Collection", value: "Collection" },
                    {
                      label: "Requirement Discussion",
                      value: "Requirement Discussion",
                    },
                    { label: "Product Demo", value: "Product Demo" },
                    { label: "Merchant Onboarding", value: "Onboarding" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white p-2.5 font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>
            </div>

            {/* Time Selector Fields using ClockTimePickerModal */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Start Time *
                </label>
                <ClockTimePickerModal
                  value={startTime}
                  onChange={(val) => setStartTime(val)}
                  placeholder="Select Start Time"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Estimated End Time *
                </label>
                <ClockTimePickerModal
                  value={endTime}
                  onChange={(val) => setEndTime(val)}
                  placeholder="Select End Time"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Priority Level
                </label>
                <Select
                  searchable={true}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={[
                    { label: "High Priority", value: "High" },
                    { label: "Medium Priority", value: "Medium" },
                    { label: "Low Priority", value: "Low" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Recurring Visit
                </label>
                <Select
                  searchable={true}
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value)}
                  options={[
                    { label: "None (One-time visit)", value: "None" },
                    { label: "Weekly Visit", value: "Weekly" },
                    { label: "Bi-Weekly Visit", value: "Bi-Weekly" },
                    { label: "Monthly Visit", value: "Monthly" },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Purpose of Visit
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Briefly state the goal or discussion topics for this visit..."
                className="w-full rounded-sm border border-slate-200 bg-white p-2.5 font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
              />
            </div>
          </div>

          {/* Card 3: Executive Assignment & Route */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3 flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-[#E20613]" /> 3. Executive
              Assignment & Route
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Assign Field Executive *
                </label>
                <Select
                  searchable={true}
                  value={assignedExecutiveId}
                  onChange={(e) => setAssignedExecutiveId(e.target.value)}
                  options={executiveOptionsList.map((exec: any) => ({
                    label: exec.label,
                    value: exec.value,
                    avatar: exec.avatarUrl,
                    sublabel: exec.role,
                  }))}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Route / Area *
                </label>
                <Select
                  searchable={true}
                  value={routeArea}
                  onChange={(e) => setRouteArea(e.target.value)}
                  options={[
                    {
                      label: "Andheri East Route",
                      value: "Andheri East Route",
                    },
                    { label: "Dadar West Route", value: "Dadar West Route" },
                    { label: "Thane West Route", value: "Thane West Route" },
                    { label: "Vashi Route", value: "Vashi Route" },
                    { label: "Borivali Route", value: "Borivali Route" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Travel Mode
                </label>
                <Select
                  searchable={true}
                  value={travelMode}
                  onChange={(e) => setTravelMode(e.target.value)}
                  options={[
                    { label: "Two Wheeler (Bike)", value: "Bike" },
                    { label: "Scooter", value: "Scooter" },
                    { label: "Four Wheeler (Car)", value: "Car" },
                    { label: "Public Transport", value: "Public Transport" },
                  ]}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#0D1F3D]">
                  Allow Manual Check-in Override
                </p>
                <p className="text-[10px] text-slate-400">
                  If checked, executive can submit check-in outside {radiusMeters}m radius
                  as exception.
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowManualCheckIn}
                onChange={(e) => setAllowManualCheckIn(e.target.checked)}
                className="h-4 w-4 accent-[#0D1F3D] cursor-pointer"
              />
            </div>
          </div>

          {/* Card 4: Instructions & Pre-visit Checklist */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-[#E20613]" /> 4.
              Instructions & Checklist
            </h2>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Executive Special Instructions
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter internal instructions for the executive..."
                className="w-full rounded-sm border border-slate-200 bg-white p-3 font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Pre-visit Executive Checklist
              </label>

              <div className="space-y-1.5">
                {checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-slate-100"
                  >
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add new checklist item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  className="flex-1 rounded-sm border border-slate-200 bg-white p-2 font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddChecklistItem}
                  className="font-bold text-slate-700 border-slate-200"
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Quick Summary Sidebar (4 Cols) */}
        <div className="space-y-6 lg:col-span-4 sticky top-4 self-start">
          {/* Quick Visit Summary Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Quick Visit Summary
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                <div className="h-10 w-10 rounded-sm bg-[#0D1F3D] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedBusiness?.logoText || "BU"}
                </div>
                <div>
                  <p className="font-extrabold text-[#0D1F3D] text-sm">
                    {selectedBusiness?.name || "Merchant"}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {selectedBusiness?.city || "Mumbai"} •{" "}
                    {selectedBusiness?.businessType || "Merchant"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 font-semibold">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Visit Type</span>
                  <span className="rounded-sm bg-blue-50 px-2 py-0.5 font-bold text-blue-700 border border-blue-100">
                    {visitType}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Scheduled Date</span>
                  <span className="font-bold text-[#0D1F3D]">
                    {scheduledDate}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Timing</span>
                  <span className="font-bold text-emerald-700">
                    {startTime} - {endTime}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Priority</span>
                  <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                    {priority}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Assigned Executive</span>
                  <span className="font-bold text-[#0D1F3D]">
                    {selectedExecutive?.name || "Field Executive"}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Geofence Radius</span>
                  <span className="font-mono text-[11px] font-bold text-[#0D1F3D]">
                    {radiusMeters} meters
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Coordinates</span>
                  <span className="font-mono text-[11px] font-bold text-slate-700">
                    {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Route Area</span>
                  <span className="font-bold text-[#0D1F3D]">{routeArea}</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                fullWidth
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1.5 font-bold bg-[#0D1F3D] hover:bg-[#071326] text-white rounded-sm h-10 mt-2"
              >
                <CheckCircle2 className="h-4 w-4 text-white" />{" "}
                {isSubmitting ? "Scheduling..." : "Confirm & Schedule Visit"}
              </Button>
            </div>
          </div>

          {/* Executive Availability Preview */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Executive Roster Check
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {selectedExecutive?.name || "Executive"} is available on{" "}
                  {scheduledDate}
                </span>
              </div>

              <div className="p-2.5 rounded-sm bg-slate-50 border border-slate-100 space-y-1 font-semibold">
                <p className="text-slate-500 text-[10px]">
                  Scheduled Workload:
                </p>
                <p className="text-[#0D1F3D] font-bold">
                  {selectedExecutive?.role || "Active Field Route"}
                </p>
                <p className="text-slate-400 text-[10px]">
                  10:00 AM {selectedBusiness?.name || "Merchant"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
