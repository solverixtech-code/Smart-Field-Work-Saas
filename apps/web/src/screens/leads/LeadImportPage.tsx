import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  FileText,
  Trash2,
  Columns,
  RefreshCw,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import { useCrmMutation } from "../../features/crm/CrmContext";
import { CrmFailure, CrmLookup } from "../../features/crm/CrmControls";
import type { LeadImportPreview } from "../../features/crm/lead.types";

const sampleCsv = [
  "leadType,businessName,contactName,phone,email,priority,city,state,nextFollowUpAt,nextActionNote,requirementNote",
  "BUSINESS,Acme Distribution Pvt Ltd,Anita Shah,+919876543210,anita@acmedist.com,HIGH,Mumbai,Maharashtra,2026-09-28T10:00:00.000Z,Schedule on-site product demo,Interested in 50 field tracking licenses & GPS attendance",
  "BUSINESS,Apex Logistics Hub,Vikram Malhotra,+919812345678,vikram@apexlogistics.com,URGENT,Mumbai,Maharashtra,2026-09-27T14:30:00.000Z,Send commercial quotation,Requires route tracking & automated visit check-ins",
  "INDIVIDUAL,,Rahul Mehta,+919654088990,rahul.mehta@example.com,MEDIUM,Pune,Maharashtra,2026-09-30T16:00:00.000Z,Call for preliminary consultation,Individual franchise consultant",
].join("\r\n");

// Target CRM Lead fields available for column mapping
const CRM_FIELD_OPTIONS = [
  { value: "businessName", label: "Business / Company Name", isKey: true },
  { value: "contactName", label: "Contact Person Name", isKey: true },
  { value: "phone", label: "Mobile / Phone Number", isKey: true },
  { value: "email", label: "Email Address", isKey: true },
  { value: "leadType", label: "Lead Type (BUSINESS / INDIVIDUAL)", isKey: false },
  { value: "priority", label: "Priority (LOW / MEDIUM / HIGH / URGENT)", isKey: false },
  { value: "city", label: "City / Town", isKey: false },
  { value: "state", label: "State / Region", isKey: false },
  { value: "postalCode", label: "Postal / Pin Code", isKey: false },
  { value: "estimatedValue", label: "Estimated Deal Value (₹)", isKey: false },
  { value: "requirementNote", label: "Requirement Notes / Details", isKey: false },
  { value: "nextFollowUpAt", label: "Next Follow-up Date", isKey: false },
  { value: "nextActionNote", label: "Next Action Plan", isKey: false },
  { value: "website", label: "Website URL", isKey: false },
  { value: "SKIP", label: "-- Do Not Import (Skip Column) --", isKey: false },
] as const;

// Smart heuristic to auto-match CSV headers to CRM fields
function autoGuessCrmField(header: string): string {
  const norm = header.trim().toLowerCase().replace(/[\s_\-]+/g, "");
  if (norm.includes("business") || norm.includes("company") || norm.includes("org") || norm.includes("firm")) return "businessName";
  if (norm.includes("contact") || norm.includes("client") || norm.includes("person") || norm.includes("fullname") || norm.includes("customer") || norm === "name") return "contactName";
  if (norm.includes("phone") || norm.includes("mobile") || norm.includes("contactno") || norm.includes("tel") || norm.includes("cell")) return "phone";
  if (norm.includes("email") || norm.includes("mail")) return "email";
  if (norm.includes("city") || norm.includes("town") || norm.includes("district")) return "city";
  if (norm.includes("state") || norm.includes("province") || norm.includes("region")) return "state";
  if (norm.includes("prio") || norm.includes("urgency")) return "priority";
  if (norm.includes("type") || norm.includes("kind")) return "leadType";
  if (norm.includes("requirement") || norm.includes("note") || norm.includes("remark") || norm.includes("desc")) return "requirementNote";
  if (norm.includes("followup") || norm.includes("nextdate") || norm.includes("follow")) return "nextFollowUpAt";
  if (norm.includes("action") || norm.includes("nextstep")) return "nextActionNote";
  if (norm.includes("val") || norm.includes("amount") || norm.includes("budget") || norm.includes("deal")) return "estimatedValue";
  if (norm.includes("zip") || norm.includes("pin") || norm.includes("postal")) return "postalCode";
  if (norm.includes("web") || norm.includes("url") || norm.includes("site")) return "website";
  return "SKIP";
}

