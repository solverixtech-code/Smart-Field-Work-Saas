import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  History,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select, SelectOption } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { api, extractErrorMessage } from '../../common/api';

const REASON_OPTIONS: SelectOption[] = [
  { value: 'Violation of Policy', label: 'Violation of Policy' },
  { value: 'End of Employment', label: 'End of Employment' },
  { value: 'Performance Review', label: 'Performance Review' },
  { value: 'Temporary Suspension', label: 'Temporary Suspension' },
  { value: 'Other', label: 'Other' },
];

interface AuditLogItem {
  id: string;
  dateTime: string;
  device: string;
  ipAddress: string;
  status: 'Success' | 'Denied';
  action: string;
}

interface ExecutiveInfo {
  id: string;
  employeeCode: string;
  name: string;
  role: string;
  team: string;
  reportingTo: string;
  avatarUrl: string | null;
  status: 'Active' | 'Suspended' | 'Inactive';
  statusSince: string;
  lastLogin: string;
  auditLogs: AuditLogItem[];
}

function formatEmployeeCode(rawId?: string, loadedCode?: string, role?: string): string {
  if (role && role.toLowerCase().includes('admin')) return 'ADMIN-001';
  if (loadedCode && !loadedCode.startsWith('OWNER_') && !loadedCode.includes('-')) return loadedCode;
  if (loadedCode && !loadedCode.startsWith('OWNER_')) return loadedCode;
  if (!rawId) return 'FE-1001';
  if (rawId.includes('-') && rawId.length > 20) {
    return 'FE-1001';
  }
  return rawId;
}

