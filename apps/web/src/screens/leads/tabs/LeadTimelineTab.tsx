import React, { useState, useMemo } from "react";
import {
  Clock,
  Plus,
  UserCheck,
  CheckCircle2,
  StickyNote,
  XCircle,
  FileEdit,
  Search,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import {
  useCrmMutation,
  useCrmQuery,
} from "../../../features/crm/CrmContext";
import { CrmFailure } from "../../../features/crm/CrmControls";

function formatTimelineDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let relative = "Just now";
  if (diffMins >= 1 && diffMins < 60) relative = `${diffMins}m ago`;
  else if (diffHours >= 1 && diffHours < 24) relative = `${diffHours}h ago`;
  else if (diffDays === 1) relative = "Yesterday";
  else if (diffDays > 1 && diffDays < 30) relative = `${diffDays}d ago`;

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { relative, formattedDate, formattedTime };
}

function getEventConfig(eventType: string, message: string) {
  const lowerMsg = (message || "").toLowerCase();
  const lowerType = (eventType || "").toLowerCase();

  if (
    lowerType.includes("convert") ||
    lowerMsg.includes("convert") ||
    lowerType.includes("qualif") ||
    lowerMsg.includes("qualif")
  ) {
    return {
      category: "conversion",
      categoryLabel: "Lifecycle & Conversion",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cardBg:
        "bg-gradient-to-r from-emerald-50/40 via-white to-white border-slate-200/90 border-l-4 border-l-emerald-500 shadow-2xs hover:shadow-xs",
      iconBg: "bg-emerald-600 text-white ring-4 ring-emerald-100",
      Icon: CheckCircle2,
    };
  }
  if (lowerType.includes("assign") || lowerMsg.includes("assign")) {
    return {
      category: "assignment",
      categoryLabel: "Assignment Change",
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
      cardBg:
        "bg-gradient-to-r from-purple-50/40 via-white to-white border-slate-200/90 border-l-4 border-l-purple-500 shadow-2xs hover:shadow-xs",
      iconBg: "bg-purple-600 text-white ring-4 ring-purple-100",
      Icon: UserCheck,
    };
  }
  if (
    lowerType.includes("note") ||
    lowerMsg.includes("note") ||
    lowerMsg.includes("remark")
  ) {
    return {
      category: "note",
      categoryLabel: "Log Note / Remark",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
      cardBg:
        "bg-gradient-to-r from-amber-50/40 via-white to-white border-slate-200/90 border-l-4 border-l-amber-500 shadow-2xs hover:shadow-xs",
      iconBg: "bg-amber-500 text-white ring-4 ring-amber-100",
      Icon: StickyNote,
    };
  }
  if (
    lowerType.includes("disqualif") ||
    lowerMsg.includes("disqualif") ||
    lowerMsg.includes("lost")
  ) {
    return {
      category: "disqualified",
      categoryLabel: "Disqualified / Lost",
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
      cardBg:
        "bg-gradient-to-r from-rose-50/40 via-white to-white border-slate-200/90 border-l-4 border-l-rose-500 shadow-2xs hover:shadow-xs",
      iconBg: "bg-rose-600 text-white ring-4 ring-rose-100",
      Icon: XCircle,
    };
  }
  return {
    category: "update",
    categoryLabel: "Lead Activity",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    cardBg:
      "bg-gradient-to-r from-slate-50/50 via-white to-white border-slate-200/90 border-l-4 border-l-sky-500 shadow-2xs hover:shadow-xs",
    iconBg: "bg-[#0D1F3D] text-white ring-4 ring-slate-100",
    Icon: FileEdit,
  };
}

