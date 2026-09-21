import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface ConfirmTerritoryUnassignModalProps {
  executiveName: string | null;
  territoryName: string;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmTerritoryUnassignModal({
  executiveName,
  territoryName,
  pending,
  error,
  onClose,
  onConfirm,
}: ConfirmTerritoryUnassignModalProps) {
  return (
    <Modal
      isOpen={executiveName !== null}
      onClose={() => { if (!pending) onClose(); }}
      title="Unassign executive"
      maxWidth="max-w-sm"
    >
      <div className="space-y-4 text-sm">
        <p className="text-slate-600">
          Remove <strong className="text-[#0D1F3D]">{executiveName}</strong> from{' '}
          <strong className="text-[#0D1F3D]">{territoryName}</strong>?{' '}
          They will no longer be assigned to this territory. You can assign them again later.
        </p>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onClose}>Cancel</Button>
          <Button type="button" variant="accent" size="sm" isLoading={pending} onClick={onConfirm}>Unassign executive</Button>
        </div>
      </div>
    </Modal>
  );
}
