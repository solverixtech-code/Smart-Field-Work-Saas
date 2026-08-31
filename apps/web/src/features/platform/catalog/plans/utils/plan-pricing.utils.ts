import { Plan, PlanPricing, PlanStatus } from '../types/plan.types';

export function formatCurrency(amount: number | undefined | null, currency = 'INR'): string {
  if (amount === undefined || amount === null) return '—';

  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  } else if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US')}`;
  } else if (currency === 'GBP') {
    return `£${amount.toLocaleString('en-GB')}`;
  } else if (currency === 'EUR') {
    return `€${amount.toLocaleString('de-DE')}`;
  }
  return `${amount}`;
}

export function formatPlanMonthlyPrice(pricing: PlanPricing): string {
  if (pricing.model === 'Custom Contract') {
    return 'Contact Sales';
  }
  if (pricing.model === 'Per User') {
    return pricing.monthlyPerUser ? `${formatCurrency(pricing.monthlyPerUser, pricing.currency)} / user` : '—';
  }
  if (pricing.model === 'Base + Per User') {
    const base = formatCurrency(pricing.monthlyBaseFee, pricing.currency);
    const perUser = formatCurrency(pricing.monthlyPerUser, pricing.currency);
    return `${base} + ${perUser}/user`;
  }
  if (pricing.model === 'Flat Monthly') {
    return pricing.monthlyFlatPrice ? `${formatCurrency(pricing.monthlyFlatPrice, pricing.currency)}` : '—';
  }
  return '—';
}

export function formatPlanAnnualPrice(pricing: PlanPricing): string {
  if (pricing.model === 'Custom Contract') {
    return 'Contact Sales';
  }
  if (!pricing.allowAnnualBilling) {
    return 'Not Available';
  }
  if (pricing.model === 'Per User') {
    return pricing.annualPerUser ? `${formatCurrency(pricing.annualPerUser, pricing.currency)} / user` : '—';
  }
  if (pricing.model === 'Base + Per User') {
    const base = formatCurrency(pricing.annualBaseFee, pricing.currency);
    const perUser = formatCurrency(pricing.annualPerUser, pricing.currency);
    return `${base} + ${perUser}/user`;
  }
  if (pricing.model === 'Flat Monthly') {
    return pricing.annualFlatPrice ? `${formatCurrency(pricing.annualFlatPrice, pricing.currency)}` : '—';
  }
  return '—';
}

export function getPlanStatusBadge(status: PlanStatus) {
  switch (status) {
    case 'Active':
      return {
        label: 'Active',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'Draft':
      return {
        label: 'Draft',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      };
    case 'Archived':
      return {
        label: 'Archived',
        className: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    default:
      return {
        label: status,
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}

export function formatLimit(val: number | undefined | null, suffix = ''): string {
  if (val === undefined || val === null) {
    return 'Unlimited';
  }
  return `${val.toLocaleString('en-IN')}${suffix ? ` ${suffix}` : ''}`;
}
