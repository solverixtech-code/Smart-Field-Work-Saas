import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  ChevronLeft,
  Search,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Clock,
  Key,
  ShieldAlert,
  Plus,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Trash2,
  Check,
  X,
  Lock,
  Smartphone,
  Eye,
  Edit2,
  Send,
  Building2,
  Sliders,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';

interface UserMembership {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  joinedOn: string;
  lastActive: string;
  twoFactorEnabled: boolean;
  activeSessionsCount: number;
}

interface PlatformAccessMember {
  id: string;
  platformUserName: string;
  platformEmail: string;
  platformRole: 'Platform Operations Admin' | 'Platform Support' | 'Platform Auditor';
  accessType: 'Temporary Audit' | 'Incident Investigation' | 'Onboarding Assistance';
  reason: string;
  grantedBy: string;
  grantedOn: string;
  expiresOn: string;
  lastAccess: string;
  lastActive: string;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Revoked';
}

interface PendingInvitation {
  id: string;
  inviteeName: string;
  email: string;
  role: string;
  department: string;
  invitedBy: string;
  invitedOn: string;
  expiresOn: string;
  status: 'Pending' | 'Sent' | 'Expiring Soon' | 'Expired';
}

interface AccessRequest {
  id: string;
  requestedBy: string;
  email: string;
  requestType: 'Workspace Access' | 'Role Upgrade' | 'Support Elevation';
  requestedRole: string;
  reason: string;
  requestedOn: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export function TenantUsersPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all-users';
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Mock Tenant Memberships
  const [memberships, setMemberships] = useState<UserMembership[]>([
    { id: 'usr_1', name: 'Rahul Sharma', email: 'rahul.sharma@sunrisehealthcare.com', role: 'Tenant Owner', department: 'Management', status: 'Active', joinedOn: '12 Jan 2025', lastActive: '2 mins ago', twoFactorEnabled: true, activeSessionsCount: 2 },
    { id: 'usr_2', name: 'Priya Verma', email: 'priya.v@sunrisehealthcare.com', role: 'Sales Manager', department: 'West Zone', status: 'Active', joinedOn: '15 Jan 2025', lastActive: '15 mins ago', twoFactorEnabled: true, activeSessionsCount: 1 },
    { id: 'usr_3', name: 'Amit Patel', email: 'amit.p@sunrisehealthcare.com', role: 'Field Executive', department: 'Mumbai City', status: 'Active', joinedOn: '01 Feb 2025', lastActive: '1 hour ago', twoFactorEnabled: false, activeSessionsCount: 1 },
    { id: 'usr_4', name: 'Neha Joshi', email: 'neha.j@sunrisehealthcare.com', role: 'Field Executive', department: 'Pune Zone', status: 'Active', joinedOn: '10 Feb 2025', lastActive: '3 hours ago', twoFactorEnabled: false, activeSessionsCount: 1 },
  ]);

  // Mock Platform Managed Access Personnel (SFW Internal)
  const [platformPersonnel, setPlatformPersonnel] = useState<PlatformAccessMember[]>([
    { id: 'p_1', platformUserName: 'Sahibjit Singh', platformEmail: 'sahib@smartfieldwork.com', platformRole: 'Platform Operations Admin', accessType: 'Onboarding Assistance', reason: 'Tenant SLA setup & WhatsApp integration configuration', grantedBy: 'Rahul Sharma (Tenant Owner)', grantedOn: '20 May 2026', expiresOn: '03 Jun 2026', lastAccess: 'Yesterday', lastActive: 'Yesterday', status: 'Active' },
    { id: 'p_2', platformUserName: 'Ananya Roy', platformEmail: 'ananya.r@smartfieldwork.com', platformRole: 'Platform Support', accessType: 'Incident Investigation', reason: 'Resolving Tally ERP sync failure log #INC-4402', grantedBy: 'Platform Auto-Policy', grantedOn: '26 May 2026', expiresOn: '28 May 2026', lastAccess: '4 hours ago', lastActive: '4 hours ago', status: 'Expiring Soon' },
  ]);

  // Mock Pending Invitations
  const [invitations, setInvitations] = useState<PendingInvitation[]>([
    { id: 'inv_1', inviteeName: 'Karan Mehra', email: 'karan.m@sunrisehealthcare.com', role: 'Team Leader', department: 'North Zone', invitedBy: 'Rahul Sharma', invitedOn: '25 May 2026', expiresOn: '01 Jun 2026', status: 'Sent' },
    { id: 'inv_2', inviteeName: 'Siddharth Rao', email: 'siddharth.r@sunrisehealthcare.com', role: 'Field Executive', department: 'Goa Region', invitedBy: 'Priya Verma', invitedOn: '26 May 2026', expiresOn: '02 Jun 2026', status: 'Pending' },
  ]);

