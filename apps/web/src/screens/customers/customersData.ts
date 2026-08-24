export interface CustomerItem {
  id: string;
  customerCode: string;
  name: string;
  businessName: string;
  mobile: string;
  email: string;
  avatar?: string;
  status: 'Active' | 'Expired' | 'Cancelled' | 'Trial';
  planName: 'Starter Plan' | 'Growth Plan' | 'Pro Plan' | 'Enterprise Plan';
  billingCycle: 'Monthly' | 'Yearly';
  mrr: number;
  totalPaid: number;
  convertedById: string;
  convertedByName: string;
  convertedByRole: string;
  convertedByAvatar?: string;
  convertedOn: string;
  nextRenewalDate: string;
  daysLeft: number;
  autoRenew: boolean;
  gstin?: string;
  paymentMethod: 'Razorpay (UPI)' | 'Credit Card' | 'Net Banking' | 'Bank Transfer';
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  planName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  paymentMethod: string;
  pdfUrl?: string;
}

export interface RenewalReminder {
  id: string;
  name: string;
  triggerDate: string;
  channel: ('Email' | 'SMS' | 'WhatsApp')[];
  status: 'Scheduled' | 'Sent' | 'Failed';
  sentOn?: string;
  remarks: string;
}

export const MOCK_CUSTOMERS: CustomerItem[] = [
  {
    id: 'cust-1',
    customerCode: 'CUST-000124',
    name: 'Rahul Kumar',
    businessName: 'Rahul Enterprises',
    mobile: '+91 98765 43210',
    email: 'rahul.kumar@rahulenterprises.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'Active',
    planName: 'Pro Plan',
    billingCycle: 'Monthly',
    mrr: 2999,
    totalPaid: 8997,
    convertedById: 'exec-1',
    convertedByName: 'Amit Verma',
    convertedByRole: 'Sales Manager • West Zone',
    convertedByAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    convertedOn: '2025-05-22 10:24 AM',
    nextRenewalDate: '2025-06-22',
    daysLeft: 31,
    autoRenew: true,
    gstin: '27ABCDE1234F1Z5',
    paymentMethod: 'Razorpay (UPI)',
  },
  {
    id: 'cust-2',
    customerCode: 'CUST-000125',
    name: 'Neha Patel',
    businessName: 'Patel Traders',
    mobile: '+91 96548 76543',
    email: 'neha.patel@pateltraders.in',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'Active',
    planName: 'Growth Plan',
    billingCycle: 'Monthly',
    mrr: 4999,
    totalPaid: 14997,
    convertedById: 'exec-2',
    convertedByName: 'Neha Patel',
    convertedByRole: 'Team Leader • North Zone',
    convertedByAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    convertedOn: '2025-05-22 10:18 AM',
    nextRenewalDate: '2025-06-22',
    daysLeft: 31,
    autoRenew: true,
    gstin: '07AAACP1234E1Z1',
    paymentMethod: 'Razorpay (UPI)',
  },
  {
    id: 'cust-3',
    customerCode: 'CUST-000126',
    name: 'Aman Singh',
    businessName: 'Singh & Sons Hardware',
    mobile: '+91 98765 44333',
    email: 'aman.singh@singhsons.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'Trial',
    planName: 'Starter Plan',
    billingCycle: 'Monthly',
    mrr: 0,
    totalPaid: 0,
    convertedById: 'exec-3',
    convertedByName: 'Ravi Singh',
    convertedByRole: 'Senior Executive • HQ',
    convertedByAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    convertedOn: '2025-05-22 10:15 AM',
    nextRenewalDate: '2025-05-29',
    daysLeft: 7,
    autoRenew: false,
    paymentMethod: 'Razorpay (UPI)',
  },
  {
    id: 'cust-4',
    customerCode: 'CUST-000127',
    name: 'Pooja Khanna',
    businessName: 'Khanna Boutique',
    mobile: '+91 98213 56789',
    email: 'pooja.k@khannaboutique.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    status: 'Active',
    planName: 'Pro Plan',
    billingCycle: 'Monthly',
    mrr: 2999,
    totalPaid: 17994,
    convertedById: 'exec-4',
    convertedByName: 'Sneha Iyer',
    convertedByRole: 'Executive • South Zone',
    convertedByAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    convertedOn: '2025-05-22 09:58 AM',
    nextRenewalDate: '2025-06-23',
    daysLeft: 32,
    autoRenew: true,
    gstin: '27AAAFK4321A1Z9',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'cust-5',
    customerCode: 'CUST-000128',
    name: 'Mohd. Danish',
    businessName: 'Danish Furniture World',
    mobile: '+91 88987 65432',
    email: 'danish.furniture@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    status: 'Expired',
    planName: 'Starter Plan',
    billingCycle: 'Monthly',
    mrr: 1999,
    totalPaid: 3998,
    convertedById: 'exec-1',
    convertedByName: 'Amit Verma',
    convertedByRole: 'Sales Manager • West Zone',
    convertedByAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    convertedOn: '2025-05-22 09:45 AM',
    nextRenewalDate: '2025-05-10',
    daysLeft: -14,
    autoRenew: false,
    paymentMethod: 'Razorpay (UPI)',
  },
  {
    id: 'cust-6',
    customerCode: 'CUST-000129',
    name: 'Suresh Tiwari',
    businessName: 'Tiwari General Store',
    mobile: '+91 91234 56789',
    email: 'suresh.tiwari@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    status: 'Active',
    planName: 'Growth Plan',
    billingCycle: 'Monthly',
    mrr: 4999,
    totalPaid: 9998,
    convertedById: 'exec-2',
    convertedByName: 'Neha Patel',
    convertedByRole: 'Team Leader • North Zone',
    convertedByAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    convertedOn: '2025-05-21 05:35 PM',
    nextRenewalDate: '2025-06-21',
    daysLeft: 30,
    autoRenew: true,
    gstin: '09AABCT8899K1Z4',
    paymentMethod: 'Razorpay (UPI)',
  },
  {
    id: 'cust-7',
    customerCode: 'CUST-000130',
    name: 'Vikram Bansal',
    businessName: 'Bansal Traders',
    mobile: '+91 99876 54321',
    email: 'bansal.vikram@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'Cancelled',
    planName: 'Pro Plan',
    billingCycle: 'Monthly',
    mrr: 0,
    totalPaid: 5999,
    convertedById: 'exec-3',
    convertedByName: 'Ravi Singh',
    convertedByRole: 'Senior Executive • HQ',
    convertedByAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    convertedOn: '2025-05-21 04:10 PM',
    nextRenewalDate: 'N/A',
    daysLeft: 0,
    autoRenew: false,
    paymentMethod: 'Net Banking',
  },
];

