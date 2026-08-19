import React, { useState } from "react";
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
import { mockBusinesses } from "../businesses/businessesData";

export default function ScheduleVisitPage() {
  const navigate = useNavigate();

  // Target type: 'existing' | 'lead' | 'custom'
  const [targetType, setTargetType] = useState<"existing" | "lead" | "custom">(
    "existing",
  );

  // Form fields
  const [selectedBusinessId, setSelectedBusinessId] = useState(
    mockBusinesses[0].id,
  );
  const selectedBusiness =
    mockBusinesses.find((b) => b.id === selectedBusinessId) ||
    mockBusinesses[0];

  const [contactName, setContactName] = useState(
    selectedBusiness.contactPerson,
  );
  const [contactPhone, setContactPhone] = useState(selectedBusiness.phone);
  const [contactEmail, setContactEmail] = useState(selectedBusiness.email);
  const [address, setAddress] = useState(selectedBusiness.fullAddress);

  // Visit details
  const [visitType, setVisitType] = useState("Sales Visit");
  const [purpose, setPurpose] = useState("Product Demo & Corporate Discussion");
  const [scheduledDate, setScheduledDate] = useState("2025-05-25");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("11:00 AM");
  const [priority, setPriority] = useState("High");
  const [recurring, setRecurring] = useState("None");

  // Executive & Route
  const [assignedExecutive, setAssignedExecutive] = useState("Amit Verma");
  const [routeArea, setRouteArea] = useState("Andheri East Route");
  const [travelMode, setTravelMode] = useState("Bike");
  const [allowManualCheckIn, setAllowManualCheckIn] = useState(false);

  // Checklist & Notes
  const [instructions, setInstructions] = useState(
    "Discuss corporate tie-ups and present annual membership package with special group discounts.",
  );
  const [checklist, setChecklist] = useState<string[]>([
    "Carry Product Demo Brochure",
    "Verify Business Registration Document",
    "Demonstrate POS Software on tablet",
  ]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  // When business changes, sync contact details & address
  const handleBusinessChange = (busId: string) => {
    setSelectedBusinessId(busId);
    const bus = mockBusinesses.find((b) => b.id === busId);
    if (bus) {
      setContactName(bus.contactPerson);
      setContactPhone(bus.phone);
      setContactEmail(bus.email);
      setAddress(bus.fullAddress);
    }
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist((prev) => [...prev, newChecklistItem.trim()]);
      setNewChecklistItem("");
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklist((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Visit successfully scheduled for ${selectedBusiness.name}!`);
    navigate("/admin/visits");
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
            variant="accent"
            size="sm"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Schedule Visit
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
                  onChange={() => setTargetType("existing")}
                  className="accent-[#0D1F3D]"
                />
                <span>Existing Business</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === "lead"}
                  onChange={() => setTargetType("lead")}
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
                  value={selectedBusinessId}
                  onChange={(e) => handleBusinessChange(e.target.value)}
                  options={mockBusinesses.map((b) => ({
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-sm border border-slate-200 bg-white p-2.5 font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
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

              {/* Embedded Interactive Google Map Preview */}
              <div className="relative h-44 w-full rounded-sm border border-slate-200 bg-slate-100 overflow-hidden shadow-xs">
                <iframe
                  title="Merchant Location Preview"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
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
                  value={assignedExecutive}
                  onChange={(e) => setAssignedExecutive(e.target.value)}
                  options={[
                    {
                      label: "Amit Verma (North Mumbai • 4 Visits)",
                      value: "Amit Verma",
                    },
                    {
                      label: "Neha Gupta (West Mumbai • 2 Visits)",
                      value: "Neha Gupta",
                    },
                    {
                      label: "Vikram Patil (Thane Zone • 3 Visits)",
                      value: "Vikram Patil",
                    },
                    {
                      label: "Pooja Yadav (Navi Mumbai • 1 Visit)",
                      value: "Pooja Yadav",
                    },
                    {
                      label: "Ankush Yadav (Central Mumbai • 5 Visits)",
                      value: "Ankush Yadav",
                    },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Route / Area *
                </label>
                <Select
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
                  If checked, executive can submit check-in outside 100m radius
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
                      className="p-1 text-slate-400 hover:text-red-600"
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
                  {selectedBusiness.logoText || "FZ"}
                </div>
                <div>
                  <p className="font-extrabold text-[#0D1F3D] text-sm">
                    {selectedBusiness.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {selectedBusiness.city} • {selectedBusiness.businessType}
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
                    {assignedExecutive}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Route Area</span>
                  <span className="font-bold text-[#0D1F3D]">{routeArea}</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="sm"
                fullWidth
                className="flex items-center justify-center gap-1.5 font-bold bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm h-10 mt-2"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Confirm &
                Schedule Visit
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
                  {assignedExecutive} is available on {scheduledDate}
                </span>
              </div>

              <div className="p-2.5 rounded-sm bg-slate-50 border border-slate-100 space-y-1 font-semibold">
                <p className="text-slate-500 text-[10px]">
                  Today's Scheduled Workload:
                </p>
                <p className="text-[#0D1F3D] font-bold">
                  3 Visits Scheduled (North Mumbai Route)
                </p>
                <p className="text-slate-400 text-[10px]">
                  10:00 AM FitZone • 02:30 PM Om Electronics
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
