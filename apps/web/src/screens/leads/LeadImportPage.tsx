import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function LeadImportPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [defaultSource, setDefaultSource] = useState('Trade Show');

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast.error('Please select a CSV or Excel file to upload.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`Imported 48 new lead records from "${selectedFile.name}"!`);
      navigate('/admin/leads');
    }, 1000);
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
          variant="outline"
          size="sm"
          type="button"
          onClick={() => toast.success('Downloaded Sample CSV Template')}
          className="flex items-center gap-1.5 font-bold"
        >
          <Download className="h-4 w-4 text-slate-600" /> Download Sample CSV
        </Button>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0D1F3D]">Import Leads File (CSV / XLSX)</h2>
            <p className="text-xs font-medium text-slate-500">
              Bulk import new lead lists, trade show attendees, or cold prospects into the system.
            </p>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 text-center space-y-3 hover:border-[#0D1F3D] transition-colors">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xs border border-slate-200 text-[#0D1F3D]">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#0D1F3D]">
              {selectedFile ? selectedFile.name : 'Drag and drop your lead file here, or browse'}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Supports .CSV, .XLSX files up to 10MB</p>
          </div>
          <input
            type="file"
            accept=".csv, .xlsx"
            onChange={handleFileDrop}
            className="hidden"
            id="lead-file-input"
          />
          <label htmlFor="lead-file-input">
            <span className="inline-block cursor-pointer rounded-xl bg-[#0D1F3D] px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-slate-800 transition-colors">
              Browse File
            </span>
          </label>
        </div>

        {/* Import Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs font-semibold">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Default Lead Source</label>
            <select
              value={defaultSource}
              onChange={(e) => setDefaultSource(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-bold text-[#0D1F3D]"
            >
              <option>Trade Show</option>
              <option>Cold Outreach</option>
              <option>LinkedIn</option>
              <option>Referral</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 mt-auto">
            <div>
              <p className="font-extrabold text-[#0D1F3D]">Skip Duplicate Records</p>
              <p className="text-[10px] text-slate-400 font-medium">Matches phone numbers & emails.</p>
            </div>
            <input
              type="checkbox"
              checked={skipDuplicates}
              onChange={(e) => setSkipDuplicates(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-[#E20613] focus:ring-[#E20613]"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={() => navigate('/admin/leads')} className="font-bold">
            Cancel
          </Button>
          <Button variant="accent" size="sm" type="button" onClick={handleImport} isLoading={isProcessing} className="font-bold shadow-xs">
            Start Importing Records
          </Button>
        </div>
      </div>
    </div>
  );
}
