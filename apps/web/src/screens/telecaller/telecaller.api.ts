import { api } from '../../common/api';

export interface TelecallerKpis {
  dailyCallTarget: number;
  callsCompleted: number;
  connectedCalls: number;
  followUpsDue: number;
  followUpsOverdue: number;
  demosBooked: number;
  conversions: number;
  talkTimeSeconds: number; // e.g. 9990 seconds = 02:46:30
  conversionRatePct: number;
  callsVsYesterdayPct: number;
  connectedVsYesterdayPct: number;
  demosVsYesterdayPct: number;
  conversionsVsYesterdayPct: number;
  talkTimeVsYesterdayPct: number;
  conversionRateVsYesterdayPp: number;
}

export interface DayPlanSlot {
  id: string;
  timeSlot: string; // e.g. "09:00 - 09:15"
  title: string; // e.g. "Morning kickoff & hot lead review"
  durationMins: number;
  plannedCalls?: number;
  doneCalls?: number;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  iconType?: 'kickoff' | 'calls' | 'break' | 'followup' | 'lunch' | 'demo' | 'pending' | 'wrapup';
}

export interface PriorityQueueItem {
  id: string;
  leadName: string;
  company: string;
  priority: 'High' | 'Medium' | 'Low';
  lastContact: string; // e.g. "Today, 09:10 AM"
  phone: string;
}

export interface FollowUpCommitment {
  id: string;
  time: string; // e.g. "10:30 AM"
  leadName: string;
  topic: string; // e.g. "Follow-up call"
  priority: 'High' | 'Medium' | 'Low';
}

export interface PerformanceTrendDay {
  day: string; // e.g. "20 May"
  callsCompleted: number;
  connectedCalls: number;
  conversions: number;
}

