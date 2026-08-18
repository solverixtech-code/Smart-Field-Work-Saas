import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Target,
  DollarSign,
  Flame,
  Save,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { mockLeadsData, LeadItem } from './leadsData';

export default function EditLeadPage() {
  const navigate = useNavigate();
  const { leadId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingLead = mockLeadsData.find((l) => l.id === leadId) || mockLeadsData[0];

  const [companyName, setCompanyName] = useState(existingLead.companyName);
  const [contactPerson, setContactPerson] = useState(existingLead.contactPerson);
  const [email, setEmail] = useState(existingLead.email);
  const [phone, setPhone] = useState(existingLead.phone);
  const [stage, setStage] = useState(existingLead.stage);
  const [priority, setPriority] = useState(existingLead.priority);
  const [estimatedValue, setEstimatedValue] = useState(String(existingLead.estimatedValue));
  const [assignedExecutive, setAssignedExecutive] = useState(existingLead.assignedExecutive);
  const [requirementNotes, setRequirementNotes] = useState(existingLead.requirementNotes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Updated lead record for "${companyName}"!`);
      navigate(`/admin/leads/${existingLead.id}`);
    }, 600);
  };

  return (
    <div className="space-y-3 font-sans pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`/admin/leads/${existingLead.id}`)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Lead Details
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => navigate(`/admin/leads/${existingLead.id}`)}
            className="font-bold"
          >
            Cancel
          </Button>
          <Button
            variant="accent"
            size="sm"
            type="button"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="flex items-center gap-2 font-bold shadow-xs"
          >
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0D1F3D]">Edit Lead: {existingLead.companyName}</h2>
              <p className="text-xs font-medium text-slate-500">
                Update lead stage, valuation, sales representative assignment, and client notes ({existingLead.code}).
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Core Company Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs font-semibold">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Company Name *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Contact Person Name *</label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Phone Number *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Stage & Value */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4 border-t border-slate-100 text-xs font-semibold">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Estimated Deal Value (₹)</label>
            <input
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <Select
              label="Lead Stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              options={[
                { value: 'New / Fresh', label: 'New / Fresh' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Meeting Scheduled', label: 'Meeting Scheduled' },
                { value: 'Demo Completed', label: 'Demo Completed' },
                { value: 'Proposal Sent', label: 'Proposal Sent' },
                { value: 'Negotiation', label: 'Negotiation' },
                { value: 'Won / Converted', label: 'Won / Converted' },
                { value: 'Lost', label: 'Lost' },
              ]}
            />
          </div>

          <div>
            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { value: 'Urgent', label: 'Urgent' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
          <label className="font-bold text-slate-700 block">Requirement Notes</label>
          <textarea
            rows={4}
            value={requirementNotes}
            onChange={(e) => setRequirementNotes(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={() => navigate(`/admin/leads/${existingLead.id}`)} className="font-bold">
            Cancel
          </Button>
          <Button variant="accent" size="sm" type="submit" isLoading={isSubmitting} className="font-bold shadow-xs">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
