export interface ExecutiveTrendPoint {
  month: string;
  leadsAssigned: number;
  leadsConverted: number;
  dealsWon: number;
  revenue: number;
}

export interface ExecutiveProfileData {
  id: string;
  employeeCode: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  department: string | null;
  status: string;
  email: string;
  mobile: string | null;
  address: string | null;
  teamName: string | null;
  managerName: string | null;
  managerEmployeeCode: string | null;
  joinedAt: string;
  employmentType: string | null;
  overview: {
    totals: {
      leadsAssigned: number;
      leadsConverted: number;
      dealsWon: number;
      revenue: number;
      conversionRate: number;
    };
    changes: {
      leadsAssigned: number;
      leadsConverted: number;
      dealsWon: number;
      revenue: number;
    };
    target: null | {
      period: string;
      target: number;
      achieved: number;
      percentage: number;
    };
    trend: ExecutiveTrendPoint[];
    recentActivity: Array<{
      id: string;
      type: string;
      description: string;
      occurredAt: string;
      tag: string;
    }>;
  };
  performance: {
    period: string;
    targets: Array<{
      label: string;
      achieved: number;
      target: number;
      kind: 'currency' | 'number';
    }>;
    trend: ExecutiveTrendPoint[];
    leadsBySource: Array<{ name: string; value: number }>;
    visitCompletionRate: number;
  };
  routeHistory: {
    totalDays: number;
    totalVisits: number;
    completedVisits: number;
    totalDurationMinutes: number;
    days: Array<{
      date: string;
      firstCheckIn: string | null;
      lastCheckOut: string | null;
      visits: number;
      completed: number;
      durationMinutes: number;
    }>;
    points: Array<{
      id: string;
      name: string;
      location: string;
      latitude: number;
      longitude: number;
      timestamp: string;
      status: string;
    }>;
  };
  attendance: {
    period: string;
    summary: {
      present: number;
      absent: number;
      late: number;
      halfDay: number;
      workingDays: number;
      percentage: number;
      averageWorkMinutes: number;
    };
    days: Array<{
      id: string;
      date: string;
      status: string;
      punchInTime: string | null;
      punchOutTime: string | null;
      totalWorkMinutes: number;
      lateMinutes: number;
      remarks: string | null;
    }>;
  };
  visits: {
    summary: {
      total: number;
      completed: number;
      scheduled: number;
      cancelled: number;
      productive: number;
    };
    items: Array<{
      id: string;
      targetName: string;
      targetType: string;
      location: string;
      purpose: string;
      visitType: string;
      status: string;
      outcome: string | null;
      checkInTime: string;
      checkOutTime: string | null;
      durationMinutes: number;
    }>;
  };
  sales: {
    summary: {
      leadsAssigned: number;
      leadsConverted: number;
      dealsWon: number;
      revenue: number;
      pipelineValue: number;
    };
    trend: ExecutiveTrendPoint[];
    stages: Array<{ stage: string; count: number }>;
    wonDeals: Array<{
      id: string;
      dealCode: string;
      title: string;
      customer: string | null;
      amount: number;
      wonAt: string;
    }>;
  };
  incentives: {
    available: boolean;
    message: string;
  };
}
