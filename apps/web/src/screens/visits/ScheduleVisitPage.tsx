import React, { useEffect, useMemo, useState } from "react";
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
import { useCrm, useCrmQuery, useCrmMutation } from "../../features/crm/CrmContext";
import { visitApi, ScheduleVisitInput } from "./visit.api";

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
}

export default function ScheduleVisitPage() {
  const navigate = useNavigate();
  const mutation = useCrmMutation();
  const { can } = useCrm();

  // Dynamic CRM queries for real backend data
  const accountsQuery = useCrmQuery("schedule-page-accounts", (s, signal) =>
    can("crm.businesses.view")
      ? s.accounts({ limit: 100 }, signal)
      : Promise.resolve({ items: [], total: 0, page: 1, limit: 100, totalPages: 0 })
  );

  const leadsQuery = useCrmQuery("schedule-page-leads", (s, signal) =>
    can("crm.leads.view")
      ? s.leads.list({ limit: 100 }, signal)
      : Promise.resolve({ items: [], total: 0, page: 1, limit: 100, totalPages: 0 })
  );

  // Target type: 'existing' | 'lead' | 'custom'
  const [targetType, setTargetType] = useState<"existing" | "lead" | "custom">(
    () => can("crm.businesses.view") ? "existing" : can("crm.leads.view") ? "lead" : "custom",
  );

  // Process dynamic businesses / accounts
  const realAccounts = accountsQuery.data?.items ?? [];
  const realLeads = leadsQuery.data?.items ?? [];

  const businessOptionsList = useMemo<BusinessOption[]>(
    () => realAccounts.map((a) => ({
          id: a.id,
          name: a.name,
          businessType: a.businessType || a.categoryLabel || "Business",
          city: a.city || "",
          fullAddress:
            [a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode]
              .filter(Boolean)
              .join(", "),
          contactPerson: a.primaryContact?.name || "",
          phone: a.primaryContact?.phone || "",
          email: a.primaryContact?.email || "",
          logoText: a.name ? a.name.slice(0, 2).toUpperCase() : "BU",
        })), [realAccounts]);

  const leadOptionsList = useMemo<BusinessOption[]>(() => realLeads.map((l) => ({
    id: l.id,
    name: l.businessName || l.name,
    businessType: "Prospect Lead",
    city: l.city || "",
    fullAddress: [l.addressLine1, l.addressLine2, l.city, l.state, l.postalCode]
      .filter(Boolean)
      .join(", "),
    contactPerson: l.contactName || "",
    phone: l.phone || "",
    email: l.email || "",
    logoText: (l.businessName || l.contactName || "LD").slice(0, 2).toUpperCase(),
  })), [realLeads]);

  const activeOptionsList =
    targetType === "lead"
      ? leadOptionsList
      : targetType === "existing"
        ? businessOptionsList
        : [];
  const targetOptionsLoading = targetType === "lead" ? leadsQuery.loading : accountsQuery.loading;
  const targetOptionsError = targetType === "lead" ? leadsQuery.error : accountsQuery.error;

  // Selected Business State
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [customTargetName, setCustomTargetName] = useState("");

  const selectedLinkedBusiness = activeOptionsList.find(
    (business) => business.id === selectedBusinessId,
  );

  const [contactName, setContactName] = useState(
    ""
  );
  const [contactPhone, setContactPhone] = useState(
    ""
  );
  const [contactEmail, setContactEmail] = useState(
    ""
  );
  const [address, setAddress] = useState(
    ""
  );

  const selectedBusiness: BusinessOption | undefined =
    targetType === "custom"
      ? {
          id: "",
          name: customTargetName,
          businessType: "Quick Address",
          city: "",
          fullAddress: address,
          contactPerson: contactName,
          phone: contactPhone,
          email: contactEmail,
          logoText: customTargetName.slice(0, 2).toUpperCase() || "QA",
        }
      : selectedLinkedBusiness;

  // Prefilled Coordinates & Geofence Radius State
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusMeters, setRadiusMeters] = useState<number>(100);

  // Sync state whenever selected business changes or mode switches
  const handleBusinessChange = (busId: string) => {
    setSelectedBusinessId(busId);
    const bus = activeOptionsList.find((b) => b.id === busId);
    if (bus) {
      setContactName(bus.contactPerson);
      setContactPhone(bus.phone);
      setContactEmail(bus.email);
      setAddress(bus.fullAddress);
      setCoords(null);
    }
  };

  // Initialize coords and prefill address on mount or targetType / business changes
  useEffect(() => {
    if (selectedBusiness) {
      setAddress(selectedBusiness.fullAddress);
      setContactName(selectedBusiness.contactPerson);
      setContactPhone(selectedBusiness.phone);
      setContactEmail(selectedBusiness.email);
      setCoords(null);
    }
  }, [selectedBusinessId, targetType, selectedLinkedBusiness]);

  useEffect(() => {
    if (targetType === "custom") {
      setSelectedBusinessId("");
      return;
    }
    if (!activeOptionsList.some((option) => option.id === selectedBusinessId)) {
      setSelectedBusinessId(activeOptionsList[0]?.id ?? "");
    }
  }, [activeOptionsList, selectedBusinessId, targetType]);

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
  const executivesQuery = useCrmQuery(
    `schedule-page-executives:${scheduledDate}`,
    (_service, signal) => visitApi.executiveOptions(scheduledDate, signal),
  );
  const executiveOptionsList = executivesQuery.data?.items ?? [];
  const [assignedExecutiveId, setAssignedExecutiveId] = useState("");
  useEffect(() => {
    if (!executiveOptionsList.some((executive) => executive.id === assignedExecutiveId)) {
      setAssignedExecutiveId(executiveOptionsList[0]?.id ?? "");
    }
  }, [assignedExecutiveId, executiveOptionsList]);
  const selectedExecutive = executiveOptionsList.find(
    (executive) => executive.id === assignedExecutiveId,
  );
  const availabilityQuery = useCrmQuery(
    `visit-availability:${assignedExecutiveId}:${scheduledDate}:${startTime}:${endTime}`,
    (_service, signal) =>
      assignedExecutiveId
        ? visitApi.availability(
            {
              executiveMembershipId: assignedExecutiveId,
              scheduledDate,
              startTime,
              endTime,
            },
            signal,
          )
        : Promise.resolve(null),
  );
  const routeOptions = useMemo(
    () => selectedExecutive?.territories ?? [],
    [selectedExecutive],
  );
  const [routeArea, setRouteArea] = useState("");
  useEffect(() => {
    if (!routeOptions.includes(routeArea)) {
      setRouteArea(routeOptions[0] ?? "");
    }
  }, [routeArea, routeOptions]);
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
  const isSubmitting = mutation.pending;

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
    if (!selectedBusiness?.name.trim()) {
      toast.error(targetType === "custom" ? "Enter a target name." : "Select a target.");
      return;
    }
    if (!address.trim()) {
      toast.error("Enter the visit address.");
      return;
    }
    if (!selectedExecutive) {
      toast.error("Select a field executive.");
      return;
    }
    if (availabilityQuery.data && !availabilityQuery.data.available) {
      toast.error("The selected executive already has a visit during this time.");
      return;
    }

    const targetTypeByMode: Record<typeof targetType, ScheduleVisitInput["targetType"]> = {
      existing: "ACCOUNT",
      lead: "LEAD",
      custom: "QUICK_ADDRESS",
    };
    const body: ScheduleVisitInput = {
      targetType: targetTypeByMode[targetType],
      ...(targetType !== "custom" ? { targetId: selectedBusiness.id } : {}),
      targetName: selectedBusiness.name,
      ...(contactName.trim() ? { contactName: contactName.trim() } : {}),
      ...(contactPhone.trim() ? { contactPhone: contactPhone.trim() } : {}),
      ...(contactEmail.trim() ? { contactEmail: contactEmail.trim() } : {}),
      location: address.trim(),
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      geofenceRadiusMeters: radiusMeters,
      visitType: visitType as ScheduleVisitInput["visitType"],
      purpose: purpose.trim(),
      scheduledDate,
      startTime,
      endTime,
      priority: priority as ScheduleVisitInput["priority"],
      recurrence: recurring as ScheduleVisitInput["recurrence"],
      executiveMembershipId: selectedExecutive.id,
      ...(routeArea.trim() ? { routeArea: routeArea.trim() } : {}),
      travelMode: travelMode as ScheduleVisitInput["travelMode"],
      allowManualCheckIn,
      ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
      checklist,
    };
    const created = await mutation.run((_service, signal) =>
      visitApi.create(body, signal),
    );
    if (!created) return;
    toast.success(`Visit successfully scheduled for ${created.targetName}!`);
    navigate("/admin/visits/scheduled");
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

      {mutation.error ? (
        <div role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {mutation.error.message}
        </div>
      ) : null}

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
                    setSelectedBusinessId(businessOptionsList[0]?.id ?? "");
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
                    setSelectedBusinessId(leadOptionsList[0]?.id ?? "");
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
                  onChange={() => {
                    setTargetType("custom");
                    setSelectedBusinessId("");
                    setContactName("");
                    setContactPhone("");
                    setContactEmail("");
                    setAddress("");
                    setCoords(null);
                  }}
                  className="accent-[#0D1F3D]"
                />
                <span>Quick Address</span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {targetType === "custom" ? "Target Name *" : targetType === "lead" ? "Select Lead / Prospect *" : "Select Business Account *"}
                </label>
                {targetType === "custom" ? (
                  <input
                    type="text"
                    value={customTargetName}
                    onChange={(event) => setCustomTargetName(event.target.value)}
                    placeholder="Enter merchant or location name"
                    className="w-full rounded-sm border border-slate-200 bg-white p-2.5 font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
                  />
                ) : (
                  <Select
                    searchable={true}
                    value={selectedBusinessId}
                    onChange={(event) => handleBusinessChange(event.target.value)}
                    placeholder={targetOptionsLoading ? "Loading options..." : "Select option"}
                    options={activeOptionsList.map((business) => ({
                      label: `${business.name}${business.city ? ` (${business.city} • ${business.businessType})` : ` (${business.businessType})`}`,
                      value: business.id,
                    }))}
                  />
                )}
                {targetType !== "custom" && targetOptionsError ? (
                  <p role="alert" className="mt-1 text-[10px] font-semibold text-red-600">
                    {targetType === "lead" ? "Assigned leads" : "Business accounts"} could not be loaded.
                  </p>
                ) : targetType !== "custom" && !targetOptionsLoading && activeOptionsList.length === 0 ? (
                  <p className="mt-1 text-[10px] font-semibold text-slate-500">
                    No {targetType === "lead" ? "assigned leads" : "business accounts"} are available.
                  </p>
                ) : null}
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
                  lat={coords?.lat}
                  lng={coords?.lng}
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
                  placeholder={executivesQuery.loading ? "Loading executives..." : "Select field executive"}
                  options={executiveOptionsList.map((exec) => ({
                    label: `${exec.name} (${exec.scheduledVisitCount} scheduled)`,
                    value: exec.id,
                    avatar: exec.avatarUrl ?? undefined,
                    sublabel: exec.team ? `${exec.role} • ${exec.team}` : exec.role,
                  }))}
                />
                {executivesQuery.error ? (
                  <p role="alert" className="mt-1 text-[10px] font-semibold text-red-600">
                    Field executives could not be loaded.
                  </p>
                ) : !executivesQuery.loading && executiveOptionsList.length === 0 ? (
                  <p className="mt-1 text-[10px] font-semibold text-slate-500">
                    No active field executives are available.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Route / Area *
                </label>
                <Select
                  searchable={true}
                  value={routeArea}
                  onChange={(e) => setRouteArea(e.target.value)}
                  placeholder={selectedExecutive ? "No assigned territory" : "Select an executive first"}
                  options={routeOptions.map((territory) => ({
                    label: territory,
                    value: territory,
                  }))}
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
                    {coords
                      ? `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`
                      : "Pin not set"}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Route Area</span>
                  <span className="font-bold text-[#0D1F3D]">{routeArea || "Not assigned"}</span>
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
              <div
                className={`flex items-center gap-2 p-2 rounded-sm border font-bold ${
                  availabilityQuery.error || availabilityQuery.data?.available === false
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}
              >
                {availabilityQuery.error || availabilityQuery.data?.available === false ? (
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                <span>
                  {availabilityQuery.error
                    ? "Availability could not be checked"
                    : availabilityQuery.loading
                      ? "Checking executive availability..."
                      : availabilityQuery.data?.available === false
                        ? `${selectedExecutive?.name || "Executive"} has a conflicting visit`
                        : `${selectedExecutive?.name || "Executive"} is available on ${scheduledDate}`}
                </span>
              </div>

              <div className="p-2.5 rounded-sm bg-slate-50 border border-slate-100 space-y-1 font-semibold">
                <p className="text-slate-500 text-[10px]">
                  Scheduled Workload:
                </p>
                <p className="text-[#0D1F3D] font-bold">
                  {availabilityQuery.data
                    ? `${availabilityQuery.data.scheduledVisitCount} visit${availabilityQuery.data.scheduledVisitCount === 1 ? "" : "s"} on ${scheduledDate}`
                    : selectedExecutive?.role || "Active Field Route"}
                </p>
                <p className="text-slate-400 text-[10px]">
                  {availabilityQuery.data?.conflictingVisitCount
                    ? `${availabilityQuery.data.conflictingVisitCount} visit conflict${availabilityQuery.data.conflictingVisitCount === 1 ? "" : "s"} between ${startTime} and ${endTime}`
                    : `${startTime} - ${endTime} ${selectedBusiness?.name || "Merchant"}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
