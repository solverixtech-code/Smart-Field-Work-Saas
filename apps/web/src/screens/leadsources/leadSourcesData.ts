export interface LeadSourceItem {
  id: string;
  name: string;
  code: string;
  sourceType: string;
  channel: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  revenue: number;
  cost: number;
  status: 'Active' | 'Inactive';
  createdOn: string;
  iconName: string;
  description?: string;
  priority?: 'High' | 'Medium' | 'Low';
  attributionModel?: string;
  costType?: 'Non Paid' | 'Paid (CPC/CPM)' | 'Other';
  defaultOwner?: string;
  utmSource?: string;
}

export interface LeadIntegrationItem {
  id: string;
  name: string;
  platform: 'Meta' | 'Google' | 'WhatsApp' | 'Website' | 'Webhook';
  connectedAccount: string;
  accountDetail: string;
  lastSync: string;
  syncFrequency: string;
  leadsLast30Days: number;
  leadsGrowthPct: number;
  newLeads: number;
  assignedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  status: 'Connected' | 'Disconnected' | 'Syncing';
  webhookStatus: 'Healthy' | 'Warning' | 'Error';
  errorRate: string;
  topCampaign: string;
  topForm: string;
}

export interface LiveLeadActivityItem {
  id: string;
  leadName: string;
  phone: string;
  sourceName: string;
  platform: 'Meta' | 'Google' | 'WhatsApp' | 'Website' | 'Referral';
  campaignOrForm: string;
  timeCaptured: string;
  status: 'New' | 'Assigned' | 'Duplicate' | 'Failed';
  assignedToName?: string;
  assignedToTeam?: string;
  slaTime: string;
  slaBreached?: boolean;
}

