export interface DemoItem {
  id: string;
  leadId?: string;
  assignedToMembershipId?: string;
  demoId: string; // e.g. DEM-1287
  badge?: string; // 'New' | 'Hot'
  businessName: string;
  businessAddress: string;
  contactPerson: string;
  contactRole: string;
  phone: string;
  email: string;
  demoType: 'Product Demo' | 'Live Demo' | 'Online Demo' | 'POC / Pilot';
   productService: string;
  assignedToName: string;
  assignedToAvatar: string;
  assignedToRole: string;
  assignedToPhone?: string;
  assignedToEmail?: string;
  assignedToEmployeeCode?: string;
  demoDate: string; // YYYY-MM-DD or formatted date
  demoTime: string; // 11:00 AM
  demoMode?: string;
  status: 'Completed' | 'Scheduled' | 'Confirmed' | 'In Progress' | 'Rescheduled' | 'No Show' | 'Cancelled';
  outcome?: 'Interested' | 'Follow-up' | 'Proposal' | 'Trial' | 'Converted' | 'Demo Done' | 'Not Interested' | 'Quotation Sent' | 'Rescheduled' | 'No Show' | 'Pending';
  demoDateIso?: string;
  createdAt?: string;
  updatedAt?: string;
  activities?: Array<{ id: string; title: string; description: string; createdAt: string }>;
  nextAction?: string; // 'Follow-up' | 'Quotation' | 'Send Proposal' | 'Call Before Demo'
  nextActionDate?: string;
  durationMinutes?: number;
  durationFormatted?: string; // e.g. 52m 05s
  revenueValue?: number;
  revenueFormatted?: string; // e.g. ₹ 18,45,000
  conversionPotential?: 'High' | 'Medium' | 'Low';
  probabilityPercentage?: number; // e.g. 80%
  leadSource?: string; // 'Referral' | 'Website' | 'Google Ads' | 'Call' | 'Walk-in'
  leadStage?: 'Interested' | 'Evaluation' | 'Negotiation' | 'Closed Won';
  leadScore?: number; // 4.5/5
  attendeesCount?: number;
  notesSummary?: string;
  lat?: number;
  lng?: number;
}

export interface DemoActivityTimeline {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'status_change' | 'note' | 'attachment' | 'meeting' | 'creation';
  userAvatar?: string;
  userName?: string;
}

export interface DemoNote {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
}

export interface DemoAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}
