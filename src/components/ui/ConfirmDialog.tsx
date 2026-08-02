import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel(): void;
  onConfirm(): void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} description={description} onClose={onCancel}>
      <div className="modal-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Processando...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