export const mockLeadSourcesList: LeadSourceItem[] = [
  {
    id: 'src-101',
    name: 'Website (aimbeat.com)',
    code: 'WEB',
    sourceType: 'Website',
    channel: 'Internet',
    totalLeads: 2542,
    convertedLeads: 542,
    conversionRate: 21.3,
    revenue: 985000,
    cost: 215000,
    status: 'Active',
    createdOn: '20 May 2025',
    iconName: 'Globe',
    description: 'Inbound organic and paid lead forms on aimbeat.com',
    priority: 'High',
    attributionModel: 'First Touch',
    costType: 'Non Paid',
    defaultOwner: 'Rohit Sharma',
    utmSource: 'website',
  },
  {
    id: 'src-102',
    name: 'WhatsApp Campaign (Summer Offer)',
    code: 'WA_SUMMER',
    sourceType: 'WhatsApp',
    channel: 'WhatsApp Business API',
    totalLeads: 2156,
    convertedLeads: 458,
    conversionRate: 21.2,
    revenue: 876000,
    cost: 120000,
    status: 'Active',
    createdOn: '18 May 2025',
    iconName: 'MessageSquare',
    description: 'Click-to-WhatsApp promotional ads & inbound chats',
    priority: 'High',
    attributionModel: 'Last Touch',
    costType: 'Paid (CPC/CPM)',
    defaultOwner: 'Priya Sharma',
    utmSource: 'whatsapp_ad',
  },
  {
    id: 'src-103',
    name: 'Facebook Ads (Lead Gen)',
    code: 'FB_LEADGEN',
    sourceType: 'Facebook',
    channel: 'Meta Lead Ads',
    totalLeads: 1845,
    convertedLeads: 312,
    conversionRate: 16.9,
    revenue: 596000,
    cost: 185000,
    status: 'Active',
    createdOn: '15 May 2025',
    iconName: 'Facebook',
    description: 'Instant lead forms running on Facebook Feed & Stories',
    priority: 'High',
    attributionModel: 'First Touch',
    costType: 'Paid (CPC/CPM)',
    defaultOwner: 'Mumbai Sales Team',
    utmSource: 'fb_ads',
  },
  {
    id: 'src-104',
    name: 'Google Ads (Search Campaign)',
    code: 'GOOG_SEARCH',
    sourceType: 'Google Ads',
    channel: 'Google Search & Extensions',
    totalLeads: 1684,
    convertedLeads: 362,
    conversionRate: 21.5,
    revenue: 625000,
    cost: 210000,
    status: 'Active',
    createdOn: '12 May 2025',
    iconName: 'Search',
    description: 'Google Search intent lead form submissions',
    priority: 'High',
    attributionModel: 'Linear',
    costType: 'Paid (CPC/CPM)',
    defaultOwner: 'Rohit Sharma',
    utmSource: 'google_search',
  },
  {
    id: 'src-105',
    name: 'Instagram Ads (Awareness)',
    code: 'IG_ADS',
    sourceType: 'Instagram',
    channel: 'Meta Lead Ads',
    totalLeads: 1256,
    convertedLeads: 206,
    conversionRate: 16.4,
    revenue: 385000,
    cost: 140000,
    status: 'Active',
    createdOn: '10 May 2025',
    iconName: 'Instagram',
    description: 'Reels and Story lead ad forms on Instagram',
    priority: 'Medium',
    attributionModel: 'First Touch',
    costType: 'Paid (CPC/CPM)',
    defaultOwner: 'Priya Sharma',
    utmSource: 'ig_reels',
  },
  {
    id: 'src-106',
    name: 'Client Referral',
    code: 'REFERRAL',
    sourceType: 'Referral',
    channel: 'Word of Mouth / Client',
    totalLeads: 1024,
    convertedLeads: 256,
    conversionRate: 25.0,
    revenue: 468000,
    cost: 0,
    status: 'Active',
    createdOn: '08 May 2025',
    iconName: 'Users',
    description: 'Existing business client recommendations',
    priority: 'High',
    attributionModel: 'Last Touch',
    costType: 'Non Paid',
    defaultOwner: 'Vijay Patel',
    utmSource: 'client_referral',
  },
  {
    id: 'src-107',
    name: 'Email Campaign (May Newsletter)',
    code: 'EMAIL_MAY',
    sourceType: 'Email',
    channel: 'HubSpot / Mailchimp',
    totalLeads: 842,
    convertedLeads: 132,
    conversionRate: 15.7,
    revenue: 235000,
    cost: 45000,
    status: 'Active',
    createdOn: '05 May 2025',
    iconName: 'Mail',
    description: 'Outbound newsletter CTAs and product updates',
    priority: 'Medium',
    attributionModel: 'Linear',
    costType: 'Other',
    defaultOwner: 'Priya Sharma',
    utmSource: 'email_newsletter',
  },
  {
    id: 'src-108',
    name: 'Telecalling Inbound',
    code: 'TELECALLING',
    sourceType: 'Telecalling',
    channel: 'IVR / Phone',
    totalLeads: 756,
    convertedLeads: 98,
    conversionRate: 13.0,
    revenue: 168000,
    cost: 60000,
    status: 'Active',
    createdOn: '02 May 2025',
    iconName: 'PhoneCall',
    description: 'Inbound phone calls from toll-free number',
    priority: 'Medium',
    attributionModel: 'First Touch',
    costType: 'Other',
    defaultOwner: 'Rahul Verma',
    utmSource: 'tollfree_call',
  },
  {
    id: 'src-109',
    name: 'Events & Exhibitions',
    code: 'EXPO_2025',
    sourceType: 'Offline',
    channel: 'Field Booth / Event',
    totalLeads: 468,
    convertedLeads: 86,
    conversionRate: 18.4,
    revenue: 145000,
    cost: 95000,
    status: 'Inactive',
    createdOn: '28 Apr 2025',
    iconName: 'Calendar',
    description: 'Retail & Franchise Expo 2025 scan leads',
    priority: 'Low',
    attributionModel: 'First Touch',
    costType: 'Paid (CPC/CPM)',
    defaultOwner: 'Amit Verma',
    utmSource: 'expo_scan',
  },
  {
    id: 'src-110',
    name: 'Other Sources',
    code: 'OTHER',
    sourceType: 'Other',
    channel: 'Direct / Misc',
    totalLeads: 885,
    convertedLeads: 106,
    conversionRate: 12.0,
    revenue: 155000,
    cost: 30000,
    status: 'Active',
    createdOn: '25 Apr 2025',
    iconName: 'MoreHorizontal',
    description: 'Uncategorized or miscellaneous lead channels',
    priority: 'Low',
    attributionModel: 'First Touch',
    costType: 'Other',
    defaultOwner: 'Team Queue',
    utmSource: 'direct_other',
  },
];

