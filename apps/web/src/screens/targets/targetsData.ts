export interface TeamTargetItem {
  id: string;
  teamName: string;
  branch: string;
  teamLeaderName: string;
  teamLeaderAvatar: string;
  targetAmount: number;
  achievedAmount: number;
  achievementPct: number;
  executivesCount: number;
  incentiveEarned: number;
  status: 'On Track' | 'At Risk' | 'Behind';
}

export interface ExecutiveTargetItem {
  id: string;
  executiveId: string;
  executiveName: string;
  executiveAvatar: string;
  role: string;
  teamName: string;
  salesTarget: number;
  salesAchieved: number;
  salesPct: number;
  demosTarget: number;
  demosAchieved: number;
  visitsTarget: number;
  visitsAchieved: number;
  incentiveEarned: number;
  status: 'On Track' | 'At Risk' | 'Behind';
}

export interface IncentiveRuleItem {
  id: string;
  ruleName: string;
  ruleType: 'Achievement' | 'Performance' | 'Activity' | 'Ranking' | 'Retention';
  appliesTo: string;
  metric: string;
  payoutStructure: string;
  validityPeriod: string;
  status: 'Active' | 'Paused' | 'Inactive';
}

export interface IncentiveCalculationItem {
  id: string;
  executiveId: string;
  executiveName: string;
  executiveAvatar: string;
  teamName: string;
  salesIncentive: number;
  demoIncentive: number;
  visitIncentive: number;
  bonusIncentive: number;
  totalIncentive: number;
  approvedAmount: number;
  payoutStatus: 'Approved' | 'Pending Approval' | 'Paid' | 'Rejected';
  monthPeriod: string;
}

export interface IncentivePayoutItem {
  id: string;
  payoutId: string;
  executiveName: string;
  executiveAvatar: string;
  bankAccountOrUpi: string;
  amount: number;
  payoutDate: string;
  paymentMode: 'Bank Transfer' | 'UPI' | 'Direct Deposit';
  status: 'Paid' | 'Processing' | 'Failed';
  referenceNo: string;
}

