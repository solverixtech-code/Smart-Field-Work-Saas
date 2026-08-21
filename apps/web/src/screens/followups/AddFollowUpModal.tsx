import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import {
  X,
  Phone,
  User,
  Calendar,
  Clock,
  Briefcase,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { mockTerritoryExecutives } from '../territories/territoriesData';
import { mockBusinesses } from '../businesses/businessesData';
import { mockFollowUpsList } from './followupsData';

interface AddFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const allAvailableBusinesses = [
  ...mockBusinesses.map((b) => ({
    name: b.name,
    contactPerson: b.contactPerson,
    contactRole: b.contactRole,
    phone: b.phone,
    email: b.email,
    address: b.address,
    city: b.city,
    category: b.category,
  })),
  ...mockFollowUpsList.map((f) => ({
    name: f.businessName,
    contactPerson: f.contactPerson,
    contactRole: f.contactRole,
    phone: f.phone,
    email: f.email,
    address: f.businessAddress,
    city: 'Mumbai',
    category: f.businessType,
  })),
].filter((b, idx, self) => idx === self.findIndex((t) => t.name === b.name));

export function AddFollowUpModal({ isOpen, onClose, onSuccess }: AddFollowUpModalProps) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  const [selectedBusinessName, setSelectedBusinessName] = useState(
    allAvailableBusinesses[0]?.name || ''
  );

  const matchedBusiness =
    allAvailableBusinesses.find((b) => b.name === selectedBusinessName) ||
    allAvailableBusinesses[0];

  const [phoneNumber, setPhoneNumber] = useState(matchedBusiness?.phone || '');
  const [followupType, setFollowupType] = useState<any>('Quotation Follow-up');
  const [assignedTo, setAssignedTo] = useState('Pooja Yadav');
  const [priority, setPriority] = useState('High');
  const [followupDate, setFollowupDate] = useState('2025-05-22');
  const [followupTime, setFollowupTime] = useState('12:00');
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBusinessSelect = (e: { target: { value: string } }) => {
    const val = e.target.value;
    setSelectedBusinessName(val);
    const found = allAvailableBusinesses.find((b) => b.name === val);
    if (found) {
      setPhoneNumber(found.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusinessName || !phoneNumber) {
      toast.error('Please select a business');
      return;
    }
    toast.success(`Follow-up scheduled for ${selectedBusinessName}!`);
    onSuccess?.();
    onClose();
  };

  if (!rendered) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-250 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity duration-250"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-xl rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-5 my-8 z-10 transition-all duration-250 ease-out font-sans text-left ${
          visible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-red-50 text-red-600 border border-red-200/60 shadow-xs">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0D1F3D] leading-tight">
                Add New Follow-up
              </h2>
              <p className="text-[11px] font-semibold text-slate-500">
                Schedule a follow-up action for a business or prospect lead.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          {/* Target Business Selection */}
          <div className="space-y-1">
            <Select
              label="Select Target Business *"
              value={selectedBusinessName}
              onChange={handleBusinessSelect}
              searchable
              options={allAvailableBusinesses.map((b) => ({
                value: b.name,
                label: b.name,
                sublabel: `${b.category} • ${b.city}`,
              }))}
            />
          </div>

          {/* Business Info Summary Card */}
          {matchedBusiness && (
            <div className="rounded-sm border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#0D1F3D]">{matchedBusiness.name}</span>
                  <span className="rounded-xs bg-slate-200/60 text-slate-700 px-1.5 py-0.2 text-[10px] font-bold">
                    {matchedBusiness.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{matchedBusiness.city}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    <strong className="text-slate-900">{matchedBusiness.contactPerson}</strong> ({matchedBusiness.contactRole || 'Owner'})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-700 font-mono">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{matchedBusiness.phone}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Follow-up Type */}
            <div className="space-y-1">
              <Select
                label="Follow-up Type *"
                value={followupType}
                onChange={(e) => setFollowupType(e.target.value)}
                searchable={false}
                options={[
                  { value: 'Quotation Follow-up', label: 'Quotation Follow-up' },
                  { value: 'Demo Follow-up', label: 'Demo Follow-up' },
                  { value: 'Product Info Follow-up', label: 'Product Info Follow-up' },
                  { value: 'Payment Follow-up', label: 'Payment Follow-up' },
                ]}
              />
            </div>

            {/* Assign Executive */}
            <div className="space-y-1">
              <Select
                label="Assign Executive *"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                searchable
                options={mockTerritoryExecutives.map((exec) => ({
                  value: exec.name,
                  label: exec.name,
                  sublabel: exec.role,
                  avatar: exec.avatar,
                }))}
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <Select
                label="Priority *"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                searchable={false}
                options={[
                  { value: 'High', label: 'High Priority' },
                  { value: 'Medium', label: 'Medium Priority' },
                  { value: 'Low', label: 'Low Priority' },
                ]}
              />
            </div>

            {/* Follow-up Date */}
            <DatePicker
              label="Follow-up Date"
              value={followupDate}
              onChange={(d) => setFollowupDate(d)}
              required
            />

            {/* Follow-up Time */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block text-xs">Follow-up Time *</label>
              <input
                type="time"
                value={followupTime}
                onChange={(e) => setFollowupTime(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none font-mono text-xs"
                required
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block text-xs">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phoneNumber.replace('+91 ', '')}
                  onChange={(e) => setPhoneNumber(`+91 ${e.target.value}`)}
                  className="w-full rounded-sm border border-slate-200 bg-white pl-11 pr-3 py-2 text-slate-800 font-mono text-xs placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Follow-up Purpose / Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block text-xs">Follow-up Purpose & Discussion Notes</label>
            <textarea
              rows={2.5}
              placeholder="Enter follow-up purpose, customer discussion notes or next steps..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white p-2.5 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Schedule Follow-up
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
