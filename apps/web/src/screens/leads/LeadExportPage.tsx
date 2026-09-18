import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { useCrmMutation } from "../../features/crm/CrmContext";
import { CrmFailure, CrmLookup } from "../../features/crm/CrmControls";
import {
  LeadPriority,
  LeadStatus,
  leadPriorities,
  leadStatuses,
} from "../../features/crm/lead.types";

type ExportFormat = "csv" | "xlsx" | "pdf";

export default function LeadExportPage() {
  const navigate = useNavigate();
  const mutation = useCrmMutation();
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [sourceValueId, setSourceValueId] = useState("");
  const [maxRows, setMaxRows] = useState("500");

  const handleExport = async () => {
    if (exportFormat !== "csv") {
      toast.error("Only CSV export is available right now.");
      return;
    }
    const blob = await mutation.run((service, signal) =>
      service.leads.exportCsv(
        {
          priority: priority ? (priority as LeadPriority) : undefined,
          status: status ? (status as LeadStatus) : undefined,
          sourceValueId: sourceValueId || undefined,
          maxRows: Number(maxRows),
        },
        signal,
      ),
    );
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leads-export.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Lead export downloaded.");
  };

  const formats: Array<{
    id: ExportFormat;
    label: string;
    desc: string;
    disabled?: boolean;
  }> = [
    { id: "csv", label: "CSV File (.csv)", desc: "Spreadsheet-safe export" },
    {
      id: "xlsx",
      label: "Excel Sheet (.xlsx)",
      desc: "Deferred. Use CSV for now.",
      disabled: true,
    },
    {
      id: "pdf",
      label: "PDF Summary Report (.pdf)",
      desc: "Deferred. Use CSV for now.",
      disabled: true,
    },
  ];

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
          variant="accent"
          size="sm"
          type="button"
          onClick={handleExport}
          isLoading={mutation.pending}
          className="flex items-center gap-2 font-bold shadow-xs"
        >
          <Download className="h-4 w-4" /> Download CSV
        </Button>
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-xs">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0D1F3D]">
              Export Lead Records
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Download only the leads you are authorized to view. Current
              filters are applied server-side.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs font-semibold">
          <label className="block font-bold text-[#0D1F3D]">
            Select Export File Format *
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {formats.map((item) => (
              <label
                key={item.id}
                className={`flex min-h-[96px] flex-col justify-between rounded-xl border p-4 transition-all ${
                  item.disabled
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                    : exportFormat === item.id
                      ? "cursor-pointer border-[#0D1F3D] bg-blue-50/40 ring-1 ring-[#0D1F3D]"
                      : "cursor-pointer border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <input
                    type="radio"
                    name="exportFmt"
                    checked={exportFormat === item.id}
                    disabled={item.disabled}
                    onChange={() => setExportFormat(item.id)}
                    className="text-[#0D1F3D]"
                  />
                  <span className="font-extrabold text-[#0D1F3D]">
                    {item.label}
                  </span>
                </div>
                <p className="text-[11px] leading-tight text-slate-500">
                  {item.desc}
                </p>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-xs font-semibold sm:grid-cols-2 xl:grid-cols-4">
          <Select
            label="Lifecycle"
            placeholder="All Lifecycle States"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={leadStatuses}
          />
          <Select
            label="Priority"
            placeholder="All Priorities"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            options={leadPriorities}
          />
          <CrmLookup
            compact
            id="lead-export-source"
            label="Source"
            kind="lead_source"
            value={sourceValueId}
            onChange={setSourceValueId}
          />
          <Select
            label="Maximum Rows"
            value={maxRows}
            onChange={(event) => setMaxRows(event.target.value)}
            options={[
              { value: "100", label: "100 rows" },
              { value: "500", label: "500 rows" },
              { value: "1000", label: "1,000 rows" },
            ]}
          />
        </div>

        {mutation.error && <CrmFailure error={mutation.error} />}

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
            variant="accent"
            size="sm"
            type="button"
            onClick={handleExport}
            isLoading={mutation.pending}
            className="font-bold shadow-xs"
          >
            Export Records Now
          </Button>
        </div>
      </div>
    </div>
  );
}
