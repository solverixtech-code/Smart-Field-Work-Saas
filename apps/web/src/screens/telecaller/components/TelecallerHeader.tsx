import React, { useState } from 'react';
import { Bell, Search, Calendar, ChevronDown, CheckCircle, Clock, Coffee, Moon } from 'lucide-react';

interface TelecallerHeaderProps {
  telecallerName: string;
  role: string;
  status: 'Available' | 'On Call' | 'In Meeting' | 'On Break' | 'Offline';
  dateStr: string;
  onStatusChange?: (newStatus: 'Available' | 'On Call' | 'In Meeting' | 'On Break' | 'Offline') => void;
  onSearch?: (query: string) => void;
}

export const TelecallerHeader: React.FC<TelecallerHeaderProps> = ({
  telecallerName,
  role,
  status,
  dateStr,
  onStatusChange,
  onSearch,
}) => {
  const [statusOpen, setStatusOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [searchQuery, setSearchQuery] = useState('');

  const statusConfigs = {
    Available: { label: 'Available', color: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'On Call': { label: 'On Call', color: 'bg-blue-500 animate-pulse', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    'In Meeting': { label: 'In Meeting', color: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    'On Break': { label: 'On Break', color: 'bg-purple-500', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    Offline: { label: 'Offline', color: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const handleSelectStatus = (newStatus: 'Available' | 'On Call' | 'In Meeting' | 'On Break' | 'Offline') => {
    setCurrentStatus(newStatus);
    onStatusChange?.(newStatus);
    setStatusOpen(false);
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
      <div>
        <h1 className="text-xl font-extrabold text-[#0D1F3D] tracking-tight">
          {telecallerName} - My Telecaller Dashboard
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Follow your smart day plan, hit your call target, and maximize conversions.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold shadow-2xs cursor-pointer hover:bg-slate-100 transition-colors">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{dateStr}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>

        {/* Lead/Client Search */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, clients, scripts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-red-500 focus:outline-none transition-all shadow-2xs"
          />
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shadow-2xs"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            6
          </span>
        </button>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusOpen(!statusOpen)}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${statusConfigs[currentStatus].bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusConfigs[currentStatus].color}`} />
            <span>{statusConfigs[currentStatus].label}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {statusOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => handleSelectStatus('Available')}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
              </button>
              <button
                type="button"
                onClick={() => handleSelectStatus('On Call')}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" /> On Call
              </button>
              <button
                type="button"
                onClick={() => handleSelectStatus('In Meeting')}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" /> In Meeting
              </button>
              <button
                type="button"
                onClick={() => handleSelectStatus('On Break')}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-purple-500" /> On Break
              </button>
              <button
                type="button"
                onClick={() => handleSelectStatus('Offline')}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-800 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-slate-400" /> Offline
              </button>
            </div>
          )}
        </div>

        {/* User Avatar Drawer */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#0D1F3D] text-white flex items-center justify-center font-bold text-xs">
            {telecallerName.charAt(0)}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-[#0D1F3D] leading-tight">{telecallerName}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
