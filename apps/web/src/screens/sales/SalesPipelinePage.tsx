import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  Phone,
  Monitor,
  Trophy,
  Target,
  Plus,
  Building2,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DatePicker } from "../../components/ui/DatePicker";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Modal } from "../../components/ui/Modal";
import { useCrm, useCrmQuery, useCrmMutation } from "../../features/crm/CrmContext";
import { DealDto } from "../../features/crm/crm.types";
import { CrmFailure } from "../../features/crm/CrmControls";
import { useAppSelector } from "../../store";

const defaultStages = [
  { id: "new", code: "new", title: "New Deals", routeKey: "prospects", color: "#3B82F6", badgeBg: "bg-blue-50", badgeText: "text-blue-700", badgeBorder: "border-blue-200" },
  { id: "contacted", code: "contacted", title: "Contacted", routeKey: "contacted", color: "#8B5CF6", badgeBg: "bg-purple-50", badgeText: "text-purple-700", badgeBorder: "border-purple-200" },
  { id: "demo", code: "demo", title: "Demo Scheduled", routeKey: "demo", color: "#EAB308", badgeBg: "bg-amber-50", badgeText: "text-amber-700", badgeBorder: "border-amber-200" },
  { id: "negotiation", code: "negotiation", title: "Negotiation", routeKey: "negotiation", color: "#F97316", badgeBg: "bg-orange-50", badgeText: "text-orange-700", badgeBorder: "border-orange-200" },
  { id: "won", code: "won", title: "Won", routeKey: "won", color: "#22C55E", badgeBg: "bg-emerald-50", badgeText: "text-emerald-700", badgeBorder: "border-emerald-200" },
  { id: "lost", code: "lost", title: "Lost", routeKey: "lost", color: "#EF4444", badgeBg: "bg-red-50", badgeText: "text-red-600", badgeBorder: "border-red-200" },
];