  // Mock Suspended Users
  const [suspendedUsers, setSuspendedUsers] = useState([
    { id: 'susp_1', name: 'Vikram Rane', email: 'vikram.r@sunrisehealthcare.com', previousRole: 'Field Executive', suspendedOn: '18 May 2026', suspendedBy: 'Priya Verma', reason: 'Policy violation: Unverified GPS check-ins', lastLogin: '17 May 2026' },
  ]);

  // Mock Access Requests
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([
    { id: 'req_1', requestedBy: 'Sneha Deshmukh', email: 'sneha.d@sunrisehealthcare.com', requestType: 'Role Upgrade', requestedRole: 'Sales Manager', reason: 'Promoted to West Zone regional lead', requestedOn: '26 May 2026', status: 'Pending' },
  ]);

  const revokePlatformAccess = (id: string) => {
    setPlatformPersonnel((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Revoked' } : p))
    );
    toast.success('Platform personnel access revoked successfully');
  };

  const handleApproveRequest = (id: string) => {
    setAccessRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    toast.success('Access request approved');
    setSelectedRequest(null);
  };

  const handleRejectRequest = (id: string) => {
    setAccessRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    toast.success('Access request rejected');
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/platform/tenants/${tenantId}`)}
              className="text-xs font-bold text-slate-500 hover:text-[#0D1F3D] flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Tenant
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-extrabold text-[#0D1F3D]">Users & Access</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#0D1F3D] mt-1">Tenant User Memberships</h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage user seats, platform support access, pending invitations, and access permissions for <strong className="text-slate-800">{tenantId || 'apex-pharma'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="accent" size="sm" onClick={() => setShowInviteModal(true)} className="gap-2 font-bold shadow-xs">
            <Plus className="h-4 w-4" /> Invite User
          </Button>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-6 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setTab('all-users')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'all-users'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Users ({memberships.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('platform-access')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'platform-access'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-purple-600" /> Platform Managed Access ({platformPersonnel.filter((p) => p.status !== 'Revoked').length})
          </button>
          <button
            type="button"
            onClick={() => setTab('pending-invitations')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'pending-invitations'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pending Invitations ({invitations.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('suspended-users')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'suspended-users'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Suspended Users ({suspendedUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('access-requests')}
            className={`pb-3 text-xs font-extrabold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'access-requests'
                ? 'border-[#0D1F3D] text-[#0D1F3D]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Access Requests ({accessRequests.filter((r) => r.status === 'Pending').length})
          </button>
        </div>

        {/* Search */}
        <div className="w-56 pb-2 shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search personnel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-3 text-xs font-semibold bg-[#F8FAFC] border border-slate-200 rounded-sm focus:outline-none focus:border-[#0D1F3D]"
            />
          </div>
        </div>
      </div>

      {/* TAB A: ALL USERS */}
      {activeTab === 'all-users' && (
        <div className="space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-extrabold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role & Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined On</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">2FA</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberships
                  .filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-extrabold text-slate-700 text-xs">
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#0D1F3D]">{user.name}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">{user.role}</span>
                        <span className="text-[11px] text-slate-400 block font-medium">{user.department}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex rounded-sm bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{user.joinedOn}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{user.lastActive}</td>
                      <td className="py-3.5 px-4">
                        {user.twoFactorEnabled ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]"><Check className="h-3 w-3" /> Enabled</span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[10px]">Off</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => toast.info(`Managing ${user.name}`)} className="h-7 px-2 text-[11px]">
                          Edit Role
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB B: PLATFORM MANAGED ACCESS (INTERNAL SFW PERSONNEL) */}
      {activeTab === 'platform-access' && (
        <div className="space-y-4">
          <div className="rounded-sm bg-purple-50 p-4 border border-purple-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Shield className="h-4 w-4 text-purple-600 shrink-0" />
              <div>
                <p className="font-extrabold text-purple-950">Internal Smart Field Work Platform Support Personnel</p>
                <p className="text-[11px] text-purple-900 font-medium mt-0.5">
                  These internal support & operations admins have time-bound authorized access to this tenant. They do <strong>NOT</strong> count toward tenant license seats.
                </p>
              </div>
            </div>
            <span className="font-extrabold text-purple-700 bg-purple-100 px-3 py-1 rounded-sm">Audited Support Access</span>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-extrabold">
                  <th className="py-3 px-4">Platform Personnel</th>
                  <th className="py-3 px-4">Platform Role</th>
                  <th className="py-3 px-4">Access Reason</th>
                  <th className="py-3 px-4">Granted By / On</th>
                  <th className="py-3 px-4">Expires On</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {platformPersonnel.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-100 text-purple-800 font-extrabold text-xs border border-purple-200">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-[#0D1F3D]">{p.platformUserName}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{p.platformEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{p.platformRole}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">{p.accessType}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 font-medium">{p.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 block">{p.grantedBy}</span>
                      <span className="text-[10px] text-slate-400">{p.grantedOn}</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-700">{p.expiresOn}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold border ${
                        p.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : p.status === 'Expiring Soon'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => toast.success('Access extended by 7 days')} className="h-7 px-2 text-[11px]">
                        Extend Access
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => revokePlatformAccess(p.id)} className="h-7 px-2 text-[11px] text-rose-600 hover:bg-rose-50 border-rose-200">
                        Revoke Access
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB C: PENDING INVITATIONS */}
      {activeTab === 'pending-invitations' && (
        <div className="space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-extrabold">
                  <th className="py-3 px-4">Invitee</th>
                  <th className="py-3 px-4">Intended Role</th>
                  <th className="py-3 px-4">Invited By</th>
                  <th className="py-3 px-4">Invited On</th>
                  <th className="py-3 px-4">Expires On</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-[#0D1F3D]">{inv.inviteeName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{inv.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{inv.role}</span>
                      <span className="text-[10px] text-slate-400 block">{inv.department}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{inv.invitedBy}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">{inv.invitedOn}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">{inv.expiresOn}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex rounded-sm bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => toast.success(`Invitation resent to ${inv.email}`)} className="h-7 px-2 text-[11px]">
                        Resend
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast.success('Link copied to clipboard')} className="h-7 px-2 text-[11px]">
                        Copy Link
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB D: SUSPENDED USERS */}
      {activeTab === 'suspended-users' && (
        <div className="space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-extrabold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Previous Role</th>
                  <th className="py-3 px-4">Suspended On / By</th>
                  <th className="py-3 px-4">Suspension Reason</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suspendedUsers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-[#0D1F3D]">{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{s.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{s.previousRole}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 block">{s.suspendedOn}</span>
                      <span className="text-[10px] text-slate-400">By: {s.suspendedBy}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium max-w-xs truncate">{s.reason}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => toast.success(`Reactivated membership for ${s.name}`)} className="h-7 px-2.5 text-[11px] text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                        Reactivate Membership
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB E: ACCESS REQUESTS */}
      {activeTab === 'access-requests' && (
        <div className="space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-extrabold">
                  <th className="py-3 px-4">Requested By</th>
                  <th className="py-3 px-4">Request Type</th>
                  <th className="py-3 px-4">Requested Role</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Requested On</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accessRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-[#0D1F3D]">{req.requestedBy}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{req.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{req.requestType}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700">{req.requestedRole}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium max-w-xs truncate">{req.reason}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">{req.requestedOn}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold border ${
                        req.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {req.status === 'Pending' && (
                        <>
                          <Button variant="accent" size="sm" onClick={() => setSelectedRequest(req)} className="h-7 px-2.5 text-[11px]">
                            Review Request
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Invite User to Tenant Workspace</h3>
              <button type="button" onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            </div>
            <div className="space-y-3">
              <Input label="Full Name *" placeholder="Enter full name" />
              <Input label="Email Address *" type="email" placeholder="user@company.com" />
              <Select label="Role *" value="Field Executive" onChange={() => {}} searchable={true} options={[{ value: 'Field Executive', label: 'Field Executive' }, { value: 'Sales Manager', label: 'Sales Manager' }, { value: 'Team Leader', label: 'Team Leader' }]} />
              <Select label="Department / Zone *" value="West Zone" onChange={() => {}} searchable={true} options={[{ value: 'West Zone', label: 'West Zone' }, { value: 'East Zone', label: 'East Zone' }, { value: 'North Zone', label: 'North Zone' }]} />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button variant="accent" size="sm" onClick={() => { toast.success('Invitation sent'); setShowInviteModal(false); }}>Send Invitation</Button>
            </div>
          </div>
        </div>
      )}

      {/* Access Request Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Review Access Request</h3>
              <button type="button" onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            </div>
            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-sm border border-slate-100">
              <p><strong>User:</strong> {selectedRequest.requestedBy} ({selectedRequest.email})</p>
              <p><strong>Requested Role:</strong> {selectedRequest.requestedRole}</p>
              <p><strong>Reason:</strong> {selectedRequest.reason}</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" size="sm" onClick={() => handleRejectRequest(selectedRequest.id)} className="text-rose-600 hover:bg-rose-50 border-rose-200">Reject Request</Button>
              <Button variant="accent" size="sm" onClick={() => handleApproveRequest(selectedRequest.id)}>Approve Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