export const MOCK_INVOICES: SubscriptionInvoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-000124-005',
    invoiceDate: '2025-05-22',
    planName: 'Pro Plan (Monthly)',
    amount: 2999,
    status: 'Paid',
    paymentMethod: 'Razorpay (UPI)',
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-000124-004',
    invoiceDate: '2025-04-22',
    planName: 'Pro Plan (Monthly)',
    amount: 2999,
    status: 'Paid',
    paymentMethod: 'Razorpay (UPI)',
  },
  {
    id: 'inv-3',
    invoiceNo: 'INV-000124-003',
    invoiceDate: '2025-03-22',
    planName: 'Pro Plan (Monthly)',
    amount: 2999,
    status: 'Paid',
    paymentMethod: 'Razorpay (UPI)',
  },
  {
    id: 'inv-4',
    invoiceNo: 'INV-000124-002',
    invoiceDate: '2025-02-22',
    planName: 'Pro Plan (Monthly)',
    amount: 2999,
    status: 'Paid',
    paymentMethod: 'Razorpay (UPI)',
  },
  {
    id: 'inv-5',
    invoiceNo: 'INV-000124-001',
    invoiceDate: '2025-01-22',
    planName: 'Pro Plan (Monthly)',
    amount: 2999,
    status: 'Paid',
    paymentMethod: 'Razorpay (UPI)',
  },
];

export const MOCK_RENEWAL_REMINDERS: RenewalReminder[] = [
  {
    id: 'rem-1',
    name: 'First Renewal Reminder (7 Days Before)',
    triggerDate: '2025-06-15',
    channel: ['Email', 'SMS', 'WhatsApp'],
    status: 'Scheduled',
    remarks: 'Will be sent 7 days before renewal date',
  },
  {
    id: 'rem-2',
    name: 'Final Renewal Reminder (1 Day Before)',
    triggerDate: '2025-06-21',
    channel: ['Email', 'SMS', 'WhatsApp'],
    status: 'Scheduled',
    remarks: 'Will be sent 1 day before renewal date',
  },
  {
    id: 'rem-3',
    name: 'Renewal Day Notification',
    triggerDate: '2025-06-22',
    channel: ['Email', 'WhatsApp'],
    status: 'Scheduled',
    remarks: 'Sent on renewal day after auto-charge attempt',
  },
];
