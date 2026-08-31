import { TenantMember, PlatformTenantAccess, TenantAccessRequest } from '../types/membership.types';
import { tenantService } from './tenant.service';

export interface ITenantMembershipService {
  getMembers(tenantId: string): Promise<TenantMember[]>;
  inviteMember(tenantId: string, input: { name: string; email: string; role: string; department: string }): Promise<TenantMember>;
  updateMember(tenantId: string, memberId: string, updates: Partial<TenantMember>): Promise<TenantMember>;
  suspendMember(tenantId: string, memberId: string): Promise<TenantMember>;
  reactivateMember(tenantId: string, memberId: string): Promise<TenantMember>;
  resendInvitation(tenantId: string, memberId: string): Promise<void>;
  revokeInvitation(tenantId: string, memberId: string): Promise<void>;
  getPlatformAccess(tenantId: string): Promise<PlatformTenantAccess[]>;
  getAccessRequests(tenantId: string): Promise<TenantAccessRequest[]>;
}

class FixtureTenantMembershipService implements ITenantMembershipService {
  private members: TenantMember[] = [
    {
      id: 'mem_apex_1',
      tenantId: 't_apex_pharma',
      name: 'Vikramaditya Sharma',
      email: 'admin@apexpharma.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Tenant Owner',
      department: 'Executive Management',
      status: 'Active',
      joinedOn: '12 Jan 2025',
      lastActive: '5 minutes ago',
      twoFactor: true,
      sessions: 2,
      isOwner: true,
    },
    {
      id: 'mem_apex_2',
      tenantId: 't_apex_pharma',
      name: 'Priya Mehta',
      email: 'priya.mehta@apexpharma.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Tenant Admin',
      department: 'Operations',
      status: 'Active',
      joinedOn: '14 Jan 2025',
      lastActive: '25 minutes ago',
      twoFactor: true,
      sessions: 1,
    },
    {
      id: 'mem_apex_3',
      tenantId: 't_apex_pharma',
      name: 'Sandeep Patel',
      email: 'sandeep.patel@apexpharma.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Field Operations Lead',
      department: 'Field Operations',
      status: 'Active',
      joinedOn: '20 Jan 2025',
      lastActive: '2 hours ago',
      twoFactor: false,
      sessions: 1,
    },
    {
      id: 'mem_apex_4',
      tenantId: 't_apex_pharma',
      name: 'Karan Malhotra',
      email: 'karan.m@apexpharma.com',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Field Executive',
      department: 'Field Operations',
      status: 'Invited',
      joinedOn: '25 May 2026',
      lastActive: '—',
      twoFactor: false,
      sessions: 0,
    },
    {
      id: 'mem_apex_5',
      tenantId: 't_apex_pharma',
      name: 'Rohit Verma',
      email: 'rohit.verma@apexpharma.com',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      roleLabel: 'Support Specialist',
      department: 'Customer Support',
      status: 'Suspended',
      joinedOn: '23 Jan 2025',
      lastActive: '8 days ago',
      twoFactor: false,
      sessions: 0,
    },
  ];

  private platformAccess: PlatformTenantAccess[] = [
    {
      id: 'pa_1',
      tenantId: 't_apex_pharma',
      name: 'Amit Sharma',
      email: 'amit.sharma@smartfieldwork.com',
      roleLabel: 'Platform Super Admin',
      department: 'Platform Operations',
      status: 'Active',
      grantedOn: '12 Jan 2025',
    },
    {
      id: 'pa_2',
      tenantId: 't_apex_pharma',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@smartfieldwork.com',
      roleLabel: 'Platform Support Lead',
      department: 'Platform Support',
      status: 'Active',
      grantedOn: '15 Feb 2025',
    },
    {
      id: 'pa_3',
      tenantId: 't_apex_pharma',
      name: 'Rakesh Iyer',
      email: 'rakesh.iyer@smartfieldwork.com',
      roleLabel: 'Platform Auditor',
      department: 'Compliance',
      status: 'Active',
      grantedOn: '01 Mar 2025',
    },
  ];

  private accessRequests: TenantAccessRequest[] = [
    {
      id: 'ar_1',
      tenantId: 't_apex_pharma',
      name: 'Neha Kapoor',
      email: 'neha.kapoor@apexpharma.com',
      requestedRole: 'Team Leader',
      requestedOn: '28 May 2026',
      status: 'Pending',
    },
  ];

  async getMembers(tenantId: string): Promise<TenantMember[]> {
    const tenantMembers = this.members.filter((m) => m.tenantId === tenantId);

    // If tenant has no members yet, automatically create Tenant Owner from tenant.adminUser
    if (tenantMembers.length === 0) {
      const tenant = await tenantService.getTenantById(tenantId);
      if (tenant) {
        const ownerMember: TenantMember = {
          id: `mem_${tenant.id}_owner`,
          tenantId: tenant.id,
          name: tenant.adminUser.fullName || 'Tenant Admin',
          email: tenant.adminUser.email || `admin@${tenant.slug}.com`,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          roleLabel: 'Tenant Owner',
          department: 'Executive Management',
          status: 'Active',
          joinedOn: tenant.createdAt.split(' ·')[0],
          lastActive: 'Just now',
          twoFactor: true,
          sessions: 1,
          isOwner: true,
        };
        this.members.push(ownerMember);
        return [ownerMember];
      }
    }

    return Promise.resolve(tenantMembers);
  }

  async inviteMember(
    tenantId: string,
    input: { name: string; email: string; role: string; department: string }
  ): Promise<TenantMember> {
    const newMember: TenantMember = {
      id: `mem_${Date.now()}`,
      tenantId,
      name: input.name,
      email: input.email,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      roleLabel: input.role,
      department: input.department,
      status: 'Invited',
      joinedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastActive: '—',
      twoFactor: false,
      sessions: 0,
    };

    this.members.push(newMember);
    return Promise.resolve(newMember);
  }

  async updateMember(tenantId: string, memberId: string, updates: Partial<TenantMember>): Promise<TenantMember> {
    const member = this.members.find((m) => m.tenantId === tenantId && m.id === memberId);
    if (!member) throw new Error('Member not found');
    Object.assign(member, updates);
    return Promise.resolve({ ...member });
  }

  async suspendMember(tenantId: string, memberId: string): Promise<TenantMember> {
    return this.updateMember(tenantId, memberId, { status: 'Suspended' });
  }

  async reactivateMember(tenantId: string, memberId: string): Promise<TenantMember> {
    return this.updateMember(tenantId, memberId, { status: 'Active' });
  }

  async resendInvitation(tenantId: string, memberId: string): Promise<void> {
    const member = this.members.find((m) => m.tenantId === tenantId && m.id === memberId);
    if (!member) throw new Error('Member not found');
    return Promise.resolve();
  }

  async revokeInvitation(tenantId: string, memberId: string): Promise<void> {
    const idx = this.members.findIndex((m) => m.tenantId === tenantId && m.id === memberId);
    if (idx !== -1) {
      this.members.splice(idx, 1);
    }
    return Promise.resolve();
  }

  async getPlatformAccess(tenantId: string): Promise<PlatformTenantAccess[]> {
    return Promise.resolve(this.platformAccess.filter((pa) => pa.tenantId === tenantId || pa.tenantId === 't_apex_pharma'));
  }

  async getAccessRequests(tenantId: string): Promise<TenantAccessRequest[]> {
    return Promise.resolve(this.accessRequests.filter((ar) => ar.tenantId === tenantId || ar.tenantId === 't_apex_pharma'));
  }
}

export const tenantMembershipService: ITenantMembershipService = new FixtureTenantMembershipService();
