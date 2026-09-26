import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmRepository } from './crm.repository';
import { parseFollowUpSchedule } from './follow-up-schedule';
import { assignTeamLeaderSchema, assignTeamMembersSchema, createTeamSchema, teamWorkspaceQuery, updateTeamSchema } from './team-contract';

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
          department: true,
          region: true,
          teamType: true,
          dealAssignment: true,
          visibility: true,
          isActive: true,
          leaderMembership: {
            select: {
              id: true, employeeCode: true,
              user: { select: { fullName: true, employeeCode: true, avatarUrl: true } },
            },
          },
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
        const fallbackLeader = team.tenantMemberships.find((membership) =>
          membership.tenantRole?.code === 'team_leader' || membership.user.role === 'TEAM_LEADER');
        const leader = team.leaderMembership ?? fallbackLeader;
        const departments = team.tenantMemberships.flatMap((membership) => membership.department ? [membership.department] : []);
        const department = team.department || departments.sort((left, right) =>
          departments.filter((value) => value === right).length - departments.filter((value) => value === left).length)[0] || 'Not assigned';
        const regions = [...(regionByTeam.get(team.id) ?? new Set<string>())].sort();
        const totals = targetByTeam.get(team.id) ?? { target: 0, achieved: 0 };
        const achievedPercent = totals.target > 0 ? Math.round((totals.achieved / totals.target) * 1000) / 10 : 0;
        return {
          id: team.id,
          name: team.name,
          code: team.code,
          region: team.region || (regions.length > 1 ? `${regions[0]} +${regions.length - 1}` : regions[0]) || 'Not assigned',
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

  async options(actor: RequestPrincipal) {
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require('crm.teams.view');
      const tenantId = policy.scope.tenantId;
      const [memberships, territories] = await Promise.all([
        tx.tenantMembership.findMany({
          where: {
            tenantId,
            status: 'ACTIVE',
            OR: [
              { tenantRole: { code: { in: ['field_executive', 'sales_manager', 'team_leader'] } } },
              { user: { role: { in: ['FIELD_EXECUTIVE', 'SALES_MANAGER', 'TEAM_LEADER'] } } },
            ],
          },
          orderBy: { user: { fullName: 'asc' } },
          select: {
            id: true, employeeCode: true, designation: true, department: true, teamId: true,
            team: { select: { name: true } },
            user: { select: { fullName: true, employeeCode: true, avatarUrl: true, role: true } },
          },
        }),
        tx.territory.findMany({
          where: { tenantId, deletedAt: null, status: 'ACTIVE' },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, regionArea: true, city: true, state: true },
        }),
      ]);
      return {
        candidates: memberships.map((membership) => ({
          id: membership.id,
          name: membership.user.fullName,
          employeeCode: membership.employeeCode ?? membership.user.employeeCode,
          avatarUrl: membership.user.avatarUrl,
          designation: membership.designation ?? this.roleLabel(membership.user.role),
          department: membership.department ?? 'Sales',
          teamId: membership.teamId,
          teamName: membership.team?.name ?? null,
        })),
        regions: territories.map((territory) => ({
          id: territory.id,
          name: territory.regionArea ?? territory.city ?? territory.state ?? territory.name,
        })).filter((region, index, rows) => rows.findIndex((candidate) => candidate.name === region.name) === index),
      };
    });
  }

  async targetsOverview(actor: RequestPrincipal, query: unknown) {
    const q = teamWorkspaceQuery.parse(query);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require('crm.targets.view');
      const tenantId = policy.scope.tenantId;
      const period = q.period ?? await this.currentPeriod(tx, tenantId);
      const settings = await tx.tenantSettings.findUnique({ where: { tenantId }, select: { timezone: true } });
      const timezone = settings?.timezone ?? 'Asia/Kolkata';
      const start = parseFollowUpSchedule(`${period}-01`, '12:00 AM', timezone);
      const end = parseFollowUpSchedule(`${nextMonthKey(period)}-01`, '12:00 AM', timezone);
      const teams = await tx.team.findMany({
        where: { tenantId }, orderBy: { name: 'asc' },
        select: {
          id: true, name: true, code: true,
          leaderMembership: { select: { user: { select: { fullName: true } } } },
          tenantMemberships: { where: { status: 'ACTIVE' }, select: { id: true } },
        },
      });
      const teamIds = teams.map((team) => team.id);
      const [targets, opportunities, leads] = teamIds.length ? await Promise.all([
        tx.salesTarget.findMany({ where: { tenantId, period, teamId: { in: teamIds } }, select: { teamId: true, metric: true, targetValue: true } }),
        tx.opportunity.findMany({ where: { tenantId, deletedAt: null, createdAt: { gte: start, lt: end }, OR: [{ assignedMembership: { teamId: { in: teamIds } } }, { assignedMembershipId: null, ownerMembership: { teamId: { in: teamIds } } }] }, select: { stage: true, amount: true, assignedMembership: { select: { teamId: true } }, ownerMembership: { select: { teamId: true } } } }),
        tx.lead.findMany({ where: { tenantId, deletedAt: null, createdAt: { gte: start, lt: end }, OR: [{ assignedMembership: { teamId: { in: teamIds } } }, { assignedMembershipId: null, ownerMembership: { teamId: { in: teamIds } } }] }, select: { assignedMembership: { select: { teamId: true } }, ownerMembership: { select: { teamId: true } } } }),
      ]) : [[], [], []];
      const metric = (teamId: string, name: string) => Number(targets.find((target) => target.teamId === teamId && target.metric === name)?.targetValue ?? 0);
      const percent = (actual: number, target: number) => target > 0 ? Math.round((actual / target) * 1000) / 10 : 0;
      return {
        period,
        teams: teams.map((team) => {
          const deals = opportunities.filter((opportunity) => (opportunity.assignedMembership?.teamId ?? opportunity.ownerMembership.teamId) === team.id);
          const won = deals.filter((opportunity) => opportunity.stage.toLowerCase() === 'won');
          const leadCount = leads.filter((lead) => (lead.assignedMembership?.teamId ?? lead.ownerMembership.teamId) === team.id).length;
          const revenueAchieved = won.reduce((sum, opportunity) => sum + Number(opportunity.amount), 0);
          const revenueTarget = metric(team.id, 'sales_amount');
          const dealsTarget = metric(team.id, 'deals_count');
          const leadsTarget = metric(team.id, 'leads_count');
          const winTarget = metric(team.id, 'win_rate');
          const winAchieved = deals.length ? Math.round((won.length / deals.length) * 1000) / 10 : 0;
          const scores = [percent(revenueAchieved, revenueTarget), percent(won.length, dealsTarget), percent(leadCount, leadsTarget), percent(winAchieved, winTarget)].filter((score, index) => [revenueTarget, dealsTarget, leadsTarget, winTarget][index] > 0);
          return {
            id: team.id, name: team.name, code: team.code, leaderName: team.leaderMembership?.user.fullName ?? 'Not assigned', memberCount: team.tenantMemberships.length,
            revenueTarget, revenueAchieved, revenuePercent: percent(revenueAchieved, revenueTarget),
            dealsTarget, dealsAchieved: won.length, dealsPercent: percent(won.length, dealsTarget),
            leadsTarget, leadsAchieved: leadCount, leadsPercent: percent(leadCount, leadsTarget),
            winTarget, winAchieved, overallPercent: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
          };
        }),
      };
    });
  }

  async create(actor: RequestPrincipal, body: unknown) {
    const input = createTeamSchema.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.teams.create');
      const tenantId = policy.scope.tenantId;
      const code = input.code?.toUpperCase() ?? await this.generateCode(tx, input.name);
      if (await tx.team.findFirst({ where: { code }, select: { id: true } })) {
        throw new ConflictException('CRM_TEAM_CODE_EXISTS');
      }
      if (input.leaderMembershipId) await this.ensureAssignableMembership(tx, tenantId, input.leaderMembershipId);
      const team = await tx.team.create({
        data: {
          tenantId, name: input.name, code, description: input.description,
          department: input.department, region: input.region, teamType: input.teamType,
          dealAssignment: input.dealAssignment, visibility: input.visibility,
          isActive: input.status === 'Active', leaderMembershipId: input.leaderMembershipId,
        },
        select: { id: true, name: true, code: true },
      });
      if (input.leaderMembershipId) {
        await tx.tenantMembership.update({ where: { id: input.leaderMembershipId }, data: { teamId: team.id } });
      }
      if (input.monthlyTarget > 0) {
        const period = await this.currentPeriod(tx, tenantId);
        await tx.salesTarget.create({
          data: {
            tenantId, teamId: team.id, membershipId: null, createdByMembershipId: policy.scope.membershipId,
            title: `${team.name} monthly revenue`, period, metric: 'sales_amount',
            targetValue: new Prisma.Decimal(input.monthlyTarget), thresholdPct: new Prisma.Decimal(80),
          },
        });
      }
      await this.repo.audit(tx, policy, 'team.created', 'Team', team.id, { changedFields: ['name', 'code'] });
      return team;
    });
  }

  async update(actor: RequestPrincipal, teamId: string, body: unknown) {
    const input = updateTeamSchema.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.teams.update');
      const tenantId = policy.scope.tenantId;
      await this.ensureTeam(tx, tenantId, teamId);
      if (input.code) {
        const duplicate = await tx.team.findFirst({ where: { code: input.code.toUpperCase(), id: { not: teamId } }, select: { id: true } });
        if (duplicate) throw new ConflictException('CRM_TEAM_CODE_EXISTS');
      }
      if (input.leaderMembershipId) await this.ensureAssignableMembership(tx, tenantId, input.leaderMembershipId);
      const updated = await tx.team.update({
        where: { id: teamId },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.code !== undefined ? { code: input.code.toUpperCase() } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.department !== undefined ? { department: input.department } : {}),
          ...(input.region !== undefined ? { region: input.region } : {}),
          ...(input.teamType !== undefined ? { teamType: input.teamType } : {}),
          ...(input.dealAssignment !== undefined ? { dealAssignment: input.dealAssignment } : {}),
          ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
          ...(input.status !== undefined ? { isActive: input.status === 'Active' } : {}),
          ...(input.leaderMembershipId !== undefined ? { leaderMembershipId: input.leaderMembershipId } : {}),
        },
        select: { id: true, name: true, code: true },
      });
      if (input.leaderMembershipId) await tx.tenantMembership.update({ where: { id: input.leaderMembershipId }, data: { teamId } });
      if (input.monthlyTarget !== undefined && input.monthlyTarget > 0) {
        const period = await this.currentPeriod(tx, tenantId);
        const existing = await tx.salesTarget.findFirst({ where: { tenantId, teamId, period, metric: 'sales_amount' }, select: { id: true } });
        const targetData = { title: `${updated.name} monthly revenue`, targetValue: new Prisma.Decimal(input.monthlyTarget) };
        if (existing) await tx.salesTarget.update({ where: { id: existing.id }, data: { ...targetData, revision: { increment: 1 } } });
        else await tx.salesTarget.create({ data: { ...targetData, tenantId, teamId, membershipId: null, period, metric: 'sales_amount', thresholdPct: new Prisma.Decimal(80), createdByMembershipId: policy.scope.membershipId } });
      }
      await this.repo.audit(tx, policy, 'team.updated', 'Team', teamId, { changedFields: Object.keys(input) });
      return updated;
    });
  }

  async assignLeader(actor: RequestPrincipal, teamId: string, body: unknown) {
    const input = assignTeamLeaderSchema.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.teams.assign');
      const tenantId = policy.scope.tenantId;
      const team = await this.ensureTeam(tx, tenantId, teamId);
      if (input.membershipId) await this.ensureAssignableMembership(tx, tenantId, input.membershipId);
      await tx.team.update({ where: { id: teamId }, data: { leaderMembershipId: input.membershipId } });
      if (input.membershipId) await tx.tenantMembership.update({ where: { id: input.membershipId }, data: { teamId } });
      await this.repo.audit(tx, policy, 'team.leader.changed', 'Team', teamId, { assignedBefore: team.leaderMembershipId, assignedAfter: input.membershipId });
      return { teamId, leaderMembershipId: input.membershipId };
    });
  }

  async assignMembers(actor: RequestPrincipal, teamId: string, body: unknown) {
    const input = assignTeamMembersSchema.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.teams.assign');
      const tenantId = policy.scope.tenantId;
      await this.ensureTeam(tx, tenantId, teamId);
      const count = await tx.tenantMembership.count({ where: { id: { in: input.membershipIds }, tenantId, status: 'ACTIVE' } });
      if (count !== input.membershipIds.length) throw new UnprocessableEntityException('CRM_TEAM_MEMBER_INVALID');
      await tx.tenantMembership.updateMany({
        where: { id: { in: input.membershipIds }, tenantId },
        data: { teamId, ...(input.designation ? { designation: input.designation } : {}) },
      });
      await this.repo.audit(tx, policy, 'team.members.assigned', 'Team', teamId, { changedFields: input.membershipIds });
      return { teamId, assigned: input.membershipIds.length };
    });
  }

  async removeMember(actor: RequestPrincipal, teamId: string, membershipId: string) {
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.teams.assign');
      const tenantId = policy.scope.tenantId;
      const team = await this.ensureTeam(tx, tenantId, teamId);
      const membership = await tx.tenantMembership.findFirst({ where: { id: membershipId, tenantId, teamId }, select: { id: true } });
      if (!membership) throw new NotFoundException('CRM_TEAM_MEMBER_NOT_FOUND');
      await tx.tenantMembership.update({ where: { id: membershipId }, data: { teamId: null } });
      if (team.leaderMembershipId === membershipId) await tx.team.update({ where: { id: teamId }, data: { leaderMembershipId: null } });
      await this.repo.audit(tx, policy, 'team.member.removed', 'Team', teamId, { changedFields: [membershipId] });
      return { teamId, membershipId };
    });
  }

  async workspace(actor: RequestPrincipal, teamId: string, query: unknown) {
    const q = teamWorkspaceQuery.parse(query);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require('crm.teams.view');
      const tenantId = policy.scope.tenantId;
      const period = q.period ?? await this.currentPeriod(tx, tenantId);
      const timezoneRow = await tx.tenantSettings.findUnique({ where: { tenantId }, select: { timezone: true } });
      const timezone = timezoneRow?.timezone ?? 'Asia/Kolkata';
      const start = parseFollowUpSchedule(`${period}-01`, '12:00 AM', timezone);
      const end = parseFollowUpSchedule(`${nextMonthKey(period)}-01`, '12:00 AM', timezone);
      const team = await tx.team.findFirst({
        where: { id: teamId, tenantId },
        select: {
          id: true, name: true, code: true, description: true, department: true, region: true,
          teamType: true, dealAssignment: true, visibility: true, isActive: true, createdAt: true, updatedAt: true,
          leaderMembershipId: true,
          leaderMembership: { select: { id: true, employeeCode: true, user: { select: { fullName: true, employeeCode: true, avatarUrl: true } } } },
          tenantMemberships: {
            orderBy: { user: { fullName: 'asc' } },
            select: {
              id: true, employeeCode: true, designation: true, department: true, status: true, joinedAt: true, createdAt: true,
              tenantRole: { select: { code: true } },
              user: { select: { fullName: true, employeeCode: true, avatarUrl: true, role: true } },
              territoryMemberships: { take: 1, select: { territory: { select: { name: true, regionArea: true, city: true } } } },
            },
          },
        },
      });
      if (!team) throw new NotFoundException('CRM_TEAM_NOT_FOUND');
      const membershipIds = team.tenantMemberships.map((member) => member.id);
      const [targets, leads, opportunities, visits, demos, communications, candidates] = await Promise.all([
        tx.salesTarget.findMany({ where: { tenantId, period, OR: [{ teamId }, { membershipId: { in: membershipIds } }] }, select: { id: true, teamId: true, membershipId: true, title: true, metric: true, targetValue: true, thresholdPct: true } }),
        tx.lead.findMany({ where: { tenantId, deletedAt: null, createdAt: { gte: start, lt: end }, OR: [{ assignedMembership: { teamId } }, { assignedMembershipId: null, ownerMembership: { teamId } }] }, select: { id: true, createdAt: true, assignedMembershipId: true, ownerMembershipId: true, sourceValue: { select: { name: true } } } }),
        tx.opportunity.findMany({ where: { tenantId, deletedAt: null, createdAt: { gte: start, lt: end }, OR: [{ assignedMembership: { teamId } }, { assignedMembershipId: null, ownerMembership: { teamId } }] }, select: { id: true, amount: true, stage: true, createdAt: true, closedAt: true, assignedMembershipId: true, ownerMembershipId: true, sourceValue: { select: { name: true } } } }),
        tx.leadVisit.findMany({ where: { tenantId, checkInTime: { gte: start, lt: end }, executiveMembershipId: { in: membershipIds } }, select: { executiveMembershipId: true, status: true } }),
        tx.leadDemo.findMany({ where: { tenantId, demoDate: { gte: `${period}-01`, lt: `${nextMonthKey(period)}-01` }, conductedByMembershipId: { in: membershipIds } }, select: { conductedByMembershipId: true, status: true } }),
        tx.leadCommunication.findMany({ where: { tenantId, timestamp: { gte: start, lt: end }, loggedByMembershipId: { in: membershipIds }, channel: { equals: 'Call', mode: 'insensitive' } }, select: { loggedByMembershipId: true } }),
        tx.tenantMembership.findMany({ where: { tenantId, status: 'ACTIVE', teamId: null, OR: [{ tenantRole: { code: { in: ['field_executive', 'sales_manager', 'team_leader'] } } }, { user: { role: { in: ['FIELD_EXECUTIVE', 'SALES_MANAGER', 'TEAM_LEADER'] } } }] }, orderBy: { user: { fullName: 'asc' } }, select: { id: true, employeeCode: true, designation: true, user: { select: { fullName: true, employeeCode: true, avatarUrl: true, role: true } } } }),
      ]);
      const ownerId = <T extends { assignedMembershipId: string | null; ownerMembershipId: string }>(row: T) => row.assignedMembershipId ?? row.ownerMembershipId;
      const isWon = (stage: string) => stage.toLowerCase() === 'won';
      const teamTargets = targets.filter((target) => target.teamId === teamId);
      const metricActual = (metric: string, membershipId?: string) => {
        if (metric === 'sales_amount') return opportunities.filter((row) => isWon(row.stage) && (!membershipId || ownerId(row) === membershipId)).reduce((sum, row) => sum + Number(row.amount), 0);
        if (metric === 'deals_count') return opportunities.filter((row) => isWon(row.stage) && (!membershipId || ownerId(row) === membershipId)).length;
        if (metric === 'leads_count') return leads.filter((row) => !membershipId || ownerId(row) === membershipId).length;
        if (metric === 'win_rate') {
          const scoped = opportunities.filter((row) => !membershipId || ownerId(row) === membershipId);
          return scoped.length ? Math.round((scoped.filter((row) => isWon(row.stage)).length / scoped.length) * 1000) / 10 : 0;
        }
        if (metric === 'average_deal_value') {
          const won = opportunities.filter((row) => isWon(row.stage) && (!membershipId || ownerId(row) === membershipId));
          return won.length ? won.reduce((sum, row) => sum + Number(row.amount), 0) / won.length : 0;
        }
        if (metric === 'calls_count') return communications.filter((row) => !membershipId || row.loggedByMembershipId === membershipId).length;
        if (metric === 'meetings_count') return visits.filter((row) => row.status.toUpperCase() === 'COMPLETED' && (!membershipId || row.executiveMembershipId === membershipId)).length;
        if (metric === 'visits_count') return visits.filter((row) => row.status.toUpperCase() === 'COMPLETED' && (!membershipId || row.executiveMembershipId === membershipId)).length;
        if (metric === 'demos_count') return demos.filter((row) => row.status.toUpperCase() === 'COMPLETED' && (!membershipId || row.conductedByMembershipId === membershipId)).length;
        return 0;
      };
      const targetDtos = teamTargets.map((target) => {
        const targetValue = Number(target.targetValue);
        const achieved = metricActual(target.metric);
        const percent = targetValue > 0 ? Math.round((achieved / targetValue) * 1000) / 10 : 0;
        return { id: target.id, title: target.title, metric: target.metric, targetValue, achieved, percent, thresholdPct: Number(target.thresholdPct), status: percent >= 100 ? 'Achieved' : percent >= Number(target.thresholdPct) ? 'On Track' : 'Behind' };
      });
      const members = team.tenantMemberships.map((member) => {
        const memberTargets = targets.filter((target) => target.membershipId === member.id);
        const revenueTarget = Number(memberTargets.find((target) => target.metric === 'sales_amount')?.targetValue ?? 0);
        const dealsTarget = Number(memberTargets.find((target) => target.metric === 'deals_count')?.targetValue ?? 0);
        const revenue = metricActual('sales_amount', member.id);
        const memberLeads = leads.filter((lead) => ownerId(lead) === member.id).length;
        const memberDeals = opportunities.filter((deal) => ownerId(deal) === member.id);
        const dealsWon = memberDeals.filter((deal) => isWon(deal.stage)).length;
        return {
          id: member.id, name: member.user.fullName, employeeCode: member.employeeCode ?? member.user.employeeCode,
          avatarUrl: member.user.avatarUrl, designation: member.designation ?? this.roleLabel(member.user.role),
          roleCode: member.tenantRole?.code ?? member.user.role.toLowerCase(), status: member.status === 'ACTIVE' ? 'Active' : 'Inactive',
          joinedAt: member.joinedAt ?? member.createdAt,
          location: member.territoryMemberships[0]?.territory.regionArea ?? member.territoryMemberships[0]?.territory.city ?? member.territoryMemberships[0]?.territory.name ?? team.region ?? 'Not assigned',
          totalLeads: memberLeads, dealsCreated: memberDeals.length, dealsWon, dealsTarget, revenue, target: revenueTarget,
          achievementPercent: revenueTarget > 0 ? Math.round((revenue / revenueTarget) * 1000) / 10 : 0,
          winRate: memberDeals.length ? Math.round((dealsWon / memberDeals.length) * 1000) / 10 : 0,
          averageDeal: dealsWon ? Math.round(revenue / dealsWon) : 0,
        };
      });
      const revenueTarget = Number(teamTargets.find((target) => target.metric === 'sales_amount')?.targetValue ?? 0);
      const revenue = metricActual('sales_amount');
      const manager = team.tenantMemberships.find((member) => member.tenantRole?.code === 'sales_manager' || member.user.role === 'SALES_MANAGER');
      const sourceMap = new Map<string, number>();
      const leadSourceMap = new Map<string, number>();
      opportunities.filter((deal) => isWon(deal.stage)).forEach((deal) => sourceMap.set(deal.sourceValue?.name ?? 'Unspecified', (sourceMap.get(deal.sourceValue?.name ?? 'Unspecified') ?? 0) + Number(deal.amount)));
      leads.forEach((lead) => leadSourceMap.set(lead.sourceValue?.name ?? 'Unspecified', (leadSourceMap.get(lead.sourceValue?.name ?? 'Unspecified') ?? 0) + 1));
      const dayRevenue = new Map<string, number>();
      const dayDeals = new Map<string, number>();
      opportunities.filter((deal) => isWon(deal.stage)).forEach((deal) => {
        const day = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, month: 'short', day: '2-digit' }).format(deal.closedAt ?? deal.createdAt);
        dayRevenue.set(day, (dayRevenue.get(day) ?? 0) + Number(deal.amount));
        dayDeals.set(day, (dayDeals.get(day) ?? 0) + 1);
      });
      const newLeadsCount = leads.length;
      const contactedCount = opportunities.length || Math.min(newLeadsCount, Math.round(newLeadsCount * 0.7));
      const qualifiedCount = opportunities.filter((deal) => ['qualified', 'proposal', 'negotiation', 'won'].includes(deal.stage.toLowerCase())).length;
      const proposalCount = opportunities.filter((deal) => ['proposal', 'negotiation', 'won'].includes(deal.stage.toLowerCase())).length;
      const negotiationCount = opportunities.filter((deal) => ['negotiation', 'won'].includes(deal.stage.toLowerCase())).length;
      const wonCount = opportunities.filter((deal) => isWon(deal.stage)).length;
      const totalFunnelBase = Math.max(newLeadsCount, 1);
      const pctStr = (count: number) => `${Math.round((count / totalFunnelBase) * 100)}%`;
      const dealFunnel = [
        { stage: 'New Leads', count: newLeadsCount, pct: '100%', color: 'bg-slate-900' },
        { stage: 'Contacted', count: contactedCount, pct: pctStr(contactedCount), color: 'bg-blue-600' },
        { stage: 'Qualified', count: qualifiedCount, pct: pctStr(qualifiedCount), color: 'bg-teal-600' },
        { stage: 'Proposal', count: proposalCount, pct: pctStr(proposalCount), color: 'bg-amber-500' },
        { stage: 'Negotiation', count: negotiationCount, pct: pctStr(negotiationCount), color: 'bg-purple-600' },
        { stage: 'Closed Won', count: wonCount, pct: pctStr(wonCount), color: 'bg-emerald-600' },
      ];
      return {
        period,
        team: { ...team, status: team.isActive ? 'Active' : 'Inactive' },
        leader: team.leaderMembership ? { id: team.leaderMembership.id, name: team.leaderMembership.user.fullName, employeeCode: team.leaderMembership.employeeCode ?? team.leaderMembership.user.employeeCode, avatarUrl: team.leaderMembership.user.avatarUrl } : null,
        manager: manager ? { id: manager.id, name: manager.user.fullName, employeeCode: manager.employeeCode ?? manager.user.employeeCode, designation: manager.designation ?? 'Sales Manager', avatarUrl: manager.user.avatarUrl } : null,
        members,
        candidates: candidates.map((candidate) => ({ id: candidate.id, name: candidate.user.fullName, employeeCode: candidate.employeeCode ?? candidate.user.employeeCode, avatarUrl: candidate.user.avatarUrl, designation: candidate.designation ?? this.roleLabel(candidate.user.role) })),
        targets: targetDtos,
        summary: {
          totalMembers: members.length, activeMembers: members.filter((member) => member.status === 'Active').length,
          inactiveMembers: members.filter((member) => member.status === 'Inactive').length,
          newThisMonth: members.filter((member) => new Date(member.joinedAt) >= start && new Date(member.joinedAt) < end).length,
          totalLeads: leads.length, dealsCreated: opportunities.length, dealsWon: opportunities.filter((deal) => isWon(deal.stage)).length,
          revenue, revenueTarget, achievementPercent: revenueTarget > 0 ? Math.round((revenue / revenueTarget) * 1000) / 10 : 0,
          visitsCompleted: visits.filter((visit) => visit.status.toUpperCase() === 'COMPLETED').length,
          demosCompleted: demos.filter((demo) => demo.status.toUpperCase() === 'COMPLETED').length,
        },
        salesTrend: [...dayRevenue].map(([date, sales]) => ({ date, sales, revenue: sales, deals: dayDeals.get(date) ?? 0, target: revenueTarget })).sort((left, right) => left.date.localeCompare(right.date)),
        sourceRevenue: [...sourceMap].map(([name, value]) => ({ name, value })).sort((left, right) => right.value - left.value),
        leadSources: [...leadSourceMap].map(([name, count]) => ({ name, count })).sort((left, right) => right.count - left.count),
        dealFunnel,
      };
    });
  }

  private async currentPeriod(tx: Prisma.TransactionClient, tenantId: string) {
    const settings = await tx.tenantSettings.findUnique({ where: { tenantId }, select: { timezone: true } });
    return localMonth(new Date(), settings?.timezone ?? 'Asia/Kolkata');
  }

  private async ensureTeam(tx: Prisma.TransactionClient, tenantId: string, teamId: string) {
    const team = await tx.team.findFirst({ where: { id: teamId, tenantId }, select: { id: true, leaderMembershipId: true } });
    if (!team) throw new NotFoundException('CRM_TEAM_NOT_FOUND');
    return team;
  }

  private async ensureAssignableMembership(tx: Prisma.TransactionClient, tenantId: string, membershipId: string) {
    const membership = await tx.tenantMembership.findFirst({ where: { id: membershipId, tenantId, status: 'ACTIVE' }, select: { id: true } });
    if (!membership) throw new UnprocessableEntityException('CRM_TEAM_MEMBER_INVALID');
    return membership;
  }

  private async generateCode(tx: Prisma.TransactionClient, name: string) {
    const stem = name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 12) || 'TEAM';
    for (let suffix = 1; suffix <= 9999; suffix += 1) {
      const code = `${stem}-${String(suffix).padStart(3, '0')}`;
      if (!await tx.team.findFirst({ where: { code }, select: { id: true } })) return code;
    }
    throw new ConflictException('CRM_TEAM_CODE_EXHAUSTED');
  }

  private roleLabel(role: string) {
    return role.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }
}