export const mockIntegrationPlatforms: LeadIntegrationItem[] = [
  {
    id: 'integ-meta',
    name: 'Meta Lead Ads',
    platform: 'Meta',
    connectedAccount: 'Aimbeat Business',
    accountDetail: 'FB Page: Aimbeat | IG: @aimbeat_official',
    lastSync: '1 min ago',
    syncFrequency: 'Real-time Webhook',
    leadsLast30Days: 5842,
    leadsGrowthPct: 18.6,
    newLeads: 4856,
    assignedLeads: 4412,
    convertedLeads: 1156,
    conversionRate: 19.9,
    status: 'Connected',
    webhookStatus: 'Healthy',
    errorRate: '0%',
    topCampaign: 'Summer Offer 2025',
    topForm: 'Lead Form 01',
  },
  {
    id: 'integ-google',
    name: 'Google Ads',
    platform: 'Google',
    connectedAccount: 'aimbeatads@gmail.com',
    accountDetail: 'Customer ID: 123-456-7890',
    lastSync: '2 min ago',
    syncFrequency: 'Every 5 minutes',
    leadsLast30Days: 4126,
    leadsGrowthPct: 16.2,
    newLeads: 3354,
    assignedLeads: 3078,
    convertedLeads: 786,
    conversionRate: 19.1,
    status: 'Connected',
    webhookStatus: 'Healthy',
    errorRate: '0.2%',
    topCampaign: 'Search - CRM Solution',
    topForm: 'Website Leads Form',
  },
  {
    id: 'integ-whatsapp',
    name: 'WhatsApp API',
    platform: 'WhatsApp',
    connectedAccount: '+91 90876 54321',
    accountDetail: 'WABA ID: 123456789012345',
    lastSync: 'Just now',
    syncFrequency: 'Real-time Webhook',
    leadsLast30Days: 2490,
    leadsGrowthPct: 20.4,
    newLeads: 2184,
    assignedLeads: 1946,
    convertedLeads: 498,
    conversionRate: 20.0,
    status: 'Connected',
    webhookStatus: 'Healthy',
    errorRate: '0%',
    topCampaign: 'Click-to-WhatsApp Ads',
    topForm: 'Auto Chatbot Lead Capture',
  },
];

export const mockLiveActivitiesList: LiveLeadActivityItem[] = [
  {
    id: 'act-1',
    leadName: 'Rahul Verma',
    phone: '98765 43210',
    sourceName: 'Meta Lead Ads',
    platform: 'Meta',
    campaignOrForm: 'Website Enquiry Form (Ad Set 12)',
    timeCaptured: '10:24 AM',
    status: 'New',
    assignedToName: 'Amit Verma',
    assignedToTeam: 'Mumbai Team',
    slaTime: '28m 12s',
    slaBreached: false,
  },
  {
    id: 'act-2',
    leadName: 'Neha Patel',
    phone: '96548 76543',
    sourceName: 'Google Ads Lead Form',
    platform: 'Google',
    campaignOrForm: 'Get Offer Form (Campaign #45)',
    timeCaptured: '10:18 AM',
    status: 'Assigned',
    assignedToName: 'Neha Patel',
    assignedToTeam: 'Andheri Team',
    slaTime: '12m 45s',
    slaBreached: false,
  },
  {
    id: 'act-3',
    leadName: 'Aman Singh',
    phone: '99876 54433',
    sourceName: 'WhatsApp API',
    platform: 'WhatsApp',
    campaignOrForm: 'Enquiry via WhatsApp Organic',
    timeCaptured: '10:15 AM',
    status: 'Assigned',
    assignedToName: 'Ravi Singh',
    assignedToTeam: 'Mumbai Team',
    slaTime: '8m 05s',
    slaBreached: false,
  },
  {
    id: 'act-4',
    leadName: 'Rahul Verma',
    phone: '98765 43210',
    sourceName: 'Meta Lead Ads',
    platform: 'Meta',
    campaignOrForm: 'Website Enquiry Form (Ad Set 12)',
    timeCaptured: '10:10 AM',
    status: 'Duplicate',
    assignedToName: 'Merged (Existing Lead)',
    assignedToTeam: 'System De-duplication',
    slaTime: '—',
    slaBreached: false,
  },
  {
    id: 'act-5',
    leadName: 'Sagar Pawar',
    phone: '93211 22334',
    sourceName: 'Google Ads Lead Form',
    platform: 'Google',
    campaignOrForm: 'Book Demo Form (Campaign #48)',
    timeCaptured: '10:05 AM',
    status: 'Failed',
    assignedToName: '—',
    assignedToTeam: 'Validation Error (Invalid Phone)',
    slaTime: '—',
    slaBreached: true,
  },
  {
    id: 'act-6',
    leadName: 'Pooja Joshi',
    phone: '93211 22334',
    sourceName: 'Website Widget',
    platform: 'Website',
    campaignOrForm: 'SFW Widget Form /contact-us',
    timeCaptured: '09:58 AM',
    status: 'New',
    assignedToName: 'Unassigned',
    assignedToTeam: 'Team Queue',
    slaTime: '29m 55s',
    slaBreached: false,
  },
  {
    id: 'act-7',
    leadName: 'Mohit Kumar',
    phone: '91234 56789',
    sourceName: 'WhatsApp API',
    platform: 'WhatsApp',
    campaignOrForm: 'Enquiry via WhatsApp Paid Campaign',
    timeCaptured: '09:52 AM',
    status: 'Assigned',
    assignedToName: 'Karan Joshi',
    assignedToTeam: 'Andheri Team',
    slaTime: '15m 20s',
    slaBreached: false,
  },
];
