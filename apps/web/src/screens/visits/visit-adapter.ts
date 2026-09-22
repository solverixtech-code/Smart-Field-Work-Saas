import type { VisitItem } from "./visitsData";
import type { VisitRecord } from "./visit.api";

function visitType(purpose: string): VisitItem["visitType"] {
  const value = purpose.toLowerCase();
  if (value.includes("follow")) return "Follow-up";
  if (value.includes("collection") || value.includes("payment")) return "Collection";
  if (value.includes("requirement")) return "Requirement Discussion";
  if (value.includes("demo")) return "Product Demo";
  if (value.includes("onboard")) return "Onboarding";
  return "Sales Visit";
}

function status(value: string): VisitItem["status"] {
  if (value === "COMPLETED") return "Completed";
  if (value === "IN_PROGRESS") return "In Progress";
  if (value === "MISSED") return "Missed";
  if (value === "CANCELLED") return "Cancelled";
  return "Scheduled";
}

function outcome(value: string | null): VisitItem["outcome"] {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized.includes("positive") || normalized.includes("won")) return "Positive";
  if (normalized.includes("lost") || normalized.includes("negative")) return "Lost";
  if (value) return "Neutral";
  return "Pending";
}

function priority(value: string): VisitItem["priority"] {
  if (value === "HIGH" || value === "URGENT") return "High";
  if (value === "LOW") return "Low";
  return "Medium";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string | null): string | undefined {
  if (!value) return undefined;
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function toVisitItem(record: VisitRecord): VisitItem {
  const target = record.lead ?? record.account;
  const address = [
    target?.addressLine1,
    target?.addressLine2,
    target?.city,
    target?.state,
    target?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
  const executive = record.executiveMembership.user;
  const hasCoordinates = record.latitude !== null && record.longitude !== null;

  return {
    id: record.id,
    displayId: record.lead?.leadCode,
    businessId: record.accountId ?? record.leadId ?? record.id,
    businessPath: record.accountId
      ? `/admin/businesses/${record.accountId}`
      : record.leadId
        ? `/admin/leads/${record.leadId}`
        : undefined,
    businessName: record.targetName,
    businessType: record.targetType === "ACCOUNT" ? "Business visit" : record.targetType === "LEAD" ? "Lead visit" : "Quick-address visit",
    businessCategory: record.lead?.status ?? record.account?.status ?? "Scheduled",
    location: record.location || address || "Location not recorded",
    executiveId: record.executiveMembershipId,
    executiveName: executive.fullName || record.executiveName,
    executiveRole: record.executiveMembership.designation || "Field Executive",
    executiveAvatar: executive.avatarUrl || record.executiveAvatar || "",
    executivePhone: record.contactPhone || executive.mobile || "Not available",
    executiveEmail: executive.email,
    visitType: visitType(record.visitType || record.purpose),
    purpose: record.purpose,
    scheduledDateTime: formatDateTime(record.checkInTime),
    actualDateTime: record.checkOutTime
      ? `${formatDateTime(record.checkInTime)} - ${formatTime(record.checkOutTime)}`
      : undefined,
    duration: record.durationMinutes > 0 ? `${record.durationMinutes}m` : undefined,
    status: status(record.status),
    checkInTime: formatTime(record.checkInTime),
    checkOutTime: formatTime(record.checkOutTime),
    checkInPhoto: record.photos[0],
    checkOutPhoto: record.photos[1],
    isGpsVerified: hasCoordinates,
    gpsStatus: hasCoordinates ? "Verified (Within 100m)" : "No Signal Area",
    routeArea: record.routeArea || target?.city || record.location || "Area not recorded",
    travelMode: record.travelMode || "Not recorded",
    distanceTraveled: "Not recorded",
    outcome: outcome(record.outcome),
    nextStep: "",
    priority: priority(record.priority || record.lead?.priority || "MEDIUM"),
    remarks: record.instructions || record.outcome || "",
    notes: record.instructions || record.outcome || "",
    createdBy: executive.fullName || record.executiveName,
    createdOn: formatDateTime(record.createdAt),
    productsDiscussed: [],
    tasksCreated: [],
    documentsShared: [],
  };
}
