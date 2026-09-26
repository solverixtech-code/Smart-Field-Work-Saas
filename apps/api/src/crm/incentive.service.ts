import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmRepository } from './crm.repository';
import { parseFollowUpSchedule } from './follow-up-schedule';
import {
  approveIncentivesSchema,
  calculateIncentivesSchema,
  incentivePeriodSchema,
  incentiveRuleInputSchema,
  incentiveRulesQuerySchema,
  incentiveRuleStatusSchema,
  payoutStatusSchema,
} from './incentive-contract';

const nextPeriod = (period: string) => {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(Date.UTC(year, month, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};
const titleStatus = (status: string) => status.split('_').map((part) => `${part[0]}${part.slice(1).toLowerCase()}`).join(' ');
const payoutStructure = (metric: string, rate: number) => metric.includes('(Amount)')
  ? `₹ ${rate.toLocaleString('en-IN')} for every ₹ 10,000 achieved`
  : `₹ ${rate.toLocaleString('en-IN')} per ${metric.replace(/ \(Count\)$/, '').replace(/^Total /, '')}`;
const applies = (appliesTo: string, member: { designation: string | null; tenantRole: { code: string } | null; user: { role: string } }) => {
  if (appliesTo === 'All Executives') return true;
  const designation = member.designation?.toLowerCase() ?? '';
  const role = member.tenantRole?.code ?? member.user.role.toLowerCase();
  if (appliesTo === 'Field Executives') return role === 'field_executive' || member.user.role === 'FIELD_EXECUTIVE';
  if (appliesTo === 'Telecallers') return designation.includes('telecall');
  return ['sales_manager', 'team_leader'].includes(role) || ['SALES_MANAGER', 'TEAM_LEADER'].includes(member.user.role);
};

@Injectable()
export class IncentiveService {
  constructor(private readonly repo: CrmRepository) {}

  async rules(actor: RequestPrincipal, query: unknown) {
    const q = incentiveRulesQuerySchema.parse(query);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require('crm.incentives.view');
      const tenantId = policy.scope.tenantId;
      const rows = await tx.incentiveRule.findMany({
        where: {
          tenantId,
          ...(q.status ? { status: q.status } : {}),
          ...(q.ruleType ? { ruleType: q.ruleType } : {}),
          ...(q.search ? { OR: [{ name: { contains: q.search, mode: 'insensitive' } }, { metric: { contains: q.search, mode: 'insensitive' } }] } : {}),
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      });
      const counts = await tx.incentiveRule.groupBy({ by: ['status'], where: { tenantId }, _count: { _all: true } });
      const count = (status: string) => counts.find((item) => item.status === status)?._count._all ?? 0;
      return {
        items: rows.map((row) => ({
          id: row.id, ruleName: row.name, ruleType: row.ruleType, appliesTo: row.appliesTo, metric: row.metric,
          payoutRate: Number(row.payoutRate), payoutStructure: payoutStructure(row.metric, Number(row.payoutRate)),
          startDate: row.startDate.toISOString().slice(0, 10), endDate: row.endDate.toISOString().slice(0, 10),
          validityPeriod: `${row.startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })} - ${row.endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}`,
          status: titleStatus(row.status), revision: row.revision,
        })),
        summary: { total: counts.reduce((sum, item) => sum + item._count._all, 0), active: count('ACTIVE'), paused: count('PAUSED'), inactive: count('INACTIVE') },
      };
    });
  }

  async createRule(actor: RequestPrincipal, body: unknown) {
    const input = incentiveRuleInputSchema.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.incentives.manage');
      const row = await tx.incentiveRule.create({ data: {
        tenantId: policy.scope.tenantId, createdByMembershipId: policy.scope.membershipId,
        name: input.name, ruleType: input.ruleType, appliesTo: input.appliesTo, metric: input.metric,
        payoutRate: new Prisma.Decimal(input.payoutRate), startDate: new Date(`${input.startDate}T00:00:00.000Z`), endDate: new Date(`${input.endDate}T23:59:59.999Z`),
      } });
      return { id: row.id, revision: row.revision };
    });
  }

  async updateRule(actor: RequestPrincipal, id: string, body: unknown) {
    const input = incentiveRuleInputSchema.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.incentives.manage');
      const existing = await tx.incentiveRule.findFirst({ where: { id, tenantId: policy.scope.tenantId }, select: { id: true } });
      if (!existing) throw new NotFoundException('INCENTIVE_RULE_NOT_FOUND');
      const row = await tx.incentiveRule.update({ where: { id }, data: {
        name: input.name, ruleType: input.ruleType, appliesTo: input.appliesTo, metric: input.metric,
        payoutRate: new Prisma.Decimal(input.payoutRate), startDate: new Date(`${input.startDate}T00:00:00.000Z`), endDate: new Date(`${input.endDate}T23:59:59.999Z`), revision: { increment: 1 },
      } });
      return { id: row.id, revision: row.revision };
    });
  }

  async updateRuleStatus(actor: RequestPrincipal, id: string, body: unknown) {
    const input = incentiveRuleStatusSchema.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.incentives.manage');
      const result = await tx.incentiveRule.updateMany({ where: { id, tenantId: policy.scope.tenantId }, data: { status: input.status, revision: { increment: 1 } } });
      if (!result.count) throw new NotFoundException('INCENTIVE_RULE_NOT_FOUND');
      return { id, status: input.status };
    });
  }

  async calculate(actor: RequestPrincipal, body: unknown) {
    const input = calculateIncentivesSchema.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.incentives.manage');
      const tenantId = policy.scope.tenantId;
      const settings = await tx.tenantSettings.findUnique({ where: { tenantId }, select: { timezone: true } });
      const timezone = settings?.timezone ?? 'Asia/Kolkata';
      const start = parseFollowUpSchedule(`${input.period}-01`, '12:00 AM', timezone);
      const end = parseFollowUpSchedule(`${nextPeriod(input.period)}-01`, '12:00 AM', timezone);
      const [members, rules, deals, visits, demos, conversions] = await Promise.all([
        tx.tenantMembership.findMany({ where: { tenantId, status: 'ACTIVE', OR: [
          { tenantRole: { code: { in: ['field_executive', 'sales_manager', 'team_leader'] } } },
          { user: { role: { in: ['FIELD_EXECUTIVE', 'SALES_MANAGER', 'TEAM_LEADER'] } } },
        ] }, select: { id: true, designation: true, tenantRole: { select: { code: true } }, user: { select: { role: true } } } }),
        tx.incentiveRule.findMany({ where: { tenantId, status: 'ACTIVE', startDate: { lt: end }, endDate: { gte: start } }, orderBy: { createdAt: 'asc' } }),
        tx.opportunity.findMany({ where: { tenantId, deletedAt: null, stage: { equals: 'won', mode: 'insensitive' }, OR: [{ closedAt: { gte: start, lt: end } }, { closedAt: null, updatedAt: { gte: start, lt: end } }] }, select: { amount: true, assignedMembershipId: true, ownerMembershipId: true } }),
        tx.leadVisit.findMany({ where: { tenantId, status: { equals: 'COMPLETED', mode: 'insensitive' }, checkInTime: { gte: start, lt: end } }, select: { executiveMembershipId: true } }),
        tx.leadDemo.findMany({ where: { tenantId, status: { equals: 'COMPLETED', mode: 'insensitive' }, demoDate: { gte: `${input.period}-01`, lt: `${nextPeriod(input.period)}-01` } }, select: { conductedByMembershipId: true } }),
        tx.lead.findMany({ where: { tenantId, deletedAt: null, convertedAt: { gte: start, lt: end }, convertedByMembershipId: { not: null } }, select: { convertedByMembershipId: true } }),
      ]);
      let calculated = 0;
      for (const member of members) {
        const metrics: Record<string, number> = {
          'Total Sales (Amount)': deals.filter((deal) => (deal.assignedMembershipId ?? deal.ownerMembershipId) === member.id).reduce((sum, deal) => sum + Number(deal.amount), 0),
          'New Customers (Count)': conversions.filter((lead) => lead.convertedByMembershipId === member.id).length,
          'Total Visits (Count)': visits.filter((visit) => visit.executiveMembershipId === member.id).length,
          'Demos (Count)': demos.filter((demo) => demo.conductedByMembershipId === member.id).length,
          'Collections (Amount)': 0,
        };
        const applicableRules = rules.filter((rule) => applies(rule.appliesTo, member));
        const breakdown = { sales: 0, demos: 0, visits: 0, bonus: 0 };
        const ruleSnapshot: Array<{ id: string; name: string; metric: string; payoutRate: number; earned: number }> = [];
        applicableRules.forEach((rule) => {
          const actual = metrics[rule.metric] ?? 0;
          const rate = Number(rule.payoutRate);
          const earned = rule.metric.includes('(Amount)') ? Math.floor(actual / 10000) * rate : actual * rate;
          if (rule.metric === 'Total Sales (Amount)') breakdown.sales += earned;
          else if (rule.metric === 'Demos (Count)') breakdown.demos += earned;
          else if (rule.metric === 'Total Visits (Count)') breakdown.visits += earned;
          else breakdown.bonus += earned;
          ruleSnapshot.push({ id: rule.id, name: rule.name, metric: rule.metric, payoutRate: rate, earned });
        });
        const total = breakdown.sales + breakdown.demos + breakdown.visits + breakdown.bonus;
        const existing = await tx.incentiveCalculation.findUnique({ where: { tenantId_membershipId_period: { tenantId, membershipId: member.id, period: input.period } }, select: { id: true, status: true, payout: { select: { id: true } } } });
        if (existing && ['APPROVED', 'PAID'].includes(existing.status)) continue;
        if (total <= 0) {
          if (existing && !existing.payout) await tx.incentiveCalculation.delete({ where: { id: existing.id } });
          continue;
        }
        const data = {
          salesIncentive: new Prisma.Decimal(breakdown.sales), demoIncentive: new Prisma.Decimal(breakdown.demos),
          visitIncentive: new Prisma.Decimal(breakdown.visits), bonusIncentive: new Prisma.Decimal(breakdown.bonus),
          totalIncentive: new Prisma.Decimal(total), approvedAmount: new Prisma.Decimal(0), status: 'PENDING_APPROVAL',
          ruleSnapshot: ruleSnapshot as Prisma.InputJsonValue, metricSnapshot: metrics as Prisma.InputJsonValue,
        };
        if (existing) await tx.incentiveCalculation.update({ where: { id: existing.id }, data: { ...data, revision: { increment: 1 } } });
        else await tx.incentiveCalculation.create({ data: { tenantId, membershipId: member.id, period: input.period, ...data } });
        calculated += 1;
      }
      return { period: input.period, calculated, activeRules: rules.length };
    });
  }

  async list(actor: RequestPrincipal, query: unknown) {
    const q = incentivePeriodSchema.parse(query);
    return this.repo.run(actor, false, async (tx, policy) => {
      policy.require('crm.incentives.view');
      const tenantId = policy.scope.tenantId;
      const periodStart = new Date(`${q.period}-01T00:00:00.000Z`);
      const periodEnd = new Date(`${nextPeriod(q.period)}-01T00:00:00.000Z`);
      const [rows, activeRules] = await Promise.all([
        tx.incentiveCalculation.findMany({
          where: {
            tenantId, period: q.period, totalIncentive: { gt: 0 },
            ...(q.executiveId ? { OR: [{ membershipId: q.executiveId }, { membership: { employeeCode: q.executiveId } }] } : {}),
            ...(q.search ? { membership: { user: { OR: [{ fullName: { contains: q.search, mode: 'insensitive' } }, { employeeCode: { contains: q.search, mode: 'insensitive' } }] } } } : {}),
          },
          orderBy: { membership: { user: { fullName: 'asc' } } },
          select: {
            id: true, membershipId: true, period: true, salesIncentive: true, demoIncentive: true, visitIncentive: true,
            bonusIncentive: true, totalIncentive: true, approvedAmount: true, status: true,
            membership: { select: { employeeCode: true, team: { select: { id: true, name: true } }, user: { select: { fullName: true, avatarUrl: true, employeeCode: true } } } },
            payout: true,
          },
        }),
        tx.incentiveRule.count({ where: { tenantId, status: 'ACTIVE', startDate: { lt: periodEnd }, endDate: { gte: periodStart } } }),
      ]);
      const calculations = rows.map((row) => ({
        id: row.id, membershipId: row.membershipId, executiveId: row.membership.employeeCode ?? row.membership.user.employeeCode,
        executiveName: row.membership.user.fullName, executiveAvatar: row.membership.user.avatarUrl,
        teamId: row.membership.team?.id ?? null, teamName: row.membership.team?.name ?? 'Not assigned', salesIncentive: Number(row.salesIncentive),
        demoIncentive: Number(row.demoIncentive), visitIncentive: Number(row.visitIncentive), bonusIncentive: Number(row.bonusIncentive),
        totalIncentive: Number(row.totalIncentive), approvedAmount: Number(row.approvedAmount), payoutStatus: titleStatus(row.status), monthPeriod: row.period,
      }));
      const payouts = rows.flatMap((row) => row.payout ? [{
        id: row.payout.id, payoutId: row.payout.payoutCode, executiveName: row.membership.user.fullName,
        executiveAvatar: row.membership.user.avatarUrl, bankAccountOrUpi: row.payout.accountReference ?? 'Not recorded',
        amount: Number(row.payout.amount), payoutDate: (row.payout.payoutDate ?? row.payout.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }),
        paymentMode: row.payout.paymentMode, status: titleStatus(row.payout.status), referenceNo: row.payout.transactionReference ?? 'Pending',
      }] : []);
      const total = calculations.reduce((sum, row) => sum + row.totalIncentive, 0);
      const approved = calculations.filter((row) => ['Approved', 'Paid'].includes(row.payoutStatus)).reduce((sum, row) => sum + row.approvedAmount, 0);
      const pending = calculations.filter((row) => row.payoutStatus === 'Pending Approval').reduce((sum, row) => sum + row.totalIncentive, 0);
      const paid = payouts.filter((row) => row.status === 'Paid').reduce((sum, row) => sum + row.amount, 0);
      return { calculations, payouts, summary: { total, approved, pending, paid, activeEarners: calculations.length, activeRules } };
    });
  }

  async approve(actor: RequestPrincipal, body: unknown) {
    const input = approveIncentivesSchema.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.incentives.approve');
      const tenantId = policy.scope.tenantId;
      const rows = await tx.incentiveCalculation.findMany({ where: { id: { in: input.calculationIds }, tenantId }, select: { id: true, membershipId: true, period: true, totalIncentive: true, status: true, payout: { select: { id: true } } } });
      if (rows.length !== new Set(input.calculationIds).size) throw new NotFoundException('INCENTIVE_CALCULATION_NOT_FOUND');
      const eligible = rows.filter((row) => row.status === 'PENDING_APPROVAL' && Number(row.totalIncentive) > 0);
      if (!eligible.length) throw new ConflictException('NO_PAYABLE_INCENTIVES_SELECTED');
      const existingPayoutCount = await tx.incentivePayout.count({ where: { tenantId, calculation: { period: eligible[0].period } } });
      for (const [index, row] of eligible.entries()) {
        const amount = Number(row.totalIncentive);
        await tx.incentiveCalculation.update({ where: { id: row.id }, data: { status: 'APPROVED', approvedAmount: new Prisma.Decimal(amount), approvedByMembershipId: policy.scope.membershipId, approvedAt: new Date(), revision: { increment: 1 } } });
        if (!row.payout) await tx.incentivePayout.create({ data: {
          tenantId, calculationId: row.id, membershipId: row.membershipId,
          payoutCode: `PAY-${row.period.replace('-', '')}-${String(existingPayoutCount + index + 1).padStart(4, '0')}`,
          amount: new Prisma.Decimal(amount), updatedByMembershipId: policy.scope.membershipId,
        } });
      }
      return { approved: eligible.length };
    });
  }

  async updatePayout(actor: RequestPrincipal, id: string, body: unknown) {
    const input = payoutStatusSchema.parse(body);
    return this.repo.run(actor, true, async (tx, policy) => {
      policy.require('crm.incentives.payout');
      const payout = await tx.incentivePayout.findFirst({ where: { id, tenantId: policy.scope.tenantId }, select: { id: true, calculationId: true } });
      if (!payout) throw new NotFoundException('INCENTIVE_PAYOUT_NOT_FOUND');
      await tx.incentivePayout.update({ where: { id }, data: {
        status: input.status, paymentMode: input.paymentMode, accountReference: input.accountReference,
        transactionReference: input.transactionReference, payoutDate: input.status === 'PAID' ? new Date() : null,
        updatedByMembershipId: policy.scope.membershipId, revision: { increment: 1 },
      } });
      if (input.status === 'PAID') await tx.incentiveCalculation.update({ where: { id: payout.calculationId }, data: { status: 'PAID', revision: { increment: 1 } } });
      return { id, status: input.status };
    });
  }
}