export function LeadTimelineTab({ leadId }: { leadId: string }) {
  const history = useCrmQuery("lead-history:" + leadId, (service, signal) =>
    service.leads.history(leadId, signal),
  );
  const mutation = useCrmMutation();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [isSubmittingQuickNote, setIsSubmittingQuickNote] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const addNote = async (textToSave?: string) => {
    const finalNote = textToSave || note;
    if (!finalNote.trim()) return;

    if (!textToSave) {
      const saved = await mutation.run((service, signal) =>
        service.leads.addNote(leadId, { note: finalNote }, signal),
      );
      if (saved) {
        setNote("");
        setNoteOpen(false);
        history.reload();
      }
    } else {
      setIsSubmittingQuickNote(true);
      try {
        const saved = await mutation.run((service, signal) =>
          service.leads.addNote(leadId, { note: finalNote }, signal),
        );
        if (saved) {
          setQuickNote("");
          history.reload();
        }
      } finally {
        setIsSubmittingQuickNote(false);
      }
    }
  };

  const rawEvents = history.data?.items ?? [];

  // Filter logic
  const filteredEvents = useMemo(() => {
    return rawEvents.filter((event) => {
      const config = getEventConfig(event.eventType, event.message);

      if (activeCategory === "notes" && config.category !== "note")
        return false;
      if (
        activeCategory === "conversions" &&
        config.category !== "conversion"
      )
        return false;
      if (
        activeCategory === "assignments" &&
        config.category !== "assignment"
      )
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMsg = event.message.toLowerCase().includes(q);
        const matchNote = (event.note || "").toLowerCase().includes(q);
        const matchActor = event.actor.displayName.toLowerCase().includes(q);
        if (!matchMsg && !matchNote && !matchActor) return false;
      }

      return true;
    });
  }, [rawEvents, activeCategory, searchQuery]);

  // Counts for tabs
  const categoryCounts = useMemo(() => {
    const counts = { all: rawEvents.length, notes: 0, conversions: 0, assignments: 0 };
    rawEvents.forEach((evt) => {
      const cfg = getEventConfig(evt.eventType, evt.message);
      if (cfg.category === "note") counts.notes++;
      if (cfg.category === "conversion") counts.conversions++;
      if (cfg.category === "assignment") counts.assignments++;
    });
    return counts;
  }, [rawEvents]);

  return (
    <div className="space-y-6">
      {/* 1. Header Card & Quick Note Composer */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-[#0D1F3D]">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Lead Activity & Audit Timeline</span>
              <span className="rounded-full bg-slate-100 text-[#0D1F3D] px-2.5 py-0.5 text-xs font-mono font-extrabold border border-slate-200">
                {rawEvents.length} Events
              </span>
            </h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Complete chronological audit trail for this lead: status changes, executive assignments, conversions, and team notes.
            </p>
          </div>

          <Button
            variant="accent"
            size="sm"
            className="flex items-center gap-1.5 font-bold shadow-xs"
            onClick={() => setNoteOpen(true)}
          >
            <Plus className="h-4 w-4" /> Log Full Note
          </Button>
        </div>

        {/* Inline Quick Composer Bar */}
        <div className="flex items-center gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
          <MessageSquare className="h-4 w-4 text-slate-400 shrink-0 ml-1.5" />
          <input
            type="text"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && quickNote.trim()) {
                e.preventDefault();
                addNote(quickNote);
              }
            }}
            placeholder="Type a quick note or meeting update for this lead and press Enter..."
            className="flex-1 bg-transparent text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:outline-none"
          />
          <Button
            size="sm"
            disabled={!quickNote.trim() || isSubmittingQuickNote}
            isLoading={isSubmittingQuickNote}
            onClick={() => addNote(quickNote)}
            className="h-8 px-3 text-xs font-bold bg-[#0D1F3D] text-white shrink-0 gap-1 rounded-lg"
          >
            <Send className="h-3 w-3" /> Post Note
          </Button>
        </div>
      </div>

      {/* 2. Timeline Controls: Filter Pills & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs font-bold">
          {[
            { id: "all", label: "All Events", count: categoryCounts.all },
            { id: "notes", label: "Notes & Remarks", count: categoryCounts.notes },
            { id: "conversions", label: "Conversions & Lifecycle", count: categoryCounts.conversions },
            { id: "assignments", label: "Assignments", count: categoryCounts.assignments },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0D1F3D] text-white shadow-2xs font-extrabold"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 font-semibold"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 text-slate-700"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timeline..."
            className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-[#0D1F3D] focus:bg-white"
          />
        </div>
      </div>

      {/* 3. Timeline Audit Stream */}
      {history.error ? (
        <CrmFailure error={history.error} retry={history.reload} />
      ) : (
        <div className="relative space-y-5 pl-7 before:absolute before:bottom-3 before:left-3.5 before:top-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-400 before:via-purple-300 before:to-slate-200">
          {filteredEvents.map((event) => {
            const config = getEventConfig(event.eventType, event.message);
            const { relative, formattedDate, formattedTime } = formatTimelineDate(
              event.createdAt,
            );

            return (
              <div key={event.id} className="relative group">
                {/* Node Indicator Icon */}
                <div
                  className={`absolute -left-[37px] top-3.5 flex h-7 w-7 items-center justify-center rounded-full shadow-xs transition-transform group-hover:scale-110 ${config.iconBg}`}
                >
                  <config.Icon className="h-3.5 w-3.5" />
                </div>

                {/* Event Card Container */}
                <div className={`rounded-xl border p-4 space-y-2.5 transition-all ${config.cardBg}`}>
                  {/* Event Header & Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-[#0D1F3D]">
                        {event.message}
                      </h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${config.badgeBg}`}
                      >
                        {config.categoryLabel}
                      </span>
                    </div>

                    {/* Formatted Date & Relative Time */}
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-xs font-extrabold text-[#0D1F3D]">
                        {relative}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        ({formattedDate} • {formattedTime})
                      </span>
                    </div>
                  </div>

                  {/* Note / Content Body */}
                  {event.note && (
                    <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-3 text-xs font-semibold text-slate-800 leading-relaxed space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-[11px]">
                        <StickyNote className="h-3.5 w-3.5" />
                        <span>Logged Note:</span>
                      </div>
                      <p className="whitespace-pre-wrap text-slate-800 font-semibold">{event.note}</p>
                    </div>
                  )}

                  {/* Actor Executive Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                    <div className="flex items-center gap-2">
                      {event.actor.avatarUrl ? (
                        <img
                          src={event.actor.avatarUrl}
                          alt={event.actor.displayName}
                          className="h-6 w-6 rounded-full border border-slate-200 object-cover shadow-2xs"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-[#0D1F3D] text-white text-[10px] font-extrabold">
                          {event.actor.displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-extrabold text-[#0D1F3D]">
                        {event.actor.displayName}
                      </span>
                      {event.actor.role && (
                        <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold border border-slate-200">
                          {event.actor.role}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      <span>Verified Audit Event</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {!history.loading && filteredEvents.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3 shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#0D1F3D]">
                  No Timeline Events Found
                </h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {searchQuery || activeCategory !== "all"
                    ? "Try adjusting your filter or search criteria."
                    : "No audit events or notes have been logged for this lead yet."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="font-bold text-xs"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Log Note Modal */}
      <Modal
        isOpen={noteOpen}
        title="Log Detailed Lead Note"
        onClose={() => {
          if (!mutation.pending) setNoteOpen(false);
        }}
      >
        <div className="space-y-4 font-sans">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#0D1F3D]">
              Note Details & Activity Remarks
            </label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={2000}
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs font-semibold text-[#0D1F3D] shadow-2xs outline-none focus:border-[#0D1F3D] focus:ring-2 focus:ring-slate-100"
              placeholder="Record details of client call, meeting outcome, pricing requirement, or next steps..."
            />
            <p className="text-[10px] font-semibold text-slate-500 text-right">
              {note.length} / 2000 characters
            </p>
          </div>

          {mutation.error && <CrmFailure error={mutation.error} />}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              disabled={mutation.pending}
              onClick={() => setNoteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={mutation.pending || !note.trim()}
              isLoading={mutation.pending}
              onClick={() => addNote()}
              className="bg-[#0D1F3D] text-white font-bold"
            >
              Save & Log Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
