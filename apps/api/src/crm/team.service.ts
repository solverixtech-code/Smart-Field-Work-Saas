import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmRepository } from './crm.repository';
import { parseFollowUpSchedule } from './follow-up-schedule';

const teamDirectoryQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(10),
  search: z.string().trim().max(100).optional().default(''),
  region: z.string().trim().max(100).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
}).strict();

function localMonth(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}`;
}

function nextMonthKey(period: string) {
  const [year, month] = period.split('-').map(Number);
  const next = new Date(Date.UTC(year, month, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;
}

function previousMonthKey(period: string) {
  const [year, month] = period.split('-').map(Number);
  const previous = new Date(Date.UTC(year, month - 2, 1));
  return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, '0')}`;
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

@Injectable()
export class TeamService {
  constructor(private readonly repo: CrmRepository) {}

  async list(actor: RequestPrincipal, query: unknown) {
    const q = teamDirectoryQuery.parse(query);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require('crm.teams.view');
      const tenantId = policy.scope.tenantId;
      const settings = await tx.tenantSettings.findUnique({
        where: { tenantId },
        select: { timezone: true },
      });
      const timezone = settings?.timezone ?? 'Asia/Kolkata';
      const period = localMonth(new Date(), timezone);
      const previousPeriod = previousMonthKey(period);
      const nextPeriod = nextMonthKey(period);
      const currentStart = parseFollowUpSchedule(`${period}-01`, '12:00 AM', timezone);
      const previousStart = parseFollowUpSchedule(`${previousPeriod}-01`, '12:00 AM', timezone);
      const nextStart = parseFollowUpSchedule(`${nextPeriod}-01`, '12:00 AM', timezone);

      const teams = await tx.team.findMany({
        where: { tenantId },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          isActive: true,
          tenantMemberships: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              employeeCode: true,
              department: true,
              tenantRole: { select: { code: true } },
              user: {
                select: {
                  fullName: true,
                  employeeCode: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          },
        },
      });
      const teamIds = teams.map((team) => team.id);

      const [territories, deals] = teamIds.length
        ? await Promise.all([
            tx.territory.findMany({
              where: {
                tenantId,
                deletedAt: null,
                status: 'ACTIVE',
                members: { some: { membership: { teamId: { in: teamIds }, status: 'ACTIVE' } } },
              },
              select: {
                name: true,
                city: true,
                regionArea: true,
                state: true,
                members: {
                  where: { membership: { teamId: { in: teamIds }, status: 'ACTIVE' } },
                  select: { membership: { select: { teamId: true } } },
                },
                targets: {
                  where: { period },
                  take: 1,
                  select: { monthlyTarget: true, monthlyAchieved: true },
                },
              },
            }),
            tx.opportunity.findMany({
              where: {
                tenantId,
                deletedAt: null,
                createdAt: { gte: previousStart, lt: nextStart },
                OR: [
                  { assignedMembership: { teamId: { in: teamIds } } },
                  { assignedMembershipId: null, ownerMembership: { teamId: { in: teamIds } } },
                ],
              },
              select: {
                createdAt: true,
                assignedMembership: { select: { teamId: true } },
                ownerMembership: { select: { teamId: true } },
              },
            }),
          ])
        : [[], []];

      const regionByTeam = new Map<string, Set<string>>();
      const targetByTeam = new Map<string, { target: number; achieved: number }>();
      territories.forEach((territory) => {
        const region = territory.regionArea ?? territory.city ?? territory.state ?? territory.name;
        const teamIdsForTerritory = new Set(territory.members.flatMap((member) => member.membership.teamId ? [member.membership.teamId] : []));
        teamIdsForTerritory.forEach((teamId) => {
          const regions = regionByTeam.get(teamId) ?? new Set<string>();
          regions.add(region);
          regionByTeam.set(teamId, regions);
          const totals = targetByTeam.get(teamId) ?? { target: 0, achieved: 0 };
          const target = territory.targets[0];
          totals.target += Number(target?.monthlyTarget ?? 0);
          totals.achieved += Number(target?.monthlyAchieved ?? 0);
          targetByTeam.set(teamId, totals);
        });
      });

      const currentDealsByTeam = new Map<string, number>();
      let currentDeals = 0;
      let previousDeals = 0;
      deals.forEach((deal) => {
        const isCurrent = deal.createdAt >= currentStart;
        if (isCurrent) currentDeals += 1;
        else previousDeals += 1;
        const teamId = deal.assignedMembership?.teamId ?? deal.ownerMembership.teamId;
        if (isCurrent && teamId) currentDealsByTeam.set(teamId, (currentDealsByTeam.get(teamId) ?? 0) + 1);
      });

      const items = teams.map((team) => {
        const leader = team.tenantMemberships.find((membership) =>
          membership.tenantRole?.code === 'team_leader' || membership.user.role === 'TEAM_LEADER');
        const departments = team.tenantMemberships.flatMap((membership) => membership.department ? [membership.department] : []);
        const department = departments.sort((left, right) =>
          departments.filter((value) => value === right).length - departments.filter((value) => value === left).length)[0] ?? 'Not assigned';
        const regions = [...(regionByTeam.get(team.id) ?? new Set<string>())].sort();
        const totals = targetByTeam.get(team.id) ?? { target: 0, achieved: 0 };
        const achievedPercent = totals.target > 0 ? Math.round((totals.achieved / totals.target) * 1000) / 10 : 0;
        return {
          id: team.id,
          name: team.name,
          code: team.code,
          region: regions.length > 1 ? `${regions[0]} +${regions.length - 1}` : regions[0] ?? 'Not assigned',
          leaderName: leader?.user.fullName ?? 'Not assigned',
          leaderCode: leader?.employeeCode ?? leader?.user.employeeCode ?? null,
          leaderAvatarUrl: leader?.user.avatarUrl ?? null,
          memberCount: team.tenantMemberships.length,
          department,
          monthlyTarget: totals.target,
          achievedAmount: totals.achieved,
          achievedPercent,
          dealsThisMonth: currentDealsByTeam.get(team.id) ?? 0,
          status: team.isActive ? 'Active' : 'Inactive',
        };
      });

      const normalizedSearch = q.search.toLocaleLowerCase();
      const filtered = items.filter((team) => {
        const matchesSearch = !normalizedSearch || [team.name, team.code, team.region, team.leaderName]
          .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
        return matchesSearch && (!q.region || team.region === q.region) && (!q.status || team.status === q.status);
      });
      const activeTeams = items.filter((team) => team.status === 'Active').length;
      const totalMembers = items.reduce((sum, team) => sum + team.memberCount, 0);
      const distribution = [...new Set(items.map((team) => team.region))]
        .map((region) => ({ region, value: items.filter((team) => team.region === region).length }))
        .sort((left, right) => right.value - left.value || left.region.localeCompare(right.region));
      const topPerformers = [...items]
        .filter((team) => team.monthlyTarget > 0)
        .sort((left, right) => right.achievedPercent - left.achievedPercent || right.achievedAmount - left.achievedAmount)
        .slice(0, 5)
        .map(({ id, name, monthlyTarget, achievedAmount, achievedPercent }) => ({ id, name, monthlyTarget, achievedAmount, achievedPercent }));
      const start = (q.page - 1) * q.limit;

      return {
        items: filtered.slice(start, start + q.limit),
        total: filtered.length,
        page: q.page,
        limit: q.limit,
        totalPages: Math.ceil(filtered.length / q.limit),
        regions: [...new Set(items.map((team) => team.region))].sort(),
        summary: {
          totalTeams: items.length,
          totalMembers,
          activeTeams,
          averageTeamSize: items.length ? Math.round((totalMembers / items.length) * 10) / 10 : 0,
          currentDeals,
          dealChangePercent: percentageChange(currentDeals, previousDeals),
        },
        distribution,
        topPerformers,
      };
    });
  }
}
