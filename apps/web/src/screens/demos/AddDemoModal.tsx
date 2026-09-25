import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import {
  X,
  Monitor,
  Phone,
  User,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { ClockTimePickerModal } from '../../components/ui/ClockTimePickerModal';
import { demoApi, DemoLeadOption, DemoOptions } from './demo.api';

interface AddDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddDemoModal({ isOpen, onClose, onSuccess }: AddDemoModalProps) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  const [options, setOptions] = useState<DemoOptions>({ leads: [], executives: [] });
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const matchedBusiness: DemoLeadOption | undefined = options.leads.find((lead) => lead.id === selectedLeadId);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [demoType, setDemoType] = useState('Product Demo');
  const [assignedTo, setAssignedTo] = useState('');
  const [demoDate, setDemoDate] = useState(new Date().toISOString().slice(0, 10));
  const [demoTime, setDemoTime] = useState('11:00');
  const [productService, setProductService] = useState('Smart Field ERP & Mobile App');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    demoApi.options(controller.signal).then((result) => {
      setOptions(result);
      setSelectedLeadId((current) => current || result.leads[0]?.id || '');
      setAssignedTo((current) => current || result.executives[0]?.id || '');
      setPhoneNumber((current) => current || result.leads[0]?.phone || '');
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) toast.error(error instanceof Error ? error.message : 'Unable to load demo options');
    });
    return () => controller.abort();
  }, [isOpen]);

  // Smooth two-stage portal animation setup
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
    setSelectedLeadId(val);
    const found = options.leads.find((lead) => lead.id === val);
    if (found) {
      setPhoneNumber(found.phone || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !phoneNumber || !assignedTo) {
      toast.error('Please fill in required fields');
      return;
    }
    const controller = new AbortController();
    setSaving(true);
    try {
      await demoApi.create({ leadId: selectedLeadId, demoTitle: productService || `${demoType} - ${matchedBusiness?.displayName || 'Lead'}`, demoDate, demoTime, demoType: demoType as 'Product Demo' | 'Live Demo' | 'Online Demo' | 'POC / Pilot', demoMode: demoType === 'Online Demo' ? 'Virtual' : 'In-Person', productService, attendeesCount: 1, keyQuestions: notes, conductedByMembershipId: assignedTo }, controller.signal);
      toast.success(`New Product Demo scheduled for ${matchedBusiness?.displayName || 'lead'}!`);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to schedule demo');
    } finally {
      setSaving(false);
    }
  };

  if (!rendered) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-250 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity duration-250"
        onClick={onClose}
      />

      {/* Centered Animated Modal Container */}
      <div
        className={`relative w-full max-w-2xl rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-5 my-8 z-10 transition-all duration-250 ease-out font-sans text-left ${
          visible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-red-50 text-red-600 border border-red-200/60 shadow-xs">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0D1F3D] leading-tight">
                Schedule New Product Demo
              </h2>
              <p className="text-[11px] font-semibold text-slate-400">
                Book a demo session for an existing business lead.
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          {/* 1. Searchable Business Selector */}
          <div className="space-y-1">
            <Select
              label="Select Target Business *"
              value={selectedLeadId}
              onChange={handleBusinessSelect}
              searchable
              options={options.leads.map((lead) => ({
                value: lead.id,
                label: lead.displayName,
                sublabel: `${lead.leadCode} • ${lead.city || 'Location not set'}`,
              }))}
            />
          </div>

          {/* Selected Business Auto-Derived Details Card (Replaces redundant Contact Person text input) */}
          {matchedBusiness && (
            <div className="rounded-sm border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#0D1F3D]">{matchedBusiness.displayName}</span>
                  <span className="rounded-xs bg-slate-200/60 text-slate-700 px-1.5 py-0.2 text-[10px] font-bold">
                    {matchedBusiness.leadCode}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{matchedBusiness.city || '—'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    <strong className="text-slate-900">{matchedBusiness.contactName || matchedBusiness.name}</strong> (Contact)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-700 font-mono">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{matchedBusiness.phone || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Phone Number Input with Phone Icon & Tel Mask */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Contact Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phoneNumber.replace('+91 ', '')}
                  onChange={(e) => {
                    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(cleanDigits ? `+91 ${cleanDigits}` : '');
                  }}
                  className="w-full rounded-sm border border-slate-200 bg-white pl-11 pr-3 py-2 text-slate-800 font-mono text-xs placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Demo Type Select */}
            <div className="space-y-1">
              <Select
                label="Demo Type *"
                value={demoType}
                onChange={(e) => setDemoType(e.target.value)}
                searchable={false}
                options={[
                  { value: 'Product Demo', label: 'Product Demo' },
                  { value: 'Live Demo', label: 'Live Demo' },
                  { value: 'Online Demo', label: 'Online Demo' },
                  { value: 'POC / Pilot', label: 'POC / Pilot' },
                ]}
              />
            </div>

            {/* Assign Executive */}
            <div className="space-y-1">
              <Select
                label="Assign Executive *"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                searchable={true}
                options={options.executives.map((exec) => ({
                  value: exec.id,
                  label: exec.name,
                  avatar: exec.avatarUrl || undefined,
                  sublabel: `${exec.role} • ${exec.team || 'No team'}`,
                }))}
              />
            </div>

            {/* Product / Service */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Product / Service</label>
              <input
                type="text"
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
              />
            </div>

            {/* Demo Date with reusable DatePicker component */}
            <DatePicker
              label="Demo Date"
              value={demoDate}
              onChange={(d) => setDemoDate(d)}
              required
            />

            {/* Demo Time with ClockTimePickerModal */}
            <ClockTimePickerModal
              label="Demo Time"
              value={demoTime}
              onChange={(t) => setDemoTime(t)}
            />
          </div>

          {/* Special Requirements / Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Special Requirements / Notes</label>
            <textarea
              rows={2.5}
              placeholder="Enter demo preparation notes or client expectations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              {saving ? 'Scheduling...' : 'Schedule Demo'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