// Robust CSV parser supporting quotes & linebreaks
function parseCsvString(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const res: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        res.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    res.push(current.trim());
    return res;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

export default function LeadImportPage() {
  const navigate = useNavigate();
  const mutation = useCrmMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawCsv, setRawCsv] = useState("");
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [defaultSourceValueId, setDefaultSourceValueId] = useState("");
  const [preview, setPreview] = useState<LeadImportPreview | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a valid .CSV spreadsheet file.");
      return;
    }
    const text = await file.text();
    const { headers, rows } = parseCsvString(text);

    if (headers.length === 0) {
      toast.error("The uploaded CSV file appears to be empty or corrupted.");
      return;
    }

    // Auto-match headers to CRM fields
    const initialMapping: Record<string, string> = {};
    headers.forEach((h) => {
      initialMapping[h] = autoGuessCrmField(h);
    });

    setSelectedFile(file);
    setRawCsv(text);
    setParsedHeaders(headers);
    setParsedRows(rows);
    setColumnMapping(initialMapping);
    setPreview(null);
    toast.success(`Loaded "${file.name}" (${headers.length} columns, ${rows.length} rows)`);
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
    toast.success("Sample CSV template downloaded!");
  };

  const handleMappingChange = (csvHeader: string, targetField: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [csvHeader]: targetField,
    }));
    setPreview(null); // Reset preview when mapping is changed
  };

  const autoMatchAll = () => {
    const remap: Record<string, string> = {};
    parsedHeaders.forEach((h) => {
      remap[h] = autoGuessCrmField(h);
    });
    setColumnMapping(remap);
    setPreview(null);
    toast.success("Auto-matched columns to CRM fields!");
  };

  const resetMappings = () => {
    const reset: Record<string, string> = {};
    parsedHeaders.forEach((h) => {
      reset[h] = "SKIP";
    });
    setColumnMapping(reset);
    setPreview(null);
  };

  // Reconstruct CSV string based on column mappings
  const generateMappedCsv = (): string => {
    if (!parsedHeaders.length || !parsedRows.length) return rawCsv;

    // Filter headers that are mapped to a CRM field (not SKIP)
    const activeHeaders = parsedHeaders.filter(
      (h) => columnMapping[h] && columnMapping[h] !== "SKIP"
    );

    if (activeHeaders.length === 0) return rawCsv;

    // Construct Header row with mapped CRM field names
    const headerLine = activeHeaders.map((h) => columnMapping[h]).join(",");
    const csvLines = [headerLine];

    for (const row of parsedRows) {
      const lineVals: string[] = [];
      for (let i = 0; i < parsedHeaders.length; i++) {
        const headerName = parsedHeaders[i];
        const targetField = columnMapping[headerName];
        if (targetField && targetField !== "SKIP") {
          let cellVal = row[i] || "";
          if (cellVal.includes(",") || cellVal.includes('"') || cellVal.includes("\n")) {
            cellVal = `"${cellVal.replace(/"/g, '""')}"`;
          }
          lineVals.push(cellVal);
        }
      }
      csvLines.push(lineVals.join(","));
    }

    return csvLines.join("\r\n");
  };

  const handlePreview = async () => {
    const finalCsv = generateMappedCsv();
    if (!finalCsv) {
      toast.error("Please choose or drag a CSV file first.");
      return;
    }
    const payload = {
      csv: finalCsv,
      duplicatePolicy: skipDuplicates ? ("SKIP" as const) : ("REJECT" as const),
      defaultSourceValueId: defaultSourceValueId || null,
    };

    const result = await mutation.run((service, signal) =>
      service.leads.importPreview(payload, signal),
    );
    if (result) {
      setPreview(result);
      toast.success(`Validated ${result.totalRows} rows: ${result.readyRows} ready for import.`);
    }
  };

  const handleImport = async () => {
    if (!preview) {
      toast.error("Please validate & preview the file before importing.");
      return;
    }
    const finalCsv = generateMappedCsv();
    const payload = {
      csv: finalCsv,
      duplicatePolicy: skipDuplicates ? ("SKIP" as const) : ("REJECT" as const),
      defaultSourceValueId: defaultSourceValueId || null,
      confirmed: true as const,
    };

    const result = await mutation.run((service, signal) =>
      service.leads.importLeads(payload, signal),
    );
    if (result) {
      toast.success(
        `Import complete! Created ${result.created} leads, skipped ${result.skipped}, rejected ${result.rejected}.`,
      );
      navigate("/admin/leads");
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setRawCsv("");
    setParsedHeaders([]);
    setParsedRows([]);
    setColumnMapping({});
    setPreview(null);
  };

  // Count active mapped columns
  const activeMappedCount = Object.values(columnMapping).filter((v) => v !== "SKIP").length;

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* 1. Top Breadcrumb & Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span
              onClick={() => navigate("/admin/dashboard")}
              className="hover:text-[#0D1F3D] cursor-pointer transition-colors"
            >
              Dashboard
            </span>
            <ChevronRight className="h-3 w-3" />
            <span
              onClick={() => navigate("/admin/leads")}
              className="hover:text-[#0D1F3D] cursor-pointer transition-colors"
            >
              Leads Management
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0D1F3D] font-extrabold">CSV Bulk Importer</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/admin/leads")}
              className="p-1.5 rounded-sm bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#0D1F3D] transition-colors cursor-pointer mr-1"
              title="Back to Leads"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0D1F3D] flex items-center gap-2.5">
                Bulk Lead Importer
                <span className="rounded-sm bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-mono font-bold text-blue-700">
                  CSV Batch & Mapping Engine
                </span>
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Upload spreadsheets, map custom column headers to CRM fields, validate rows, and batch import leads.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" /> Download Template CSV
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-6 rounded-sm border border-slate-200/80 bg-white p-6 shadow-sm">
        {/* Process Step Wizard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-semibold">
          <div
            className={`rounded-sm border p-3 flex items-start gap-2.5 transition-colors ${
              selectedFile ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0D1F3D] text-white font-extrabold text-xs">
              1
            </div>
            <div>
              <p className="font-extrabold text-[#0D1F3D]">Upload File</p>
              <p className="text-[11px] text-slate-500 font-medium">Select or drop .CSV spreadsheet</p>
            </div>
          </div>

          <div
            className={`rounded-sm border p-3 flex items-start gap-2.5 transition-colors ${
              activeMappedCount > 0 ? "border-blue-300 bg-blue-50/30" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0D1F3D] text-white font-extrabold text-xs">
              2
            </div>
            <div>
              <p className="font-extrabold text-[#0D1F3D]">Field Mapping</p>
              <p className="text-[11px] text-slate-500 font-medium">Match CSV headers to CRM fields</p>
            </div>
          </div>

          <div
            className={`rounded-sm border p-3 flex items-start gap-2.5 transition-colors ${
              preview ? "border-indigo-300 bg-indigo-50/30" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0D1F3D] text-white font-extrabold text-xs">
              3
            </div>
            <div>
              <p className="font-extrabold text-[#0D1F3D]">Validate & Audit</p>
              <p className="text-[11px] text-slate-500 font-medium">Check errors & duplicates</p>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-slate-50 p-3 flex items-start gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0D1F3D] text-white font-extrabold text-xs">
              4
            </div>
            <div>
              <p className="font-extrabold text-[#0D1F3D]">Batch Commit</p>
              <p className="text-[11px] text-slate-500 font-medium">Import leads into CRM</p>
            </div>
          </div>
        </div>

        {/* 2. Interactive File Upload Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void processFile(file);
          }}
          className={`relative rounded-sm border-2 border-dashed p-7 text-center transition-all ${
            isDragging
              ? "border-[#0D1F3D] bg-slate-100/70 ring-4 ring-slate-400/10"
              : selectedFile
              ? "border-emerald-300 bg-emerald-50/20"
              : "border-slate-300 bg-slate-50/50 hover:border-[#0D1F3D] hover:bg-slate-100/50"
          }`}
        >
          {selectedFile ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-emerald-700 shadow-sm">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-sm mb-1 border border-emerald-200">
                  <Check className="h-3 w-3 text-emerald-700" /> CSV File Loaded
                </span>
                <p className="text-base font-extrabold text-[#0D1F3D]">{selectedFile.name}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {parsedHeaders.length} Columns Detected • {parsedRows.length} Data Rows
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSelectedFile}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" /> Remove File
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0D1F3D] shadow-xs">
                <UploadCloud className="h-6 w-6 text-[#0D1F3D]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#0D1F3D]">
                  Drag & Drop your CSV spreadsheet here or click to browse
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Accepts standard <code className="font-mono text-slate-700 font-bold">.csv</code> files with custom header names up to 250 rows per batch.
                </p>
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void processFile(file);
                }}
                className="hidden"
                id="lead-file-input"
              />
              <label htmlFor="lead-file-input" className="inline-block pt-1">
                <span className="inline-flex items-center gap-2 cursor-pointer rounded-sm bg-[#0D1F3D] hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors">
                  <FileText className="h-4 w-4 text-white" /> Browse CSV File
                </span>
              </label>
            </div>
          )}
        </div>

        {/* 3. CSV Column Field Mapping Section */}
        {parsedHeaders.length > 0 && (
          <div className="space-y-4 rounded-sm border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-[#0D1F3D] flex items-center gap-2">
                  <Columns className="h-4 w-4 text-blue-600" /> CSV Column Field Mapping
                  <span className="rounded-sm bg-blue-100 px-2 py-0.5 text-xs font-mono font-bold text-blue-800 border border-blue-200">
                    {activeMappedCount} of {parsedHeaders.length} Mapped
                  </span>
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Map each header in your spreadsheet to the corresponding CRM lead field. Columns marked "Skip" will be ignored.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={autoMatchAll}
                  className="flex items-center gap-1.5 text-xs font-bold border-slate-300 text-slate-700 bg-white hover:bg-slate-100 rounded-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Auto-Match All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={resetMappings}
                  className="flex items-center gap-1.5 text-xs font-bold border-slate-300 text-slate-600 bg-white hover:bg-slate-100 rounded-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" /> Reset Mappings
                </Button>
              </div>
            </div>

            {/* Field Mapping Grid Table */}
            <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 w-1/3">CSV Column Header</th>
                    <th className="px-4 py-2.5 w-1/3">Sample Values (Row 1 & 2)</th>
                    <th className="px-4 py-2.5 w-1/3">Mapped CRM Lead Field</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {parsedHeaders.map((header, idx) => {
                    const mappedValue = columnMapping[header] || "SKIP";
                    const isSkipped = mappedValue === "SKIP";
                    const sample1 = parsedRows[0]?.[idx] || "";
                    const sample2 = parsedRows[1]?.[idx] || "";
                    const samplesText = [sample1, sample2].filter(Boolean).join(" • ");

                    return (
                      <tr
                        key={header}
                        className={`transition-colors ${
                          isSkipped ? "bg-slate-50/40 text-slate-400" : "bg-white hover:bg-blue-50/30"
                        }`}
                      >
                        {/* Column Header Name */}
                        <td className="px-4 py-3 align-middle">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-[#0D1F3D] text-xs font-mono">
                              {header}
                            </span>
                            <div>
                              {isSkipped ? (
                                <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                                  Skipped Column
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200">
                                  <Check className="h-2.5 w-2.5 text-emerald-600" /> Active Mapping
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Sample Data Preview */}
                        <td className="px-4 py-3 align-middle text-slate-500 font-mono text-[11px] truncate max-w-xs">
                          {samplesText ? (
                            <span title={samplesText}>{samplesText}</span>
                          ) : (
                            <span className="text-slate-300 italic">Empty in first 2 rows</span>
                          )}
                        </td>

                        {/* Dropdown Selector */}
                        <td className="px-4 py-3 align-middle">
                          <select
                            value={mappedValue}
                            onChange={(e) => handleMappingChange(header, e.target.value)}
                            className={`w-full h-9 rounded-sm border px-3 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#0D1F3D] ${
                              isSkipped
                                ? "border-slate-200 bg-slate-50 text-slate-400"
                                : "border-blue-300 bg-blue-50/40 text-[#0D1F3D]"
                            }`}
                          >
                            {CRM_FIELD_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Mapping Tip */}
            <div className="flex items-center gap-2 rounded-sm border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-900 font-medium">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <p>
                <strong className="font-extrabold">Pro Tip:</strong> To successfully create lead records, ensure at least one contact identifier (<strong>Mobile / Phone Number</strong> or <strong>Email Address</strong>) and a name (<strong>Business / Company Name</strong> or <strong>Contact Person Name</strong>) are mapped.
              </p>
            </div>
          </div>
        )}

        {/* 4. Configuration & Source Strategy Panel */}
        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 text-xs font-semibold sm:grid-cols-2">
          <CrmLookup
            id="lead-import-source"
            label="Default Lead Source Strategy"
            kind="lead_source"
            value={defaultSourceValueId}
            onChange={(id) => {
              setDefaultSourceValueId(id);
              setPreview(null);
            }}
          />

          <div className="flex items-center justify-between rounded-sm border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <p className="font-extrabold text-[#0D1F3D]">Skip Duplicate Records</p>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Automatically skips rows matching existing phone numbers or emails.
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

        {/* 5. Error Display */}
        {mutation.error && <CrmFailure error={mutation.error} />}

        {/* 6. Validation Summary KPI Stat Cards & Preview Roster */}
        {preview && (
          <div className="space-y-4 rounded-sm border border-slate-200 bg-slate-50/80 p-5 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <h3 className="text-sm font-extrabold text-[#0D1F3D] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" /> Validation & Audit Results
              </h3>
              <span className="text-xs font-mono font-bold text-slate-600">
                Batch Analysis Complete
              </span>
            </div>

            {/* 4 KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs">
                <span className="text-slate-500 font-semibold block mb-1">Total Rows Analyzed</span>
                <span className="text-2xl font-mono font-extrabold text-[#0D1F3D]">
                  {preview.totalRows}
                </span>
              </div>

              <div className="rounded-sm border border-emerald-200 bg-emerald-50/60 p-3.5 shadow-2xs">
                <span className="text-emerald-800 font-semibold block mb-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Ready to Import
                </span>
                <span className="text-2xl font-mono font-extrabold text-emerald-700">
                  {preview.readyRows}
                </span>
              </div>

              <div className="rounded-sm border border-amber-200 bg-amber-50/60 p-3.5 shadow-2xs">
                <span className="text-amber-800 font-semibold block mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Duplicates Detected
                </span>
                <span className="text-2xl font-mono font-extrabold text-amber-700">
                  {preview.duplicateRows}
                </span>
              </div>

              <div className="rounded-sm border border-rose-200 bg-rose-50/60 p-3.5 shadow-2xs">
                <span className="text-rose-800 font-semibold block mb-1 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5 text-rose-600" /> Rejected / Errors
                </span>
                <span className="text-2xl font-mono font-extrabold text-rose-700">
                  {preview.rejectedRows}
                </span>
              </div>
            </div>

            {/* Preview Data Table */}
            <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
              <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#0D1F3D]">Row Validation Roster</h4>
                <span className="text-[11px] font-semibold text-slate-500">Showing all {preview.rows.length} parsed row(s)</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5 font-mono">Row #</th>
                      <th className="px-4 py-2.5">Validation Status</th>
                      <th className="px-4 py-2.5">Validation Details / Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {preview.rows.map((row) => {
                      const isReady = row.status === "READY";
                      const isDuplicate = row.status === "DUPLICATE";
                      return (
                        <tr key={row.rowNumber} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-600">
                            #{row.rowNumber}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5 text-[11px] font-extrabold border ${
                                isReady
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : isDuplicate
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {isReady ? (
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              ) : isDuplicate ? (
                                <AlertTriangle className="h-3 w-3 text-amber-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-rose-600" />
                              )}
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 font-medium">
                            {row.errors.length > 0 ? (
                              <span className="text-rose-600 font-bold">{row.errors.join(", ")}</span>
                            ) : isDuplicate ? (
                              <span className="text-amber-700 font-semibold">Phone number or email matches existing record (Will be skipped)</span>
                            ) : (
                              <span className="text-emerald-700 font-semibold">Valid lead record ready for import</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => navigate("/admin/leads")}
            className="font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handlePreview}
              isLoading={mutation.pending}
              disabled={!selectedFile || activeMappedCount === 0}
              className="flex items-center gap-2 font-bold border-slate-300 text-[#0D1F3D] hover:bg-slate-100 rounded-sm"
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-600" />
              Validate & Preview Rows
            </Button>

            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleImport}
              isLoading={mutation.pending}
              disabled={!preview || preview.readyRows === 0}
              className="flex items-center gap-2 font-bold bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm shadow-xs"
            >
              <CheckCircle2 className="h-4 w-4 text-white" />
              {preview ? `Commit ${preview.readyRows} Ready Records` : "Import Records"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

