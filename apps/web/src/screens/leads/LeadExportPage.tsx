import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function LeadExportPage() {
  const navigate = useNavigate();
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success(`Leads data exported as ${exportFormat.toUpperCase()} file successfully!`);
      navigate('/admin/leads');
    }, 800);
  };

  return (
    <div className="space-y-3 font-sans pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/leads')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0D1F3D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </button>

        <Button
          variant="accent"
          size="sm"
          type="button"
          onClick={handleExport}
          isLoading={isExporting}
          className="flex items-center gap-2 font-bold shadow-xs"
        >
          <Download className="h-4 w-4" /> Download Export File
        </Button>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0D1F3D]">Export Lead Records</h2>
            <p className="text-xs font-medium text-slate-500">
              Download complete pipeline reports, executive assignment logs, or specific lead stages.
            </p>
          </div>
        </div>

        {/* Export Format Selection */}
        <div className="space-y-2 text-xs font-semibold">
          <label className="font-bold text-[#0D1F3D] block">Select Export File Format *</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'csv', label: 'CSV File (.csv)', desc: 'Standard comma-separated format' },
              { id: 'xlsx', label: 'Excel Sheet (.xlsx)', desc: 'Formatted Microsoft Excel workbook' },
              { id: 'pdf', label: 'PDF Summary Report (.pdf)', desc: 'Printable executive overview' },
            ].map((item) => (
              <label
                key={item.id}
                onClick={() => setExportFormat(item.id as any)}
                className={`flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  exportFormat === item.id
                    ? 'border-[#0D1F3D] bg-blue-50/40 ring-1 ring-[#0D1F3D]'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="exportFmt"
                    checked={exportFormat === item.id}
                    onChange={() => {}}
                    className="text-[#0D1F3D]"
                  />
                  <span className="font-extrabold text-[#0D1F3D]">{item.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-2 text-xs font-semibold pt-4 border-t border-slate-100">
          <label className="font-bold text-[#0D1F3D] block">Select Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full sm:w-1/2 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D]"
          >
            <option value="all">All Time (All 1,250 Leads)</option>
            <option value="this_month">This Month (May 2025)</option>
            <option value="last_month">Last Month (April 2025)</option>
            <option value="q1">Q1 2025 Pipeline</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={() => navigate('/admin/leads')} className="font-bold">
            Cancel
          </Button>
          <Button variant="accent" size="sm" type="button" onClick={handleExport} isLoading={isExporting} className="font-bold shadow-xs">
            Export Records Now
          </Button>
        </div>
      </div>
    </div>
  );
}
