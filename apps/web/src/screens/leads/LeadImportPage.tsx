import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Upload, FileSpreadsheet, Download } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import { useCrmMutation } from "../../features/crm/CrmContext";
import { CrmFailure, CrmLookup } from "../../features/crm/CrmControls";
import type { LeadImportPreview } from "../../features/crm/lead.types";

const sampleCsv = [
  "leadType,businessName,contactName,phone,email,priority,city,state,nextFollowUpAt,nextActionNote,requirementNote",
  "BUSINESS,Acme Distribution,Anita Shah,+919876543210,anita@example.com,HIGH,Mumbai,Maharashtra,2026-09-20T10:00:00.000Z,Call purchase team,Interested in field tracking",
  "INDIVIDUAL,,Rahul Mehta,+919812345678,rahul@example.com,MEDIUM,Pune,Maharashtra,,,",
].join("\r\n");

export default function LeadImportPage() {
  const navigate = useNavigate();
  const mutation = useCrmMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csv, setCsv] = useState("");
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [defaultSourceValueId, setDefaultSourceValueId] = useState("");
  const [preview, setPreview] = useState<LeadImportPreview | null>(null);

  const readFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Choose a CSV file.");
      return;
    }
    const text = await file.text();
    setSelectedFile(file);
    setCsv(text);
    setPreview(null);
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(
      new Blob([sampleCsv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "lead-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const body = {
    csv,
    duplicatePolicy: skipDuplicates ? "SKIP" : "REJECT",
    defaultSourceValueId: defaultSourceValueId || null,
  } as const;

  const handlePreview = async () => {
    if (!csv) {
      toast.error("Choose a CSV file first.");
      return;
    }
    const result = await mutation.run((service, signal) =>
      service.leads.importPreview(body, signal),
    );
    if (result) setPreview(result);
  };

  const handleImport = async () => {
    if (!preview) {
      toast.error("Preview the file before importing.");
      return;
    }
    const result = await mutation.run((service, signal) =>
      service.leads.importLeads({ ...body, confirmed: true }, signal),
    );
    if (result) {
      toast.success(
        `Created ${result.created}, skipped ${result.skipped}, rejected ${result.rejected}.`,
      );
      navigate("/admin/leads");
    }
  };

  return (
    <div className="space-y-3 pb-12 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/leads")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-[#0D1F3D]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </button>

        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 font-bold"
        >
          <Download className="h-4 w-4 text-slate-600" /> Download Sample CSV
        </Button>
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-xs">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0D1F3D]">
              Import Leads CSV
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Preview, validate, and import lead rows with explicit duplicate
              handling.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 text-center transition-colors hover:border-[#0D1F3D]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0D1F3D] shadow-xs">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#0D1F3D]">
              {selectedFile ? selectedFile.name : "Choose a CSV file"}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
              Maximum 250 rows per import.
            </p>
          </div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readFile(file);
            }}
            className="hidden"
            id="lead-file-input"
          />
          <label htmlFor="lead-file-input">
            <span className="inline-block cursor-pointer rounded-xl bg-[#0D1F3D] px-4 py-2 text-xs font-extrabold text-white shadow-xs transition-colors hover:bg-slate-800">
              Browse CSV
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 text-xs font-semibold sm:grid-cols-2">
          <CrmLookup
            id="lead-import-source"
            label="Default Lead Source"
            kind="lead_source"
            value={defaultSourceValueId}
            onChange={(id) => {
              setDefaultSourceValueId(id);
              setPreview(null);
            }}
          />
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <p className="font-extrabold text-[#0D1F3D]">
                Skip Duplicate Records
              </p>
              <p className="text-[10px] font-medium text-slate-400">
                Matches phone numbers and emails.
              </p>
            </div>
            <Checkbox
              checked={skipDuplicates}
              onChange={(checked) => {
                setSkipDuplicates(checked);
                setPreview(null);
              }}
              aria-label="Skip duplicate records"
            />
          </div>
        </div>

        {mutation.error && <CrmFailure error={mutation.error} />}
        {preview && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="grid grid-cols-2 gap-3 text-xs font-bold text-[#0D1F3D] sm:grid-cols-4">
              <span>Total: {preview.totalRows}</span>
              <span>Ready: {preview.readyRows}</span>
              <span>Duplicates: {preview.duplicateRows}</span>
              <span>Rejected: {preview.rejectedRows}</span>
            </div>
            <div className="mt-4 max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th className="p-2">Row</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.rows.map((row) => (
                    <tr key={row.rowNumber}>
                      <td className="p-2 font-mono">{row.rowNumber}</td>
                      <td className="p-2 font-bold">{row.status}</td>
                      <td className="p-2 text-slate-600">
                        {row.errors.join(", ") || "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => navigate("/admin/leads")}
            className="font-bold"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handlePreview}
            isLoading={mutation.pending}
            className="font-bold"
          >
            Preview Rows
          </Button>
          <Button
            variant="accent"
            size="sm"
            type="button"
            onClick={handleImport}
            isLoading={mutation.pending}
            disabled={!preview || preview.readyRows === 0}
            className="font-bold shadow-xs"
          >
            Import Ready Records
          </Button>
        </div>
      </div>
    </div>
  );
}