export interface TelecallerBadge {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export interface DayChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface TelecallerDashboardData {
  telecallerName: string;
  role: string;
  status: 'Available' | 'On Call' | 'In Meeting' | 'On Break' | 'Offline';
  dateStr: string;
  kpis: TelecallerKpis;
  dayPlan: DayPlanSlot[];
  bestConnectingTime: string;
  targetStreakDays: number;
  aiCoachTips: string[];
  priorityQueue: PriorityQueueItem[];
  followUps: FollowUpCommitment[];
  performanceTrend: PerformanceTrendDay[];
  weeklyAvg: {
    calls: number;
    callsChangePct: number;
    connected: number;
    connectedChangePct: number;
    conversions: number;
    conversionsChangePct: number;
  };
  badges: TelecallerBadge[];
  checklist: DayChecklistItem[];
}

export const getTelecallerDashboard = async (): Promise<TelecallerDashboardData> => {
  try {
    const res = await api.get<TelecallerDashboardData>('/tenant/crm/telecaller/dashboard');
    return res.data;
  } catch {
    // Fallback Mock Data matching the exact screenshot design
    return {
      telecallerName: 'Neha Sharma',
      role: 'Telecaller',
      status: 'Available',
      dateStr: '26 May 2025, Mon',
      kpis: {
        dailyCallTarget: 100,
        callsCompleted: 68,
        connectedCalls: 38,
        followUpsDue: 14,
        followUpsOverdue: 3,
        demosBooked: 3,
        conversions: 7,
        talkTimeSeconds: 9990, // 02:46:30
        conversionRatePct: 18.4,
        callsVsYesterdayPct: 12,
        connectedVsYesterdayPct: 18,
        demosVsYesterdayPct: 50,
        conversionsVsYesterdayPct: 16,
        talkTimeVsYesterdayPct: 10,
        conversionRateVsYesterdayPp: 2.3,
      },
      dayPlan: [
        { id: '1', timeSlot: '09:00 - 09:15', title: 'Morning kickoff & hot lead review', durationMins: 15, status: 'Completed', iconType: 'kickoff' },
        { id: '2', timeSlot: '09:15 - 11:00', title: 'High-priority outbound calls', durationMins: 105, plannedCalls: 45, doneCalls: 28, status: 'In Progress', iconType: 'calls' },
        { id: '3', timeSlot: '11:00 - 11:15', title: 'Quick break', durationMins: 15, status: 'Upcoming', iconType: 'break' },
        { id: '4', timeSlot: '11:15 - 01:00', title: 'Follow-up calls & callbacks', durationMins: 105, plannedCalls: 35, doneCalls: 12, status: 'Upcoming', iconType: 'followup' },
        { id: '5', timeSlot: '01:00 - 01:30', title: 'Lunch', durationMins: 30, status: 'Upcoming', iconType: 'lunch' },
        { id: '6', timeSlot: '01:30 - 03:30', title: 'Demo booking & lead qualification', durationMins: 120, plannedCalls: 35, doneCalls: 0, status: 'Upcoming', iconType: 'demo' },
        { id: '7', timeSlot: '03:30 - 03:45', title: 'Break', durationMins: 15, status: 'Upcoming', iconType: 'break' },
        { id: '8', timeSlot: '03:45 - 05:30', title: 'Pending leads & warm prospects', durationMins: 105, plannedCalls: 30, doneCalls: 0, status: 'Upcoming', iconType: 'pending' },
        { id: '9', timeSlot: '05:30 - 06:00', title: 'Wrap-up, notes & tomorrow follow-ups', durationMins: 30, status: 'Upcoming', iconType: 'wrapup' },
      ],
      bestConnectingTime: '03:00 PM – 05:00 PM',
      targetStreakDays: 4,
      aiCoachTips: [
        'Focus on hot leads first – highest conversion potential',
        'Call back no-answer leads within 2 hours',
        'Use discovery script for first-time leads',
        'Aim for 25 quality calls before lunch',
        'Log every disposition immediately',
      ],
      priorityQueue: [
        { id: 'q1', leadName: 'Ramesh Verma', company: 'Veema Solutions', priority: 'High', lastContact: 'Today, 09:10 AM', phone: '+91 98765 43210' },
        { id: 'q2', leadName: 'Anjali Mehta', company: 'Mehta & Co.', priority: 'High', lastContact: 'Today, 08:45 AM', phone: '+91 98765 43211' },
        { id: 'q3', leadName: 'Vikram Singh', company: 'Singh Traders', priority: 'Medium', lastContact: 'Yesterday', phone: '+91 98765 43212' },
        { id: 'q4', leadName: 'Priya Nair', company: 'Nair Enterprises', priority: 'Medium', lastContact: 'Yesterday', phone: '+91 98765 43213' },
        { id: 'q5', leadName: 'Arjun Patel', company: 'Patel Industries', priority: 'Low', lastContact: '2 Days Ago', phone: '+91 98765 43214' },
      ],
      followUps: [
        { id: 'f1', time: '10:30 AM', leadName: 'Sonal Shah', topic: 'Follow-up call', priority: 'High' },
        { id: 'f2', time: '12:00 PM', leadName: 'Deepak Kumar', topic: 'Callback', priority: 'Medium' },
        { id: 'f3', time: '02:00 PM', leadName: 'Neeraj Joshi', topic: 'Product Demo', priority: 'High' },
        { id: 'f4', time: '03:15 PM', leadName: 'Kavita Reddy', topic: 'Follow-up', priority: 'Medium' },
        { id: 'f5', time: '04:30 PM', leadName: 'Mohit Agarwal', topic: 'Price Discussion', priority: 'Low' },
      ],
      performanceTrend: [
        { day: '20 May', callsCompleted: 35, connectedCalls: 20, conversions: 4 },
        { day: '21 May', callsCompleted: 48, connectedCalls: 30, conversions: 7 },
        { day: '22 May', callsCompleted: 68, connectedCalls: 40, conversions: 11 },
        { day: '23 May', callsCompleted: 42, connectedCalls: 22, conversions: 6 },
        { day: '24 May', callsCompleted: 60, connectedCalls: 36, conversions: 10 },
        { day: '25 May', callsCompleted: 70, connectedCalls: 40, conversions: 12 },
        { day: '26 May', callsCompleted: 72, connectedCalls: 42, conversions: 14 },
      ],
      weeklyAvg: {
        calls: 72,
        callsChangePct: 12,
        connected: 34,
        connectedChangePct: 15,
        conversions: 6,
        conversionsChangePct: 10,
      },
      badges: [
        { id: 'b1', title: 'On Track', subtitle: '4 Days', icon: '🎯', color: 'bg-red-50 text-red-600 border-red-200' },
        { id: 'b2', title: 'Focus Mode', subtitle: 'New', icon: '🚀', color: 'bg-blue-50 text-blue-600 border-blue-200' },
        { id: 'b3', title: 'Demo Hunter', subtitle: '3 Demos', icon: '⭐', color: 'bg-purple-50 text-purple-600 border-purple-200' },
        { id: 'b4', title: 'Consistency', subtitle: '4 Days', icon: '🏆', color: 'bg-amber-50 text-amber-600 border-amber-200' },
      ],
      checklist: [
        { id: 'c1', label: 'Complete 100 calls', completed: true },
        { id: 'c2', label: 'Close 20 follow-ups', completed: true },
        { id: 'c3', label: 'Book 3 demos', completed: false },
        { id: 'c4', label: 'Update all dispositions', completed: false },
        { id: 'c5', label: 'Clear overdue callbacks', completed: false },
      ],
    };
  }
};
