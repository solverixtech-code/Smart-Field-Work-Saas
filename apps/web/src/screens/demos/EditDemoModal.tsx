import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { X, Edit, Phone, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { ClockTimePickerModal } from '../../components/ui/ClockTimePickerModal';
import { mockTerritoryExecutives } from '../territories/territoriesData';
import { DemoItem } from './demosData';

interface EditDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  demo?: DemoItem;
  onSuccess?: () => void;
}

export function EditDemoModal({ isOpen, onClose, demo, onSuccess }: EditDemoModalProps) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  const [demoType, setDemoType] = useState(demo?.demoType || 'Product Demo');
  const [assignedTo, setAssignedTo] = useState(demo?.assignedToName || 'Arjun Mehta');
  const [status, setStatus] = useState(demo?.status || 'Scheduled');
  const [demoDate, setDemoDate] = useState(demo?.demoDate || '2025-05-20');
  const [demoTime, setDemoTime] = useState(demo?.demoTime || '11:00 AM');
  const [productService, setProductService] = useState(demo?.productService || 'Smart Field ERP & Mobile App');
  const [notes, setNotes] = useState(demo?.notesSummary || '');

  useEffect(() => {
    if (demo) {
      setDemoType(demo.demoType);
      setAssignedTo(demo.assignedToName);
      setStatus(demo.status);
      setDemoDate(demo.demoDate);
      setDemoTime(demo.demoTime);
      setProductService(demo.productService);
      setNotes(demo.notesSummary || '');
    }
  }, [demo]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Product Demo ${demo?.demoId || ''} updated successfully!`);
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
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-200/60 shadow-xs">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0D1F3D] leading-tight">
                Edit Product Demo ({demo?.demoId || 'DEM-1286'})
              </h2>
              <p className="text-[11px] font-semibold text-slate-500">
                Update demo schedule, status, assigned executive, or notes.
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
          {/* Target Business Details Card */}
          {demo && (
            <div className="rounded-sm border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0D1F3D] text-sm">{demo.businessName}</span>
                <span className="text-[10px] font-mono font-bold text-slate-400">{demo.businessAddress}</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] pt-1 border-t border-slate-200/60 text-slate-700">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" /> {demo.contactPerson} ({demo.contactRole})
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {demo.phone}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Demo Type */}
            <div className="space-y-1">
              <Select
                label="Demo Type *"
                value={demoType}
                onChange={(e) => setDemoType(e.target.value as any)}
                searchable={false}
                options={[
                  { value: 'Product Demo', label: 'Product Demo' },
                  { value: 'Live Demo', label: 'Live Demo' },
                  { value: 'Online Demo', label: 'Online Demo' },
                  { value: 'POC / Pilot', label: 'POC / Pilot' },
                ]}
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <Select
                label="Status *"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                searchable={false}
                options={[
                  { value: 'Scheduled', label: 'Scheduled' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Cancelled', label: 'Cancelled' },
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

            {/* Product / Service */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block text-xs">Product / Service</label>
              <input
                type="text"
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
              />
            </div>

            {/* Demo Date */}
            <DatePicker
              label="Demo Date"
              value={demoDate}
              onChange={(d) => setDemoDate(d)}
              required
            />

            {/* Demo Time */}
            <ClockTimePickerModal
              label="Demo Time"
              value={demoTime}
              onChange={(t) => setDemoTime(t)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block text-xs">Preparation Notes / Special Requirements</label>
            <textarea
              rows={3}
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
