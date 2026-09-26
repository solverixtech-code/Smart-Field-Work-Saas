import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmRepository } from './crm.repository';
import { parseFollowUpSchedule } from './follow-up-schedule';
import { setSalesTargetSchema, targetDashboardQuery, TargetMetric } from './target-contract';

type Scope = { teamId: string | null; membershipId: string | null };
type Activity = Scope & { period: string; metric: TargetMetric; value: number };

const round = (value: number) => Math.round(value * 10) / 10;
const percentage = (actual: number, target: number) => target > 0 ? round((actual / target) * 100) : 0;
const change = (current: number, previous: number) => previous === 0 ? (current === 0 ? 0 : 100) : round(((current - previous) / previous) * 100);
const nextPeriod = (period: string) => {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(Date.UTC(year, month, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};
const scopeMatches = (target: Scope, activity: Scope) => target.teamId
  ? target.teamId === activity.teamId
  : target.membershipId === activity.membershipId;

@Injectable()
export class TargetService {
  constructor(private readonly repo: CrmRepository) {}

  async dashboard(actor: RequestPrincipal, query: unknown) {
    const q = targetDashboardQuery.parse(query);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require('crm.targets.view');
      const tenantId = policy.scope.tenantId;
      const settings = await tx.tenantSettings.findUnique({ where: { tenantId }, select: { timezone: true } });
      const timezone = settings?.timezone ?? 'Asia/Kolkata';
      const periods = [q.period, q.comparePeriod];
      const firstPeriod = [...periods].sort()[0];
      const lastPeriod = [...periods].sort()[1];
      const rangeStart = parseFollowUpSchedule(`${firstPeriod}-01`, '12:00 AM', timezone);
      const rangeEnd = parseFollowUpSchedule(`${nextPeriod(lastPeriod)}-01`, '12:00 AM', timezone);

      const [targets, teams, executives, opportunities, visits, demos, incentiveCalculations] = await Promise.all([
        tx.salesTarget.findMany({
          where: { tenantId, period: { in: periods } },
          orderBy: [{ period: 'desc' }, { createdAt: 'asc' }],
          select: { id: true, title: true, period: true, metric: true, targetValue: true, thresholdPct: true, teamId: true, membershipId: true },
        }),
        tx.team.findMany({
          where: { tenantId, isActive: true },
          orderBy: { name: 'asc' },
          select: {
            id: true, name: true, code: true,
            tenantMemberships: {
              where: { status: 'ACTIVE' },
              select: {
                id: true, department: true, designation: true,
                tenantRole: { select: { code: true } },
                user: { select: { fullName: true, avatarUrl: true, role: true } },
              },
            },
          },
        }),
        tx.tenantMembership.findMany({
          where: {
            tenantId, status: 'ACTIVE',
            OR: [
              { tenantRole: { code: { in: ['field_executive', 'sales_manager', 'team_leader'] } } },
              { user: { role: { in: ['FIELD_EXECUTIVE', 'SALES_MANAGER', 'TEAM_LEADER'] } } },
            ],
          },
          orderBy: { user: { fullName: 'asc' } },
          select: { id: true, employeeCode: true, designation: true, teamId: true, team: { select: { name: true } }, user: { select: { fullName: true, avatarUrl: true, employeeCode: true } } },
        }),
        tx.opportunity.findMany({
          where: { tenantId, deletedAt: null, stage: { equals: 'won', mode: 'insensitive' }, OR: [
            { closedAt: { gte: rangeStart, lt: rangeEnd } },
            { closedAt: null, updatedAt: { gte: rangeStart, lt: rangeEnd } },
          ] },
          select: { amount: true, closedAt: true, updatedAt: true, assignedMembership: { select: { id: true, teamId: true } }, ownerMembership: { select: { id: true, teamId: true } } },
        }),
        tx.leadVisit.findMany({
          where: { tenantId, status: { equals: 'COMPLETED', mode: 'insensitive' }, checkInTime: { gte: rangeStart, lt: rangeEnd } },
          select: { checkInTime: true, executiveMembership: { select: { id: true, teamId: true } } },
        }),
        tx.leadDemo.findMany({
          where: { tenantId, status: { equals: 'COMPLETED', mode: 'insensitive' }, demoDate: { gte: `${firstPeriod}-01`, lt: `${nextPeriod(lastPeriod)}-01` } },
          select: { demoDate: true, conductedByMembership: { select: { id: true, teamId: true } } },
        }),
        tx.incentiveCalculation.findMany({
          where: { tenantId, period: { in: periods }, status: { not: 'REJECTED' } },
          select: {
            period: true, membershipId: true, totalIncentive: true,
            payout: { select: { amount: true, status: true } },
          },
        }),
      ]);

      const activities: Activity[] = [];
      opportunities.forEach((opportunity) => {
        const member = opportunity.assignedMembership ?? opportunity.ownerMembership;
        const occurredAt = opportunity.closedAt ?? opportunity.updatedAt;
        activities.push({ period: this.localPeriod(occurredAt, timezone), metric: 'sales_amount', value: Number(opportunity.amount), teamId: member.teamId, membershipId: member.id });
        activities.push({ period: this.localPeriod(occurredAt, timezone), metric: 'deals_count', value: 1, teamId: member.teamId, membershipId: member.id });
      });
      visits.forEach((visit) => activities.push({ period: this.localPeriod(visit.checkInTime, timezone), metric: 'visits_count', value: 1, teamId: visit.executiveMembership.teamId, membershipId: visit.executiveMembership.id }));
      demos.forEach((demo) => activities.push({ period: demo.demoDate.slice(0, 7), metric: 'demos_count', value: 1, teamId: demo.conductedByMembership.teamId, membershipId: demo.conductedByMembership.id }));

      const actualFor = (target: typeof targets[number]) => activities
        .filter((activity) => activity.period === target.period && activity.metric === target.metric && scopeMatches(target, activity))
        .reduce((sum, activity) => sum + activity.value, 0);
      const currentTargets = targets.filter((target) => target.period === q.period);
      const comparisonTargets = targets.filter((target) => target.period === q.comparePeriod);
      const revenueSnapshot = (rows: typeof targets) => {
        const revenueTargets = rows.filter((target) => target.metric === 'sales_amount');
        const teamRevenueTargets = revenueTargets.filter((target) => target.teamId);
        const revenue = teamRevenueTargets.length ? teamRevenueTargets : revenueTargets;
        const totalTarget = revenue.reduce((sum, target) => sum + Number(target.targetValue), 0);
        const achieved = revenue.reduce((sum, target) => sum + actualFor(target), 0);
        return { totalTarget, achieved, achievementPercent: percentage(achieved, totalTarget) };
      };
      const current = revenueSnapshot(currentTargets);
      const comparison = revenueSnapshot(comparisonTargets);
      const teamById = new Map(teams.map((team) => [team.id, team]));
      const executiveById = new Map(executives.map((executive) => [executive.id, executive]));
      const currentIncentiveByMembership = new Map(incentiveCalculations.filter((row) => row.period === q.period)
        .map((row) => [row.membershipId, Number(row.totalIncentive)]));
      const incentiveTotals = (period: string) => incentiveCalculations.filter((row) => row.period === period).reduce((result, row) => ({
        earned: result.earned + Number(row.totalIncentive),
        paid: result.paid + (row.payout?.status === 'PAID' ? Number(row.payout.amount) : 0),
      }), { earned: 0, paid: 0 });
      const currentIncentives = incentiveTotals(q.period);
      const comparisonIncentives = incentiveTotals(q.comparePeriod);
      const teamTargets = currentTargets.filter((target) => target.teamId && target.metric === 'sales_amount').map((target) => {
        const team = teamById.get(target.teamId!);
        const leader = team?.tenantMemberships.find((member) => member.tenantRole?.code === 'team_leader' || member.user.role === 'TEAM_LEADER');
        const targetAmount = Number(target.targetValue);
        const achievedAmount = actualFor(target);
        const achievementPct = percentage(achievedAmount, targetAmount);
        const threshold = Number(target.thresholdPct);
        return {
          id: target.id, teamId: target.teamId!, teamName: team?.name ?? 'Unavailable team',
          title: target.title, thresholdPct: threshold,
          branch: team?.code ?? 'No branch assigned', teamLeaderName: leader?.user.fullName ?? 'Not assigned',
          teamLeaderAvatar: leader?.user.avatarUrl ?? null, targetAmount, achievedAmount, achievementPct,
          executivesCount: team?.tenantMemberships.length ?? 0,
          incentiveEarned: team?.tenantMemberships.reduce((sum, member) => sum + (currentIncentiveByMembership.get(member.id) ?? 0), 0) ?? 0,
          status: achievementPct >= threshold ? 'On Track' : achievementPct >= threshold * 0.75 ? 'At Risk' : 'Behind',
        } as const;
      });
      const topAchievers = currentTargets.filter((target) => target.membershipId && target.metric === 'sales_amount')
        .map((target) => {
          const executive = executiveById.get(target.membershipId!);
          return {
            id: target.membershipId!, name: executive?.user.fullName ?? 'Unavailable executive',
            avatarUrl: executive?.user.avatarUrl ?? null, teamName: executive?.team?.name ?? 'No team assigned',
            achievementPct: percentage(actualFor(target), Number(target.targetValue)),
          };
        })
        .sort((left, right) => right.achievementPct - left.achievementPct || left.name.localeCompare(right.name))
        .slice(0, 3);
      const statusDistribution = teamTargets.reduce((result, target) => ({ ...result, [target.status]: result[target.status] + 1 }), { 'On Track': 0, 'At Risk': 0, Behind: 0 });
      const executiveTargets = executives.map((executive) => {
        const targetFor = (metric: TargetMetric) => currentTargets.find((target) => target.membershipId === executive.id && target.metric === metric);
        const actualForExecutive = (metric: TargetMetric) => activities
          .filter((activity) => activity.period === q.period && activity.membershipId === executive.id && activity.metric === metric)
          .reduce((sum, activity) => sum + activity.value, 0);
        const sales = targetFor('sales_amount');
        const demosTarget = targetFor('demos_count');
        const visitsTarget = targetFor('visits_count');
        const salesTarget = Number(sales?.targetValue ?? 0);
        const salesAchieved = actualForExecutive('sales_amount');
        const salesPct = percentage(salesAchieved, salesTarget);
        const threshold = Number(sales?.thresholdPct ?? 80);
        return {
          id: executive.id,
          executiveId: executive.employeeCode ?? executive.user.employeeCode,
          executiveName: executive.user.fullName,
          executiveAvatar: executive.user.avatarUrl ?? null,
          role: executive.designation ?? 'Executive',
          teamId: executive.teamId,
          teamName: executive.team?.name ?? 'Not assigned',
          salesTarget, salesAchieved, salesPct,
          demosTarget: Number(demosTarget?.targetValue ?? 0),
          demosAchieved: actualForExecutive('demos_count'),
          visitsTarget: Number(visitsTarget?.targetValue ?? 0),
          visitsAchieved: actualForExecutive('visits_count'),
          incentiveEarned: currentIncentiveByMembership.get(executive.id) ?? 0,
          status: salesPct >= threshold ? 'On Track' : salesPct >= threshold * 0.75 ? 'At Risk' : 'Behind',
        } as const;
      });

      return {
        period: q.period,
        comparePeriod: q.comparePeriod,
        summary: {
          ...current,
          activeExecutives: executives.length,
          incentiveEarned: currentIncentives.earned,
          incentivePaid: currentIncentives.paid,
          changes: {
            totalTarget: change(current.totalTarget, comparison.totalTarget),
            achieved: change(current.achieved, comparison.achieved),
            achievementPercent: round(current.achievementPercent - comparison.achievementPercent),
            activeExecutives: 0,
            incentiveEarned: change(currentIncentives.earned, comparisonIncentives.earned),
            incentivePaid: change(currentIncentives.paid, comparisonIncentives.paid),
          },
        },
        teams: teamTargets,
        executives: executiveTargets,
        topAchievers,
        statusDistribution,
        options: {
          teams: teams.map((team) => ({ value: team.id, label: `${team.name} (${team.code})` })),
          executives: executives.map((executive) => ({ value: executive.id, label: executive.user.fullName, avatar: executive.user.avatarUrl ?? undefined, sublabel: [executive.designation, executive.team?.name].filter(Boolean).join(' • ') || executive.employeeCode || executive.user.employeeCode })),
        },
        sourceAvailability: { incentives: true, collections: false },
      };
    });
  }

  async navigationSummary(actor: RequestPrincipal) {
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require('crm.targets.view');
      const tenantId = policy.scope.tenantId;
      const settings = await tx.tenantSettings.findUnique({ where: { tenantId }, select: { timezone: true } });
      const timezone = settings?.timezone ?? 'Asia/Kolkata';
      const period = this.localPeriod(new Date(), timezone);
      const start = parseFollowUpSchedule(`${period}-01`, '12:00 AM', timezone);
      const end = parseFollowUpSchedule(`${nextPeriod(period)}-01`, '12:00 AM', timezone);
      const [teamCount, executiveCount, ruleCount, teamTargets, wonDeals, incentiveCalculations] = await Promise.all([
        tx.team.count({ where: { tenantId, isActive: true } }),
        tx.tenantMembership.count({ where: { tenantId, status: 'ACTIVE', OR: [
          { tenantRole: { code: { in: ['field_executive', 'sales_manager', 'team_leader'] } } },
          { user: { role: { in: ['FIELD_EXECUTIVE', 'SALES_MANAGER', 'TEAM_LEADER'] } } },
        ] } }),
        tx.incentiveRule.count({ where: { tenantId } }),
        tx.salesTarget.findMany({ where: { tenantId, period, metric: 'sales_amount', teamId: { not: null } }, select: { teamId: true, targetValue: true } }),
        tx.opportunity.findMany({ where: { tenantId, deletedAt: null, stage: { equals: 'won', mode: 'insensitive' }, OR: [
          { closedAt: { gte: start, lt: end } }, { closedAt: null, updatedAt: { gte: start, lt: end } },
        ] }, select: { amount: true, assignedMembership: { select: { teamId: true } }, ownerMembership: { select: { teamId: true } } } }),
        tx.incentiveCalculation.findMany({ where: { tenantId, period, status: { not: 'REJECTED' } }, select: { totalIncentive: true } }),
      ]);
      const targetByTeam = new Map(teamTargets.map((target) => [target.teamId!, Number(target.targetValue)]));
      const totalTarget = [...targetByTeam.values()].reduce((sum, value) => sum + value, 0);
      const achieved = wonDeals.reduce((sum, deal) => {
        const teamId = deal.assignedMembership?.teamId ?? deal.ownerMembership.teamId;
        return teamId && targetByTeam.has(teamId) ? sum + Number(deal.amount) : sum;
      }, 0);
      return {
        teamCount,
        executiveCount,
        ruleCount,
        targetAchievement: percentage(achieved, totalTarget),
        incentiveEarned: incentiveCalculations.reduce((sum, row) => sum + Number(row.totalIncentive), 0),
      };
    });
  }

  async setTarget(actor: RequestPrincipal, body: unknown) {
    const input = setSalesTargetSchema.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.targets.manage');
      const tenantId = policy.scope.tenantId;
      if (input.targetType === 'team') {
        const team = await tx.team.findFirst({ where: { id: input.scopeId, tenantId, isActive: true }, select: { id: true } });
        if (!team) throw new NotFoundException('TARGET_TEAM_NOT_FOUND');
      } else {
        const membership = await tx.tenantMembership.findFirst({ where: { id: input.scopeId, tenantId, status: 'ACTIVE' }, select: { id: true } });
        if (!membership) throw new NotFoundException('TARGET_EXECUTIVE_NOT_FOUND');
      }
      const scope = input.targetType === 'team' ? { teamId: input.scopeId, membershipId: null } : { teamId: null, membershipId: input.scopeId };
      const existing = await tx.salesTarget.findFirst({ where: { tenantId, period: input.period, metric: input.metric, ...scope }, select: { id: true } });
      const data = {
        title: input.title, targetValue: new Prisma.Decimal(input.targetValue), thresholdPct: new Prisma.Decimal(input.thresholdPct),
      };
      const target = existing
        ? await tx.salesTarget.update({ where: { id: existing.id }, data: { ...data, revision: { increment: 1 } } })
        : await tx.salesTarget.create({ data: { tenantId, createdByMembershipId: policy.scope.membershipId, period: input.period, metric: input.metric, ...scope, ...data } });
      return { id: target.id, period: target.period, metric: target.metric, targetValue: Number(target.targetValue), revision: target.revision };
    });
  }

  private localPeriod(date: Date, timezone: string) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit' }).formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
    return `${value('year')}-${value('month')}`;
  }
}