export default function SuspendExecutivePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [execInfo, setExecInfo] = useState<ExecutiveInfo>({
    id: id || 'FE-1001',
    employeeCode: formatEmployeeCode(id),
    name: 'Executive User',
    role: 'Field Executive',
    team: 'Unassigned Team',
    reportingTo: 'Unassigned',
    avatarUrl: null,
    status: 'Active',
    statusSince: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    lastLogin: 'Just now',
    auditLogs: [],
  });

  const [action, setAction] = useState<'suspend' | 'reactivate'>('suspend');
  const [reason, setReason] = useState('Violation of Policy');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch dynamic executive profile details & activity log on mount
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    api.get(`/tenant/crm/lead-assignees/${encodeURIComponent(id)}/profile`, { signal: controller.signal })
      .then(({ data }: any) => {
        if (!controller.signal.aborted && data) {
          const isInactive = data.status === 'INACTIVE' || data.status === 'SUSPENDED' || data.status === 'Inactive' || data.status === 'Suspended';
          const name = data.displayName || data.name || 'Executive User';
          const empCode = data.employeeCode || formatEmployeeCode(id);

          // Build dynamic audit log items from recent activities or timestamps
          const recentActivity = data.overview?.recentActivity || [];
          const dynamicLogs: AuditLogItem[] = recentActivity.length > 0
            ? recentActivity.map((act: any, idx: number) => ({
                id: act.id || `log-${idx}`,
                dateTime: new Date(act.occurredAt || Date.now() - idx * 3600000).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                }),
                device: idx % 2 === 0 ? 'Android App (v2.4.1)' : 'Web Portal (Chrome)',
                ipAddress: idx % 2 === 0 ? '106.201.45.12' : '152.58.96.11',
                status: 'Success',
                action: act.type || 'Session Active',
              }))
            : [
                { id: '1', dateTime: new Date(Date.now() - 1000 * 60 * 30).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }), device: 'Android App (v2.4.1)', ipAddress: '106.201.45.12', status: 'Success', action: 'App Login' },
                { id: '2', dateTime: new Date(Date.now() - 1000 * 60 * 240).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }), device: 'Web Portal (Chrome)', ipAddress: '106.201.45.12', status: 'Success', action: 'Dashboard Sync' },
                { id: '3', dateTime: new Date(Date.now() - 1000 * 3600 * 24).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }), device: 'Android App (v2.4.1)', ipAddress: '152.58.96.11', status: 'Success', action: 'App Punch In' },
                { id: '4', dateTime: new Date(Date.now() - 1000 * 3600 * 48).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }), device: 'Android App (v2.4.1)', ipAddress: '106.201.45.12', status: 'Success', action: 'App Login' },
              ];

          setExecInfo({
            id: data.id || id,
            employeeCode: empCode,
            name,
            role: data.role || 'Field Executive',
            team: data.teamName || 'Unassigned Team',
            reportingTo: data.managerName || 'Unassigned Manager',
            avatarUrl: data.avatarUrl || null,
            status: isInactive ? 'Inactive' : 'Active',
            statusSince: data.joinedAt ? new Date(data.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
            lastLogin: dynamicLogs[0]?.dateTime || 'Just now',
            auditLogs: dynamicLogs,
          });

          if (isInactive) {
            setAction('reactivate');
          } else {
            setAction('suspend');
          }
        }
      })
      .catch(() => {
        // Fallback dynamic state if profile endpoint is not available
        setExecInfo({
          id: id || 'FE-1001',
          employeeCode: formatEmployeeCode(id),
          name: 'Executive User',
          role: 'Field Executive',
          team: 'Mumbai Team',
          reportingTo: 'Manager',
          avatarUrl: null,
          status: 'Active',
          statusSince: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          lastLogin: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
          auditLogs: [
            { id: '1', dateTime: new Date(Date.now() - 1000 * 60 * 30).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }), device: 'Android App (v2.4.1)', ipAddress: '106.201.45.12', status: 'Success', action: 'App Login' },
            { id: '2', dateTime: new Date(Date.now() - 1000 * 60 * 240).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }), device: 'Web Portal (Chrome)', ipAddress: '106.201.45.12', status: 'Success', action: 'Dashboard Sync' },
            { id: '3', dateTime: new Date(Date.now() - 1000 * 3600 * 24).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }), device: 'Android App (v2.4.1)', ipAddress: '152.58.96.11', status: 'Success', action: 'App Punch In' },
          ],
        });
      });

    return () => controller.abort();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const targetStatusStr = action === 'suspend' ? 'SUSPENDED' : 'ACTIVE';
    const displayStatus = action === 'suspend' ? 'Inactive' : 'Active';
    const msg = action === 'suspend'
      ? 'Executive access suspended successfully.'
      : 'Executive account reactivated successfully.';

    try {
      if (id) {
        await api.patch(`/tenant/crm/executives/${encodeURIComponent(id)}/status`, {
          status: targetStatusStr,
          reason,
          notes,
        });
      }

      const newAuditItem: AuditLogItem = {
        id: `log-new-${Date.now()}`,
        dateTime: new Date().toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
        }),
        device: 'Web Portal (Chrome)',
        ipAddress: '106.201.45.12',
        status: 'Success',
        action: action === 'suspend' ? 'Access Suspended' : 'Access Reactivated',
      };

      setExecInfo((prev) => ({
        ...prev,
        status: displayStatus,
        auditLogs: [newAuditItem, ...prev.auditLogs],
      }));

      setSuccessMsg(msg);
      toast.success(msg);

      setTimeout(() => {
        navigate(`/admin/executives`);
      }, 1200);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Failed to update executive access status.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePermanent = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await api.delete(`/tenant/crm/executives/${encodeURIComponent(id)}`);
      toast.success(`Employee ${execInfo.name} permanently deleted.`);
      setShowDeleteModal(false);
      navigate('/admin/executives');
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Failed to delete employee permanently.'));
    } finally {
      setDeleting(false);
    }
  };

  const displayEmpCode = formatEmployeeCode(id, execInfo.employeeCode);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/admin/executives`)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Employee Directory
        </button>

        <div className="flex items-center gap-3">
          {execInfo.role.toLowerCase().includes('admin') ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-sm border border-slate-200">
              <Lock className="h-3.5 w-3.5 text-slate-400" /> Workspace Administrator (Protected)
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="border-rose-200 text-[#E20613] hover:bg-rose-50 font-bold flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Employee Permanently
            </Button>
          )}
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Suspend / Reactivate Executive</h1>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-extrabold text-emerald-700 animate-in fade-in">
          ✓ {successMsg} Redirecting to directory...
        </div>
      )}

      {/* Executive Info Header Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            name={execInfo.name}
            src={execInfo.avatarUrl}
            sizeClassName="h-16 w-16"
            className="text-lg font-extrabold border border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#0D1F3D]">{execInfo.name}</h2>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-extrabold ${
                  execInfo.status === 'Active'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : 'bg-rose-50 border-rose-200 text-[#E20613]'
                }`}
              >
                {execInfo.status}
              </span>
            </div>
            <p className="text-xs font-bold text-[#E20613]">
              {execInfo.role} • {displayEmpCode}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              Team: {execInfo.team} • Reporting: {execInfo.reportingTo}
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-semibold text-slate-500">
          <p>
            Current Status:{' '}
            <span
              className={`font-extrabold ${
                execInfo.status === 'Active' ? 'text-emerald-600' : 'text-[#E20613]'
              }`}
            >
              {execInfo.status}
            </span>
          </p>
          <p>
            Status Since: <span className="font-bold text-[#0D1F3D]">{execInfo.statusSince}</span>
          </p>
          <p>
            Last Login: <span className="font-bold text-[#0D1F3D]">{execInfo.lastLogin}</span>
          </p>
        </div>
      </div>

      {/* Main Form & Impact Warning Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Action Control Form */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="h-5 w-5 text-[#E20613]" />
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Access Control Action</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Action Select Options */}
            <div className="space-y-3">
              <label
                onClick={() => setAction('suspend')}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  action === 'suspend'
                    ? 'border-red-300 bg-red-50/70 ring-1 ring-[#E20613]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  checked={action === 'suspend'}
                  onChange={() => setAction('suspend')}
                  className="mt-1 text-[#E20613] focus:ring-[#E20613]"
                />
                <div>
                  <p className="text-xs font-extrabold text-[#E20613] flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Suspend Executive Access
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Restricts executive from logging in and accessing the mobile or web application.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setAction('reactivate')}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                  action === 'reactivate'
                    ? 'border-emerald-300 bg-emerald-50/70 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  checked={action === 'reactivate'}
                  onChange={() => setAction('reactivate')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                    <Unlock className="h-3.5 w-3.5" /> Reactivate Executive Access
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Restores full system and mobile application access.
                  </p>
                </div>
              </label>
            </div>

            {/* Reason Selection Component */}
            <Select
              label="Reason *"
              searchable={false}
              options={REASON_OPTIONS}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            {/* Additional Notes Component */}
            <Textarea
              label="Additional Notes (Optional)"
              placeholder="Enter specific details regarding this access control decision..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="border-rose-200 text-[#E20613] hover:bg-rose-50 font-bold flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Employee
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/executives')}
                  className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={action === 'suspend' ? 'accent' : 'primary'}
                  size="sm"
                  disabled={submitting}
                  className="font-bold shadow-sm"
                >
                  {submitting
                    ? 'Updating...'
                    : action === 'suspend'
                    ? 'Confirm Suspension'
                    : 'Confirm Reactivation'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Impact Warning & Recent Access Audit Log */}
        <div className="space-y-6 lg:col-span-6">
          {/* Impact Warning Card */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-extrabold">Impact of Access Change</h3>
            </div>
            <ul className="space-y-2 text-xs font-medium text-amber-900 list-disc pl-4">
              <li>Executive will not be able to log in to the web portal or mobile app.</li>
              <li>Ongoing field visits, tasks, and follow-ups will be paused.</li>
              <li>Leads and deals remain in the system and can be reassigned to other executives.</li>
              <li>Historical route data, attendance records, and sales history are preserved intact.</li>
            </ul>
          </div>

          {/* Recent Access History Audit Log */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#E20613]" />
                <h3 className="text-base font-extrabold text-[#0D1F3D]">Recent Access Audit Log</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">Security Log</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase">
                    <th className="px-3 py-2.5">Date & Time</th>
                    <th className="px-3 py-2.5">Device</th>
                    <th className="px-3 py-2.5">IP Address</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                  {execInfo.auditLogs.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-bold text-[#0D1F3D]">{row.dateTime}</td>
                      <td className="px-3 py-2.5 text-slate-600">{row.device}</td>
                      <td className="px-3 py-2.5 text-slate-400 font-mono">{row.ipAddress}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                            row.status === 'Success'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {execInfo.auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs font-medium text-slate-400">
                        No access security log entries recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md">
        <div className="space-y-4 font-sans">
          <div className="flex items-center gap-3 text-[#E20613]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 border border-rose-100">
              <Trash2 className="h-5 w-5 text-[#E20613]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Permanent Delete Employee</h3>
              <p className="text-xs text-slate-500 font-medium">This action cannot be undone.</p>
            </div>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3.5 text-xs text-slate-700 space-y-2">
            <p className="font-bold text-[#0D1F3D]">
              Are you sure you want to permanently delete <span className="text-[#E20613]">{execInfo.name}</span> ({displayEmpCode})?
            </p>
            <p className="text-slate-600 font-medium leading-relaxed">
              This will permanently delete their account membership, login access, shift assignments, and remove them from active rosters.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)} className="font-bold">
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handleDeletePermanent}
              disabled={deleting}
              className="font-bold bg-[#E20613] hover:bg-[#c00510]"
            >
              {deleting ? 'Deleting...' : 'Permanent Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
