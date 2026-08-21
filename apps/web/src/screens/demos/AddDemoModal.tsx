import React, { useState } from 'react';
import { toast } from 'sonner';
import { X, Calendar, Clock, Monitor, User, Building2, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { mockTerritoryExecutives } from '../territories/territoriesData';

interface AddDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddDemoModal({ isOpen, onClose, onSuccess }: AddDemoModalProps) {
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [demoType, setDemoType] = useState('Product Demo');
  const [assignedTo, setAssignedTo] = useState('Arjun Mehta');
  const [demoDate, setDemoDate] = useState('2025-05-20');
  const [demoTime, setDemoTime] = useState('11:00');
  const [productService, setProductService] = useState('Smart Field ERP & Mobile App');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !contactPerson || !phone) {
      toast.error('Please fill in required fields');
      return;
    }
    toast.success(`New Demo scheduled for ${businessName}!`);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-4 font-sans text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <Monitor className="h-5 w-5 text-red-600" /> Schedule New Product Demo
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Business / Prospect Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sai Enterprises"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Suresh Patel"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                required
              />
            </div>

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

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Product / Service</label>
              <input
                type="text"
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Demo Date *</label>
              <input
                type="date"
                value={demoDate}
                onChange={(e) => setDemoDate(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Demo Time *</label>
              <input
                type="time"
                value={demoTime}
                onChange={(e) => setDemoTime(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Special Requirements / Notes</label>
            <textarea
              rows={3}
              placeholder="Enter demo preparation notes or client expectations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white p-2.5 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

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
              Schedule Demo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