export const mockTeamTargets: TeamTargetItem[] = [
  { id: 'tt-1', teamName: 'West Zone', branch: 'Mumbai', teamLeaderName: 'Rahul Gupta', teamLeaderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', targetAmount: 225000, achievedAmount: 168750, achievementPct: 75.0, executivesCount: 12, incentiveEarned: 34250, status: 'On Track' },
  { id: 'tt-2', teamName: 'Central Zone', branch: 'Mumbai', teamLeaderName: 'Vijay Patel', teamLeaderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', targetAmount: 200000, achievedAmount: 132400, achievementPct: 66.2, executivesCount: 10, incentiveEarned: 26480, status: 'On Track' },
  { id: 'tt-3', teamName: 'North Zone', branch: 'Delhi', teamLeaderName: 'Neha Sharma', teamLeaderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', targetAmount: 175000, achievedAmount: 105350, achievementPct: 60.2, executivesCount: 9, incentiveEarned: 21070, status: 'At Risk' },
  { id: 'tt-4', teamName: 'South Zone', branch: 'Bangalore', teamLeaderName: 'Suresh Patel', teamLeaderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', targetAmount: 150000, achievedAmount: 92600, achievementPct: 61.7, executivesCount: 8, incentiveEarned: 18520, status: 'At Risk' },
  { id: 'tt-5', teamName: 'East Zone', branch: 'Kolkata', teamLeaderName: 'Komal Verma', teamLeaderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', targetAmount: 125000, achievedAmount: 64350, achievementPct: 51.5, executivesCount: 5, incentiveEarned: 12870, status: 'Behind' },
  { id: 'tt-6', teamName: 'Ahmedabad Branch', branch: 'Gujarat', teamLeaderName: 'Amit Jain', teamLeaderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', targetAmount: 100000, achievedAmount: 49000, achievementPct: 49.0, executivesCount: 4, incentiveEarned: 10160, status: 'Behind' },
];

export const mockExecutiveTargets: ExecutiveTargetItem[] = [
  { id: 'et-1', executiveId: 'FE-1001', executiveName: 'Rahul Gupta', executiveAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', role: 'Sales Executive', teamName: 'West Zone', salesTarget: 45000, salesAchieved: 57825, salesPct: 128.5, demosTarget: 10, demosAchieved: 14, visitsTarget: 60, visitsAchieved: 72, incentiveEarned: 14850, status: 'On Track' },
  { id: 'et-2', executiveId: 'FE-1002', executiveName: 'Priya Sharma', executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', role: 'Sales Executive', teamName: 'West Zone', salesTarget: 40000, salesAchieved: 44920, salesPct: 112.3, demosTarget: 8, demosAchieved: 10, visitsTarget: 50, visitsAchieved: 58, incentiveEarned: 11200, status: 'On Track' },
  { id: 'et-3', executiveId: 'FE-1003', executiveName: 'Vijay Patel', executiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', role: 'Sales Executive', teamName: 'Central Zone', salesTarget: 38000, salesAchieved: 40166, salesPct: 105.7, demosTarget: 8, demosAchieved: 9, visitsTarget: 45, visitsAchieved: 48, incentiveEarned: 9800, status: 'On Track' },
  { id: 'et-4', executiveId: 'FE-1004', executiveName: 'Amit Jain', executiveAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', role: 'Sales Executive', teamName: 'West Zone', salesTarget: 35000, salesAchieved: 35420, salesPct: 101.2, demosTarget: 7, demosAchieved: 7, visitsTarget: 40, visitsAchieved: 42, incentiveEarned: 8400, status: 'On Track' },
  { id: 'et-5', executiveId: 'FE-1005', executiveName: 'Neha Sharma', executiveAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', role: 'Sales Executive', teamName: 'North Zone', salesTarget: 35000, salesAchieved: 34510, salesPct: 98.6, demosTarget: 7, demosAchieved: 6, visitsTarget: 40, visitsAchieved: 38, incentiveEarned: 7600, status: 'At Risk' },
];

export const mockIncentiveRules: IncentiveRuleItem[] = [
  { id: 'ir-1', ruleName: 'Sales Achievement Bonus', ruleType: 'Achievement', appliesTo: 'All Executives', metric: 'Total Sales (Amount)', payoutStructure: '₹ 500 for every ₹ 10,000 achieved', validityPeriod: '01 May 2025 - 31 May 2025', status: 'Active' },
  { id: 'ir-2', ruleName: 'New Customer Bonus', ruleType: 'Performance', appliesTo: 'All Executives', metric: 'New Customers (Count)', payoutStructure: '₹ 200 per New Customer', validityPeriod: '01 May 2025 - 31 May 2025', status: 'Active' },
  { id: 'ir-3', ruleName: 'Visit Completion Bonus', ruleType: 'Activity', appliesTo: 'Field Executives', metric: 'Total Visits (Count)', payoutStructure: '₹ 50 per Visit', validityPeriod: '01 May 2025 - 31 May 2025', status: 'Active' },
  { id: 'ir-4', ruleName: 'Demo / Presentation Bonus', ruleType: 'Activity', appliesTo: 'All Executives', metric: 'Demos (Count)', payoutStructure: '₹ 100 per Demo', validityPeriod: '01 May 2025 - 31 May 2025', status: 'Paused' },
  { id: 'ir-5', ruleName: 'Collection Incentive', ruleType: 'Achievement', appliesTo: 'All Executives', metric: 'Collections (Amount)', payoutStructure: '1% of collection amount', validityPeriod: '01 May 2025 - 31 May 2025', status: 'Active' },
  { id: 'ir-6', ruleName: 'Quality Lead Bonus', ruleType: 'Performance', appliesTo: 'Telecallers', metric: 'Quality Leads (Count)', payoutStructure: '₹ 150 per Quality Lead', validityPeriod: '01 May 2025 - 31 May 2025', status: 'Paused' },
  { id: 'ir-7', ruleName: 'Top Performer Bonus', ruleType: 'Ranking', appliesTo: 'All Executives', metric: 'Performance (Score)', payoutStructure: 'Top 3 performers get ₹ 1,000', validityPeriod: '01 May 2025 - 31 May 2025', status: 'Active' },
  { id: 'ir-8', ruleName: 'Retention Bonus', ruleType: 'Retention', appliesTo: 'All Executives', metric: 'Retention % (Percentage)', payoutStructure: '₹ 300 for retention above 80%', validityPeriod: '01 May 2025 - 31 May 2025', status: 'Inactive' },
];

export const mockIncentiveCalculations: IncentiveCalculationItem[] = [
  { id: 'ic-1', executiveId: 'FE-1001', executiveName: 'Rahul Gupta', executiveAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', teamName: 'West Zone', salesIncentive: 8500, demoIncentive: 1400, visitIncentive: 3600, bonusIncentive: 1350, totalIncentive: 14850, approvedAmount: 14850, payoutStatus: 'Approved', monthPeriod: 'May 2025' },
  { id: 'ic-2', executiveId: 'FE-1002', executiveName: 'Priya Sharma', executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', teamName: 'West Zone', salesIncentive: 6500, demoIncentive: 1000, visitIncentive: 2900, bonusIncentive: 800, totalIncentive: 11200, approvedAmount: 11200, payoutStatus: 'Approved', monthPeriod: 'May 2025' },
  { id: 'ic-3', executiveId: 'FE-1003', executiveName: 'Vijay Patel', executiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', teamName: 'Central Zone', salesIncentive: 5800, demoIncentive: 900, visitIncentive: 2400, bonusIncentive: 700, totalIncentive: 9800, approvedAmount: 9800, payoutStatus: 'Pending Approval', monthPeriod: 'May 2025' },
  { id: 'ic-4', executiveId: 'FE-1004', executiveName: 'Amit Jain', executiveAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', teamName: 'West Zone', salesIncentive: 5000, demoIncentive: 700, visitIncentive: 2100, bonusIncentive: 600, totalIncentive: 8400, approvedAmount: 8400, payoutStatus: 'Pending Approval', monthPeriod: 'May 2025' },
];

export const mockIncentivePayouts: IncentivePayoutItem[] = [
  { id: 'ip-1', payoutId: 'PAY-8801', executiveName: 'Rahul Gupta', executiveAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', bankAccountOrUpi: 'HDFC Bank •••• 4910', amount: 14850, payoutDate: '20 May 2025', paymentMode: 'Bank Transfer', status: 'Paid', referenceNo: 'TXN-99881234' },
  { id: 'ip-2', payoutId: 'PAY-8802', executiveName: 'Priya Sharma', executiveAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', bankAccountOrUpi: 'priya@okicici', amount: 11200, payoutDate: '20 May 2025', paymentMode: 'UPI', status: 'Paid', referenceNo: 'UPI-77443311' },
  { id: 'ip-3', payoutId: 'PAY-8803', executiveName: 'Vijay Patel', executiveAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', bankAccountOrUpi: 'ICICI Bank •••• 1029', amount: 9800, payoutDate: '21 May 2025', paymentMode: 'Bank Transfer', status: 'Processing', referenceNo: 'TXN-99881235' },
];
