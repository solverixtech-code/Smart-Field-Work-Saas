export interface PipelineDealCard {
  id: string;
  businessName: string;
  category: string;
  city: string;
  amount: number;
  date: string;
  executiveName: string;
  executiveAvatar: string;
  stage: 'new' | 'contacted' | 'demo' | 'interested' | 'negotiation' | 'payment-pending' | 'won' | 'lost';
  stageLabel: string;
  priority: 'High' | 'Medium' | 'Low';
  phone: string;
  email: string;
  source: 'Nearby' | 'Referral' | 'Import' | 'Field Scouting' | 'Website' | 'Digital Ads';
}

export interface PipelineStageConfig {
  id: string;
  routeKey: string;
  title: string;
  subtitle: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  count: number;
}

export const pipelineStagesList: PipelineStageConfig[] = [
  { id: 'new', routeKey: 'prospects', title: 'New Deals', subtitle: 'Newly converted deals & opportunities', color: '#3B82F6', badgeBg: 'bg-[#0D1F3D]/10', badgeText: 'text-[#0D1F3D]', badgeBorder: 'border-[#0D1F3D]/20', count: 58 },
  { id: 'contacted', routeKey: 'contacted', title: 'Contacted', subtitle: 'First touch completed', color: '#F59E0B', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200', count: 67 },
  { id: 'demo', routeKey: 'demo', title: 'Demo Scheduled', subtitle: 'Product demo confirmed', color: '#8B5CF6', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200', count: 42 },
  { id: 'negotiation', routeKey: 'negotiation', title: 'Negotiation', subtitle: 'Commercial proposal under discussion', color: '#D97706', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', badgeBorder: 'border-amber-200', count: 39 },
  { id: 'won', routeKey: 'won', title: 'Won', subtitle: 'Closed won deals ready for onboarding', color: '#10B981', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200', count: 26 },
  { id: 'lost', routeKey: 'lost', title: 'Lost', subtitle: 'Unconverted opportunities', color: '#EF4444', badgeBg: 'bg-red-50', badgeText: 'text-red-600', badgeBorder: 'border-red-200', count: 14 },
];

export const mockPipelineDeals: PipelineDealCard[] = [
  // New Deals
  { id: 'dl-101', businessName: 'FreshMart Grocery', category: 'Grocery Store', city: 'Bhiwandi, Maharashtra', amount: 25000, date: '24 May 2025', executiveName: 'Amit Verma', executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', stage: 'new', stageLabel: 'New Deal', priority: 'High', phone: '+91 96540 88990', email: 'freshgreen@gmail.com', source: 'Nearby' },
  { id: 'dl-102', businessName: 'Sharma Medical Store', category: 'Pharmacy & Medical', city: 'Andheri East, Mumbai', amount: 18000, date: '24 May 2025', executiveName: 'Neha Sharma', executiveAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', stage: 'new', stageLabel: 'New Deal', priority: 'Medium', phone: '+91 98765 43210', email: 'info@sharmamedical.com', source: 'Referral' },
  { id: 'dl-103', businessName: 'Patel Electronics', category: 'Consumer Electronics', city: 'Jogeshwari, Mumbai', amount: 42000, date: '23 May 2025', executiveName: 'Vijay Patel', executiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', stage: 'new', stageLabel: 'New Deal', priority: 'High', phone: '+91 98200 11223', email: 'patel.electronics@gmail.com', source: 'Import' },
  { id: 'dl-104', businessName: 'City Care Pharmacy', category: 'Pharmacy', city: 'Goregaon East, Mumbai', amount: 31000, date: '22 May 2025', executiveName: 'Rahul Gupta', executiveAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', stage: 'new', stageLabel: 'New Deal', priority: 'Low', phone: '+91 91670 33445', email: 'citycarepharmacy@gmail.com', source: 'Nearby' },

  // Contacted
  { id: 'dl-201', businessName: 'Royal Bakers', category: 'Bakery & Confectionery', city: 'Chakala, Mumbai', amount: 32000, date: '24 May 2025', executiveName: 'Rahul Gupta', executiveAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', stage: 'contacted', stageLabel: 'Contacted', priority: 'High', phone: '+91 98210 66778', email: 'royalbakers@gmail.com', source: 'Field Scouting' },
  { id: 'dl-202', businessName: 'Metro Supermart', category: 'Supermarket Chain', city: 'Andheri West, Mumbai', amount: 50000, date: '24 May 2025', executiveName: 'Amit Jain', executiveAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', stage: 'contacted', stageLabel: 'Contacted', priority: 'Medium', phone: '+91 98330 44556', email: 'contact@metrosuper.com', source: 'Website' },
  { id: 'dl-203', businessName: 'City Pharmacy', category: 'Retail Medical Store', city: 'Juhu, Mumbai', amount: 28000, date: '23 May 2025', executiveName: 'Kiran Shah', executiveAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', stage: 'contacted', stageLabel: 'Contacted', priority: 'Low', phone: '+91 98190 22334', email: 'citypharmacy@gmail.com', source: 'Referral' },

  // Demo Scheduled
  { id: 'dl-301', businessName: 'Global Traders', category: 'Wholesale FMCG', city: 'Malad, Mumbai', amount: 75000, date: '25 May 2025', executiveName: 'Pooja Yadav', executiveAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80', stage: 'demo', stageLabel: 'Demo Scheduled', priority: 'High', phone: '+91 99200 55667', email: 'globaltraders@gmail.com', source: 'Website' },
  { id: 'dl-302', businessName: 'Sunrise Retail', category: 'Departmental Store', city: 'Thane, Mumbai', amount: 60000, date: '24 May 2025', executiveName: 'Rakesh Patel', executiveAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80', stage: 'demo', stageLabel: 'Demo Scheduled', priority: 'Medium', phone: '+91 98670 11223', email: 'sunriseretail@gmail.com', source: 'Digital Ads' },
  { id: 'dl-303', businessName: 'Nova Lifestyle', category: 'Apparel & Fashion', city: 'Vashi, Mumbai', amount: 120000, date: '23 May 2025', executiveName: 'Anjali Mehta', executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', stage: 'demo', stageLabel: 'Demo Scheduled', priority: 'High', phone: '+91 98760 99887', email: 'novalifestyle@gmail.com', source: 'Field Scouting' },

  // Negotiation
  { id: 'dl-401', businessName: 'Prime Wellness', category: 'Healthcare & Gym', city: 'Kandivali, Mumbai', amount: 90000, date: '25 May 2025', executiveName: 'Vikram Joshi', executiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', stage: 'negotiation', stageLabel: 'Negotiation', priority: 'High', phone: '+91 98201 33445', email: 'primewellness@gmail.com', source: 'Referral' },
  { id: 'dl-402', businessName: 'Trinity Foods', category: 'Restaurant Chain', city: 'Dadar, Mumbai', amount: 65000, date: '23 May 2025', executiveName: 'Sneha Iyer', executiveAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', stage: 'negotiation', stageLabel: 'Negotiation', priority: 'Medium', phone: '+91 98334 55667', email: 'trinityfoods@gmail.com', source: 'Website' },
  { id: 'dl-403', businessName: 'Elite Sports', category: 'Sports Fitness Hub', city: 'Borivali, Mumbai', amount: 55000, date: '22 May 2025', executiveName: 'Manish Gupta', executiveAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', stage: 'negotiation', stageLabel: 'Negotiation', priority: 'Low', phone: '+91 98112 66778', email: 'elitesports@gmail.com', source: 'Nearby' },

  // Won
  { id: 'dl-501', businessName: 'Wellness Hub', category: 'Health & Clinic', city: 'Powai, Mumbai', amount: 80000, date: '24 May 2025', executiveName: 'Pooja Yadav', executiveAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80', stage: 'won', stageLabel: 'Won', priority: 'High', phone: '+91 98770 11223', email: 'wellnesshub@gmail.com', source: 'Referral' },
  { id: 'dl-502', businessName: 'Green Mart', category: 'Organic Grocery Store', city: 'Mulund, Mumbai', amount: 70000, date: '23 May 2025', executiveName: 'Rakesh Patel', executiveAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80', stage: 'won', stageLabel: 'Won', priority: 'Medium', phone: '+91 98661 44556', email: 'greenmart@gmail.com', source: 'Nearby' },
  { id: 'dl-503', businessName: 'City Retail', category: 'Supermarket Outlets', city: 'Goregaon, Mumbai', amount: 95000, date: '22 May 2025', executiveName: 'Anjali Mehta', executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', stage: 'won', stageLabel: 'Won', priority: 'High', phone: '+91 98223 77889', email: 'cityretail@gmail.com', source: 'Field Scouting' },

  // Lost
  { id: 'dl-601', businessName: 'Quick Shop', category: 'Convenience Store', city: 'Vile Parle, Mumbai', amount: 40000, date: '24 May 2025', executiveName: 'Amit Verma', executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', stage: 'lost', stageLabel: 'Lost', priority: 'Low', phone: '+91 98331 22334', email: 'quickshop@gmail.com', source: 'Import' },
  { id: 'dl-602', businessName: 'Smart Bazaar', category: 'Hypermarket', city: 'Chembur, Mumbai', amount: 52000, date: '23 May 2025', executiveName: 'Neha Sharma', executiveAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', stage: 'lost', stageLabel: 'Lost', priority: 'Medium', phone: '+91 98199 44556', email: 'smartbazaar@gmail.com', source: 'Website' },
  { id: 'dl-603', businessName: 'Fashion Point', category: 'Apparel Boutique', city: 'Andheri East, Mumbai', amount: 48000, date: '22 May 2025', executiveName: 'Vijay Patel', executiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', stage: 'lost', stageLabel: 'Lost', priority: 'High', phone: '+91 98660 77889', email: 'fashionpoint@gmail.com', source: 'Digital Ads' },
];

export interface StageRouteMetadata {
  key: string;
  title: string;
  description: string;
  kpis: {
    label: string;
    value: string | number;
    subtext: string;
    icon: string;
    color: string;
  }[];
}

export const stageRouteMetadataMap: Record<string, StageRouteMetadata> = {
  prospects: {
    key: 'prospects',
    title: 'New Deals',
    description: 'Newly converted deals and qualified sales opportunities',
    kpis: [
      { label: 'Total New Deals', value: 156, subtext: '18% vs last 7 days', icon: 'Users', color: 'text-purple-600 bg-purple-50' },
      { label: 'Added Today', value: 28, subtext: '24% vs yesterday', icon: 'Building2', color: 'text-amber-600 bg-amber-50' },
      { label: 'From Nearby', value: 62, subtext: '39.7% of total', icon: 'MapPin', color: 'text-purple-600 bg-purple-50' },
      { label: 'From Import', value: 48, subtext: '30.8% of total', icon: 'Globe', color: 'text-blue-600 bg-blue-50' },
      { label: 'From Referrals', value: 18, subtext: '11.5% of total', icon: 'Phone', color: 'text-emerald-600 bg-emerald-50' },
    ],
  },
  contacted: {
    key: 'contacted',
    title: 'Contacted Deals',
    description: 'First touch telephonic and in-person discussions logged',
    kpis: [
      { label: 'Total Contacted', value: 78, subtext: '18% vs last week', icon: 'Phone', color: 'text-blue-600 bg-blue-50' },
      { label: 'Connected Today', value: 14, subtext: 'First touch completed', icon: 'CheckCircle2', color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Follow-ups Pending', value: 24, subtext: 'Action required', icon: 'Clock', color: 'text-amber-600 bg-amber-50' },
      { label: 'Response Rate', value: '76.4%', subtext: 'High engagement', icon: 'TrendingUp', color: 'text-purple-600 bg-purple-50' },
    ],
  },
  demo: {
    key: 'demo',
    title: 'Demo Completed',
    description: 'Product walkthroughs and live POC sessions conducted',
    kpis: [
      { label: 'Total Demos', value: 42, subtext: '22% vs last week', icon: 'Monitor', color: 'text-purple-600 bg-purple-50' },
      { label: 'Onsite Live POCs', value: 26, subtext: 'In-store setups', icon: 'Store', color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Feedback Rating', value: '4.8 ★', subtext: 'High satisfaction', icon: 'Star', color: 'text-amber-600 bg-amber-50' },
      { label: 'Demo Conversion', value: '64.2%', subtext: 'Moved to Interested', icon: 'Zap', color: 'text-blue-600 bg-blue-50' },
    ],
  },
  interested: {
    key: 'interested',
    title: 'Interested Prospects',
    description: 'Warm deals evaluating proposals and commercial terms',
    kpis: [
      { label: 'Interested Deals', value: 34, subtext: 'Commercial intent', icon: 'Flame', color: 'text-amber-600 bg-amber-50' },
      { label: 'Quotations Sent', value: 28, subtext: '₹1.84 Cr total value', icon: 'FileText', color: 'text-blue-600 bg-blue-50' },
      { label: 'Avg Deal Size', value: '₹65,000', subtext: 'Standard enterprise slab', icon: 'DollarSign', color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Target Closing', value: '7 Days', subtext: 'High velocity', icon: 'Calendar', color: 'text-purple-600 bg-purple-50' },
    ],
  },
  negotiation: {
    key: 'negotiation',
    title: 'Deals in Negotiation',
    description: 'Active commercial discussions, terms & discount approvals',
    kpis: [
      { label: 'Deals in Negotiation', value: 39, subtext: 'Under discussion', icon: 'Handshake', color: 'text-amber-600 bg-amber-50' },
      { label: 'Total Pipeline Value', value: '₹2.12 Cr', subtext: 'High value focus', icon: 'TrendingUp', color: 'text-purple-600 bg-purple-50' },
      { label: 'Discount Requests', value: 8, subtext: 'Pending approval', icon: 'Percent', color: 'text-red-600 bg-red-50' },
      { label: 'Closing Ratio', value: '82%', subtext: 'Expected win rate', icon: 'Award', color: 'text-emerald-600 bg-emerald-50' },
    ],
  },
  'payment-pending': {
    key: 'payment-pending',
    title: 'Payment Pending',
    description: 'Deals agreed with token advance or invoice payment pending',
    kpis: [
      { label: 'Pending Collections', value: 19, subtext: 'Invoice issued', icon: 'CreditCard', color: 'text-amber-600 bg-amber-50' },
      { label: 'Total Outstanding', value: '₹14.80 Lakhs', subtext: 'Collection target', icon: 'DollarSign', color: 'text-red-600 bg-red-50' },
      { label: 'UPI / Bank Commitments', value: 15, subtext: 'Payment promised', icon: 'CheckCircle2', color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Overdue >3 Days', value: 4, subtext: 'Urgent follow-up', icon: 'AlertTriangle', color: 'text-purple-600 bg-purple-50' },
    ],
  },
  won: {
    key: 'won',
    title: 'Won Deals',
    description: 'Successfully closed contracts and converted accounts',
    kpis: [
      { label: 'Total Won Deals', value: 26, subtext: '30% vs last week', icon: 'Trophy', color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Closed Revenue', value: '₹18.90 Lakhs', subtext: 'Realized ARR', icon: 'DollarSign', color: 'text-purple-600 bg-purple-50' },
      { label: 'Avg Closure Time', value: '11 Days', subtext: 'Fast onboarding', icon: 'Clock', color: 'text-blue-600 bg-blue-50' },
      { label: 'Activation Rate', value: '96%', subtext: 'Live on platform', icon: 'Check', color: 'text-emerald-600 bg-emerald-50' },
    ],
  },
  lost: {
    key: 'lost',
    title: 'Lost Deals',
    description: 'Unconverted deal opportunities with loss reason audit',
    kpis: [
      { label: 'Total Lost Deals', value: 14, subtext: 'Audited deals', icon: 'XCircle', color: 'text-red-600 bg-red-50' },
      { label: 'Lost Value', value: '₹7.60 Lakhs', subtext: 'Potential revenue lost', icon: 'DollarSign', color: 'text-slate-600 bg-slate-100' },
      { label: 'Top Reason', value: 'Price Budget', subtext: '42% of lost deals', icon: 'AlertTriangle', color: 'text-amber-600 bg-amber-50' },
      { label: 'Re-nurture Eligible', value: 9, subtext: 'Eligible for 60d callback', icon: 'RotateCcw', color: 'text-blue-600 bg-blue-50' },
    ],
  },
};