export default function SalesPipelinePage() {
  const navigate = useNavigate();
  const { can, readOnly } = useCrm();
  const roleCode = useAppSelector((state) => state.authorization.tenant?.roleCode);
  const isFieldExecutive = ['field_executive', 'sales_executive', 'executive'].includes(roleCode?.toLowerCase() ?? '');
  const mutation = useCrmMutation();

  // Drag and Drop & Selection state
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  // Victory / Won Deal Confirmation Modal State
  const [wonModalDeal, setWonModalDeal] = useState<DealDto | null>(null);
  const [wonDealAmount, setWonDealAmount] = useState<number | "">("");
  const [wonDealNotes, setWonDealNotes] = useState<string>("");
  const [wonDealDate, setWonDealDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // Filter States
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedExec, setSelectedExec] = useState("all");
  const [pipelineDate, setPipelineDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Queries
  const summaryResult = useCrmQuery("deals-summary", (s, signal) =>
    s.dealSummary(signal),
  );
  const dealsResult = useCrmQuery("deals-list", (s, signal) =>
    s.deals({ limit: 200 }, signal),
  );
  const mastersResult = useCrmQuery("deal-stage-masters", (s, signal) =>
    can('system.masters.view') ? s.masters("deal_stage", {}, signal) :
      Promise.resolve({ items: [], total: 0, page: 1, limit: 25, totalPages: 0 }),
  );

  const [localDeals, setLocalDeals] = useState<DealDto[]>([]);

  React.useEffect(() => {
    const items = (dealsResult.data as { items?: DealDto[] } | undefined)?.items;
    if (items) {
      setLocalDeals(items);
    }
  }, [dealsResult.data]);

  const deals: DealDto[] =
    localDeals.length > 0
      ? localDeals
      : ((dealsResult.data as { items?: DealDto[] } | undefined)?.items || []);

  const isInitialLoading = dealsResult.loading && !dealsResult.data && localDeals.length === 0;
  const summary = summaryResult.data;

  // Build active stages list combining default and tenant master values
  const masterValues = mastersResult.data?.items || [];
  const stagesList = defaultStages.map((defStage) => {
    const matchedMaster = masterValues.find(
      (m) =>
        (m.code && m.code.toLowerCase() === defStage.code.toLowerCase()) ||
        (m.name && m.name.toLowerCase() === defStage.code.toLowerCase()) ||
        (m.name && m.name.toLowerCase() === defStage.title.toLowerCase()),
    );
    const summaryStage = summary?.stages.find(
      (s) => s.code.toLowerCase() === defStage.code.toLowerCase(),
    );
    return {
      ...defStage,
      id: matchedMaster?.id || defStage.id,
      title: matchedMaster?.name || defStage.title,
      count: summaryStage?.count ?? deals.filter((d: DealDto) => (d.stage || "").toLowerCase() === defStage.code.toLowerCase()).length,
      value: summaryStage?.value ?? 0,
    };
  });

  const topDeal = React.useMemo(() => {
    if (deals.length === 0) return null;
    return [...deals].sort((a: DealDto, b: DealDto) => Number(b.amount || 0) - Number(a.amount || 0))[0];
  }, [deals]);

  const handleCardClick = (deal: DealDto) => {
    if (deal.leadId) {
      navigate(`/admin/leads/${deal.leadId}`);
    } else {
      toast.info(`Deal ${deal.dealCode}: ${deal.title}`);
    }
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("text/plain", dealId);
    setDraggedDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStageId(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStageId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStageCode: string) => {
    e.preventDefault();
    setDragOverStageId(null);
    const dealId = e.dataTransfer.getData("text/plain") || draggedDealId;
    if (!dealId || readOnly || !can("crm.leads.update")) return;

    const foundDeal = deals.find((d) => d.id === dealId);
    if (foundDeal && foundDeal.stage.toLowerCase() !== targetStageCode.toLowerCase()) {
      // If deal is moved to "won", trigger victory confirmation modal instead of immediate update
      if (targetStageCode.toLowerCase() === "won") {
        setWonModalDeal(foundDeal);
        setWonDealAmount(foundDeal.amount || "");
        setWonDealNotes(foundDeal.description || "");
        setWonDealDate(new Date().toISOString().split("T")[0]);
        setDraggedDealId(null);
        return;
      }

      const prevDeals = [...deals];
      // Instant optimistic update so card moves immediately with zero flicker:
      setLocalDeals((curr) =>
        curr.map((d) =>
          d.id === foundDeal.id ? { ...d, stage: targetStageCode } : d,
        ),
      );

      const outcome = await mutation.run(async (s, signal) => {
        return s.updateDealStage(
          foundDeal.id,
          {
            stage: targetStageCode,
            expectedRevision: foundDeal.revision,
          },
          signal,
        );
      });

      if (outcome) {
        toast.success(`Moved deal "${foundDeal.title}" to ${targetStageCode.toUpperCase()}`);
        dealsResult.reload();
        summaryResult.reload();
      } else {
        // Revert on failure
        setLocalDeals(prevDeals);
      }
    }
    setDraggedDealId(null);
  };

  const handleConfirmWonDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wonModalDeal) return;
    const finalAmount = Number(wonDealAmount) || 0;

    const outcome = await mutation.run(async (s, signal) => {
      return s.updateDeal(
        wonModalDeal.id,
        {
          stage: "won",
          amount: finalAmount,
          description: wonDealNotes || null,
          expectedClosingDate: wonDealDate ? new Date(wonDealDate + "T00:00:00").toISOString() : null,
          expectedRevision: wonModalDeal.revision,
        },
        signal,
      );
    });

    if (outcome) {
      toast.success(
        `🎉 Victory! Deal "${wonModalDeal.title}" closed WON for ₹${finalAmount.toLocaleString("en-IN")}!`
      );
      setWonModalDeal(null);
      dealsResult.reload();
      summaryResult.reload();
    }
  };

  const totalDeals = summary?.totalDeals ?? deals.length;
  const totalValue = summary?.totalPipelineValue ?? deals.reduce((sum: number, d: DealDto) => sum + (d.amount || 0), 0);

  return (
    <div className="space-y-5 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & PAGE HEADER */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span
            className="hover:text-purple-600 cursor-pointer"
            onClick={() => navigate("/admin/dashboard")}
          >
            Dashboard
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span
            className="hover:text-purple-600 cursor-pointer"
            onClick={() => navigate("/admin/leads")}
          >
            Sales & Field
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[#0D1F3D] font-bold">Sales Pipeline</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Sales Pipeline</h1>
            <p className="text-xs font-semibold text-slate-500">
              {isFieldExecutive ? 'Deals linked to leads assigned to you.' : 'Track active deal progress, revenue forecast, and stage conversions across your field team.'}
            </p>
          </div>

          {/* Header Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                dealsResult.reload();
                summaryResult.reload();
              }}
              className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 bg-white"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>

            {!isFieldExecutive && <div className="w-44">
              <DatePicker
                value={pipelineDate}
                onChange={(d) => {
                  setPipelineDate(d);
                  toast.success(`Pipeline filtered for ${d}`);
                }}
              />
            </div>}

            {!isFieldExecutive && <div className="w-40">
              <Select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                options={[
                  { value: "all", label: "All Teams" },
                  { value: "western", label: "Western Suburbs" },
                  { value: "central", label: "Central Suburbs" },
                  { value: "thane", label: "Thane Cluster" },
                ]}
                searchable={false}
              />
            </div>}

            {!isFieldExecutive && <div className="w-44">
              <Select
                value={selectedExec}
                onChange={(e) => setSelectedExec(e.target.value)}
                options={[
                  { value: "all", label: "All Executives" },
                  { value: "amit", label: "Amit Verma" },
                  { value: "neha", label: "Neha Sharma" },
                  { value: "rahul", label: "Rahul Gupta" },
                ]}
                searchable={false}
              />
            </div>}

            <Button
              variant="accent"
              size="sm"
              disabled={readOnly || !can("crm.leads.create")}
              onClick={() => navigate("/admin/leads/create")}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md px-4 py-2.5"
            >
              <Plus className="h-4 w-4" /> Add Lead
            </Button>
          </div>
        </div>
      </div>

      {/* TOP KPI METRICS SUMMARY GRID (5 CARDS) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Pipeline Value</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">
              ₹{totalValue.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              {isFieldExecutive ? 'Your assigned pipeline' : '▲ Live Workspace Total'}
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Deals</span>
            <span className="text-2xl font-extrabold text-[#0D1F3D]">{totalDeals}</span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              Active opportunities
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
            <Phone className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Demo Scheduled</span>
            <span className="text-2xl font-extrabold text-[#0D1F3D]">
              {stagesList.find((s) => s.code === "demo")?.count ?? 0}
            </span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              Scheduled Demos
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Monitor className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Won Deals</span>
            <span className="text-2xl font-extrabold text-[#0D1F3D]">
              {stagesList.find((s) => s.code === "won")?.count ?? 0}
            </span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              Closed Won
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <Trophy className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Win Rate</span>
            <span className="text-2xl font-extrabold text-[#0D1F3D]">
              {totalDeals > 0
                ? `${Math.round(((stagesList.find((s) => s.code === "won")?.count ?? 0) / totalDeals) * 100)}%`
                : "0%"}
            </span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              Overall conversion
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <Target className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* FULL-WIDTH KANBAN PIPELINE BOARD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#0D1F3D]">Sales Pipeline Stages</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {stagesList.length} Active Stages{!readOnly && can('crm.leads.update') ? ' • Drag deal cards to change stage' : ''}
            </span>
            {dealsResult.loading && !isInitialLoading && (
              <RefreshCw className="h-3 w-3 text-slate-400 animate-spin" />
            )}
          </div>
        </div>

        {dealsResult.error ? <CrmFailure error={dealsResult.error} retry={dealsResult.reload} /> : summaryResult.error ? <CrmFailure error={summaryResult.error} retry={summaryResult.reload} /> : isInitialLoading ? (
          <div className="min-h-[460px] flex flex-col items-center justify-center text-center text-xs font-semibold text-slate-500 bg-white rounded-md border border-slate-200">
            <div className="inline-block animate-spin h-6 w-6 border-2 border-[#0D1F3D] border-t-transparent rounded-full mb-2" />
            <p>Loading active deals from workspace...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start min-h-[460px]">
            {stagesList.map((stg) => {
              const stageDeals = deals.filter(
                (d: DealDto) => (d.stage || "").toLowerCase() === stg.code.toLowerCase(),
              );
              const isDragOver = dragOverStageId === stg.code;

              return (
                <div
                  key={stg.code}
                  onDragOver={(e) => handleDragOver(e, stg.code)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stg.code)}
                  className={`space-y-3 rounded-md p-3 border transition-all ${
                    isDragOver
                      ? "bg-purple-50/80 border-purple-400 ring-2 ring-purple-400/30"
                      : "bg-slate-100/70 border-slate-200/80"
                  }`}
                >
                  {/* Column Header */}
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/sales/${stg.routeKey}`)}
                    className="flex w-full items-center justify-between rounded-md bg-white p-2.5 border border-slate-200/90 shadow-2xs cursor-pointer hover:border-purple-300 transition text-left"
                  >
                    <span className="text-xs font-extrabold text-[#0D1F3D]">
                      {stg.title}{" "}
                      <span className="text-slate-500 font-bold">({stg.count})</span>
                    </span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: stg.color }}
                    />
                  </button>

                  {/* Column Card List */}
                  <div className="space-y-2.5 min-h-[280px]">
                    {stageDeals.length === 0 ? (
                      <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-md bg-white/50">
                        <span className="text-[11px] font-semibold text-slate-400 block">
                          No deals in {stg.title}
                        </span>
                      </div>
                    ) : (
                      stageDeals.map((deal: DealDto) => {
                        const isBeingDragged = draggedDealId === deal.id;
                        const businessName =
                          deal.account?.name ||
                          deal.lead?.businessName ||
                          deal.lead?.name ||
                          deal.title;
                        const city = deal.account?.city || deal.lead?.phone || deal.dealCode;
                        const assigned = deal.assignedMembership;
                        const owner = deal.ownerMembership;
                        const member = assigned || owner;
                        const execName = member?.displayName || "Unassigned";
                        const avatarUrl = member?.avatarUrl;

                        return (
                          <button
                            type="button"
                            key={deal.id}
                            draggable={!readOnly && can('crm.leads.update')}
                            onDragStart={(e) => handleDragStart(e, deal.id)}
                            onDragEnd={() => setDraggedDealId(null)}
                            onClick={() => handleCardClick(deal)}
                            className={`w-full text-left rounded-md border border-slate-200/90 bg-white p-3 shadow-xs space-y-2.5 cursor-pointer hover:border-purple-600 hover:shadow-md transition-all group ${
                              isBeingDragged
                                ? "opacity-40 scale-95 border-dashed border-purple-500"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold mt-0.5">
                                <Building2 className="h-3.5 w-3.5" />
                              </div>
                              <div className="truncate">
                                <h4 className="text-xs font-extrabold text-[#0D1F3D] group-hover:text-purple-600 transition truncate">
                                  {businessName}
                                </h4>
                                <p className="text-[10px] font-semibold text-slate-400 truncate">
                                  {city}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 text-xs">
                              {deal.amount && deal.amount > 0 ? (
                                <span className="font-extrabold text-[#0D1F3D] text-xs">
                                  ₹{Number(deal.amount).toLocaleString("en-IN")}
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-400 italic">
                                  Value Unspecified
                                </span>
                              )}
                              <span className="text-[10px] font-medium text-slate-400">
                                {new Date(deal.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                              <div className="flex items-center gap-1.5">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={execName}
                                    className="h-5 w-5 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="h-5 w-5 rounded-full bg-[#0D1F3D] text-white flex items-center justify-center text-[9px] font-bold">
                                    {execName.slice(0, 1).toUpperCase()}
                                  </div>
                                )}
                                <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[85px]">
                                  {execName}
                                </span>
                              </div>

                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold border ${stg.badgeBg} ${stg.badgeText} ${stg.badgeBorder}`}
                              >
                                {stg.title}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/admin/sales/${stg.routeKey}`)}
                    className="w-full text-center text-xs font-bold text-slate-600 hover:text-purple-700 py-1.5 rounded-md hover:bg-white transition cursor-pointer"
                  >
                    + View All ({stg.count})
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTTOM ANALYTICS WIDGETS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* CARD 1: TOP DEAL SPOTLIGHT */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0D1F3D]">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Top Active Deal</span>
            </div>
            <span className="rounded-full bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 text-[10px] font-extrabold">
              🔥 Hot Opportunity
            </span>
          </div>

          {topDeal ? (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0D1F3D]">
                  {topDeal.account?.name || topDeal.lead?.businessName || topDeal.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400">{topDeal.dealCode}</p>
                <p className="text-base font-black text-purple-700 mt-0.5">
                  ₹{Number(topDeal.amount || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-500 italic py-3">
              No active deals currently registered.
            </p>
          )}

          <Button
            variant="accent"
            fullWidth
            size="sm"
            onClick={() => topDeal?.leadId ? navigate(`/admin/leads/${topDeal.leadId}`) : navigate("/admin/leads")}
            className="font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md text-xs py-2"
          >
            View Opportunity Details
          </Button>
        </div>

        {/* CARD 2: PIPELINE VALUE BREAKDOWN */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Pipeline Value Distribution</h3>
            <span className="text-[11px] font-semibold text-slate-500">
              ₹{totalValue.toLocaleString("en-IN")} Total
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold pt-1">
            {stagesList.map((stg) => {
              const pct = totalValue > 0 ? Math.round((stg.value / totalValue) * 100) : 0;
              return (
                <div key={stg.code} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: stg.color }}
                  />
                  <span className="text-slate-600 truncate">{stg.title}</span>
                  <span className="font-extrabold text-[#0D1F3D] ml-auto">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 3: SALES INSIGHTS METRICS */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Sales Performance Insights
          </h3>

          <div className="space-y-2.5 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Win Rate Conversion</span>
              <span className="font-extrabold text-[#0D1F3D]">
                {totalDeals > 0
                  ? `${Math.round(((stagesList.find((s) => s.code === "won")?.count ?? 0) / totalDeals) * 100)}%`
                  : "0%"}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-600">Average Deal Size</span>
              <span className="font-extrabold text-[#0D1F3D]">
                ₹
                {totalDeals > 0
                  ? Math.round(totalValue / totalDeals).toLocaleString("en-IN")
                  : "0"}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-600">Deals in Active Pipeline</span>
              <span className="font-extrabold text-[#0D1F3D]">{totalDeals} deals</span>
            </div>
          </div>
        </div>
      </div>

      {/* DEAL WON VICTORY & VALUE CONFIRMATION MODAL */}
      {wonModalDeal && (
        <Modal
          isOpen={Boolean(wonModalDeal)}
          onClose={() => setWonModalDeal(null)}
          maxWidth="max-w-lg"
          panelClassName="p-0 overflow-hidden rounded-xl shadow-2xl border border-slate-200"
        >
          <div className="space-y-0 text-left font-sans">
            {/* Victory Header Banner */}
            <div className="relative bg-gradient-to-r from-[#0D1F3D] via-[#122b54] to-emerald-950 p-6 text-white overflow-hidden border-b border-emerald-500/30">
              <div className="absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-emerald-500/10 blur-xl" />
              <div className="absolute right-16 -top-12 h-28 w-28 rounded-full bg-blue-500/10 blur-xl" />

              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-[11px] font-mono font-bold text-emerald-300">
                    <Sparkles className="h-3 w-3 text-emerald-400" /> CLOSED-WON VICTORY
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {wonModalDeal.dealCode}
                  </span>
                </div>

                <div className="flex items-start gap-3.5 pt-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 font-black shadow-lg shrink-0 ring-4 ring-amber-400/20">
                    <Trophy className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white">
                      🎉 Deal Closed & Won!
                    </h2>
                    <p className="text-xs font-medium text-slate-300 mt-0.5">
                      Confirm the final revenue contract amount to lock this victory into sales targets & performance reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleConfirmWonDeal} className="p-6 space-y-5 bg-white">
              {/* Deal Summary Box */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-600 shrink-0" />
                    <span className="text-xs font-extrabold text-[#0D1F3D]">
                      {wonModalDeal.account?.name || wonModalDeal.lead?.businessName || wonModalDeal.title}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-sm border border-emerald-200">
                    Target Credit Ready
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-200/60 font-semibold text-slate-600">
                  <span>Assigned Executive:</span>
                  <span className="text-[#0D1F3D] font-extrabold">
                    {wonModalDeal.assignedMembership?.displayName || wonModalDeal.ownerMembership?.displayName || "Field Executive"}
                  </span>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Input
                    id="won-deal-amount"
                    label="Confirmed Final Contract Amount (₹) *"
                    type="number"
                    min="0"
                    required
                    value={wonDealAmount}
                    onChange={(e) => setWonDealAmount(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 250000"
                  />

                  {/* Quick Preset Shortcut Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="text-xs font-bold text-[#0D1F3D] mr-1">Quick Presets:</span>
                    {[50000, 100000, 250000, 500000, 1000000].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setWonDealAmount(amt)}
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border transition-all ${
                          wonDealAmount === amt
                            ? "bg-[#0D1F3D] text-white border-[#0D1F3D] shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-[#0D1F3D]"
                        }`}
                      >
                        ₹{(amt / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Picker Reusable Component */}
                <DatePicker
                  label="Closing Date *"
                  value={wonDealDate}
                  onChange={(d) => setWonDealDate(d)}
                />

                {/* Textarea Reusable Component */}
                <Textarea
                  id="won-deal-notes"
                  label="Closing Remarks / Revenue Notes"
                  rows={3}
                  value={wonDealNotes}
                  onChange={(e) => setWonDealNotes(e.target.value)}
                  placeholder="e.g. 1-year contract signed, advance payment processed via NEFT..."
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={mutation.pending}
                  onClick={() => setWonModalDeal(null)}
                  className="font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={mutation.pending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-sm px-6 py-2.5 shadow-xs flex items-center gap-2 text-xs"
                >
                  <Sparkles className="h-4 w-4 text-white" />
                  Confirm Victory & Lock Deal
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

