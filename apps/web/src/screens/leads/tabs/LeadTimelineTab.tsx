import React, { useState } from "react";
import { Clock, FileText, Plus, UserCheck, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import {
  useCrmMutation,
  useCrmQuery,
} from "../../../features/crm/CrmContext";
import { CrmFailure } from "../../../features/crm/CrmControls";

const iconFor = (eventType: string) => {
  if (eventType === "assigned" || eventType === "reassigned")
    return <UserCheck className="h-3 w-3 text-purple-600" />;
  if (eventType === "converted" || eventType === "qualified")
    return <CheckCircle2 className="h-3 w-3 text-emerald-600" />;
  return <FileText className="h-3 w-3 text-blue-600" />;
};

export function LeadTimelineTab({ leadId }: { leadId: string }) {
  const history = useCrmQuery("lead-history:" + leadId, (service, signal) =>
    service.leads.history(leadId, signal),
  );
  const mutation = useCrmMutation();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const addNote = async () => {
    const saved = await mutation.run((service, signal) =>
      service.leads.addNote(leadId, { note }, signal),
    );
    if (saved) {
      setNote("");
      setNoteOpen(false);
      history.reload();
    }
  };

  return (
    <div className="space-y-6 rounded-sm border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="flex items-center gap-2 text-base font-extrabold text-[#0D1F3D]">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Lead Timeline</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Product activity for this lead: lifecycle changes, assignment,
            conversion, and notes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 font-bold"
          onClick={() => setNoteOpen(true)}
        >
          <Plus className="h-4 w-4 text-[#0D1F3D]" /> Log Note
        </Button>
      </div>

      {history.error ? (
        <CrmFailure error={history.error} retry={history.reload} />
      ) : (
        <div className="relative space-y-6 pl-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-0.5 before:bg-slate-200">
          {(history.data?.items ?? []).map((event) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-[30px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0D1F3D] bg-white text-[#0D1F3D] shadow-xs">
                {iconFor(event.eventType)}
              </div>
              <div className="space-y-2 rounded-sm border border-slate-200/80 bg-slate-50/50 p-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-extrabold text-[#0D1F3D]">
                    {event.message}
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
                {event.note && (
                  <p className="font-semibold leading-relaxed text-slate-700">
                    {event.note}
                  </p>
                )}
                <div className="flex items-center gap-2 border-t border-slate-200/60 pt-2">
                  {event.actor.avatarUrl ? (
                    <img
                      src={event.actor.avatarUrl}
                      alt={event.actor.displayName}
                      className="h-5 w-5 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-600">
                      {event.actor.displayName.slice(0, 1)}
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-slate-800">
                    {event.actor.displayName}
                  </span>
                  {event.actor.role && (
                    <span className="text-[10px] text-slate-400">
                      ({event.actor.role})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!history.loading && !history.data?.items.length && (
            <div className="rounded-sm border border-slate-200 bg-slate-50 p-6 text-sm font-medium text-slate-500">
              No activity has been recorded yet.
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={noteOpen}
        title="Log Lead Note"
        onClose={() => {
          if (!mutation.pending) setNoteOpen(false);
        }}
      >
        <div className="space-y-4">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={2000}
            rows={6}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-[#0D1F3D] shadow-xs outline-none focus:border-[#0D1F3D]"
            placeholder="Write a note for this lead"
          />
          {mutation.error && <CrmFailure error={mutation.error} />}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={mutation.pending}
              onClick={() => setNoteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={mutation.pending || !note.trim()}
              onClick={addNote}
            >
              Save Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
