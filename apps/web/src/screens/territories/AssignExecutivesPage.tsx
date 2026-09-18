import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  Plus,
  Search,
  UserPlus,
  Trash2,
  Phone,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { mockTerritoriesList, mockTerritoryExecutives, TerritoryExecutive } from './territoriesData';
import { crmApi } from '../../features/crm/crm.api';
import type { SelectOption } from '../../components/ui/Select';

export default function AssignExecutivesPage() {
  const { territoryId } = useParams();
  const navigate = useNavigate();

  const territory =
    mockTerritoriesList.find((t) => t.id === territoryId || t.code === territoryId) ||
    mockTerritoriesList[0];

  const [executives, setExecutives] = useState<TerritoryExecutive[]>(mockTerritoryExecutives);
  const [availableMembers, setAvailableMembers] = useState<SelectOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState('');

  const loadMembers = useCallback(async () => {
    if (!territoryId) return;
    try {
      const data = await crmApi.territoryMembers(territoryId);
      if (data && Array.isArray(data)) {
        setExecutives(
          data.map((m: any) => ({
            id: m.id,
            name: m.membership?.user?.fullName || 'Field Executive',
            avatar:
              m.membership?.user?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            role: m.role || m.membership?.tenantRole?.name || 'Sales Executive',
            phone: m.membership?.user?.phone || '+91 98765 00000',
            team: territory.regionArea || 'Territory Field Team',
            visitsCount: 0,
            revenue: 0,
            revenueFormatted: '₹ 0',
            performancePercentage: 0,
            status: 'On Field',
          })),
        );
      }
    } catch {
      // fallback to mock
    }
  }, [territoryId, territory.regionArea]);

  useEffect(() => {
    loadMembers();
    crmApi
      .owners({ limit: 100 })
      .then((res) => {
        if (res && res.items) {
          setAvailableMembers(
            res.items.map((m) => ({
              value: m.id,
              label: m.displayName,
              sublabel: m.role || 'Executive',
            })),
          );
        }
      })
      .catch(() => {});
  }, [loadMembers]);

  const handleUnassign = async (id: string, name: string) => {
    try {
      if (territoryId) {
        await crmApi.unassignTerritoryMember(territoryId, id);
      }
      setExecutives((prev) => prev.filter((e) => e.id !== id));
      toast.success(`Unassigned ${name} from ${territory.name}`);
    } catch (err: any) {
      toast.error('Failed to unassign member');
    }
  };

  const handleAssignNew = async () => {
    if (!selectedMembershipId || !territoryId) return;
    const selectedObj = availableMembers.find((m) => m.value === selectedMembershipId);
    try {
      await crmApi.assignTerritoryMember(territoryId, {
        membershipId: selectedMembershipId,
        role: 'EXECUTIVE',
      });
      toast.success(`Assigned ${selectedObj?.label || 'Executive'} to ${territory.name}`);
      setShowAssignModal(false);
      setSelectedMembershipId('');
      loadMembers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to assign executive');
    }
  };

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <button
            onClick={() => navigate(`/admin/territories/${territory.id}`)}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Territory Details
          </button>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] mt-1">
            Assign Executives – {territory.name}
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Manage field executives assigned to territory ({territory.code})
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setShowAssignModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
        >
          <UserPlus className="h-4 w-4" /> Assign New Executive
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search executive..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          <span className="text-xs font-bold text-slate-500">
            {executives.length} Executives Assigned
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="p-3">Executive</th>
                <th className="p-3">Role</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Team</th>
                <th className="p-3 text-center">Visits Completed</th>
                <th className="p-3 text-right">Revenue Generated</th>
                <th className="p-3 text-center">Performance</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {executives.map((exec) => (
                <tr key={exec.id} className="hover:bg-slate-50/70">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={exec.avatar}
                        alt={exec.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-extrabold text-[#0D1F3D] block">{exec.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{exec.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">{exec.role}</td>
                  <td className="p-3 font-mono text-slate-600">{exec.phone}</td>
                  <td className="p-3 text-slate-600">{exec.team}</td>
                  <td className="p-3 text-center font-extrabold text-[#0D1F3D]">{exec.visitsCount}</td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-700">
                    {exec.revenueFormatted}
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-bold text-emerald-600">{exec.performancePercentage}%</span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleUnassign(exec.id, exec.name)}
                      className="text-xs font-bold text-red-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Unassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-5 shadow-2xl space-y-4 text-xs font-semibold">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Assign Executive to {territory.name}</h3>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Select Executive</label>
              <select
                value={selectedMembershipId}
                onChange={(e) => setSelectedMembershipId(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
              >
                <option value="">Select executive...</option>
                {availableMembers.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} ({m.sublabel})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignModal(false)}
                className="bg-white text-slate-700 border-slate-200"
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleAssignNew}
                className="bg-red-600 text-white font-bold"
              >
                Confirm Assignment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
