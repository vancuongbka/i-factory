import { useState, useCallback } from 'react';

interface DialogState {
  message: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const openConfirm = useCallback(
    (message: string, onConfirm: () => void, opts?: { description?: string; confirmLabel?: string }) => {
      setDialog({ message, onConfirm, ...opts });
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    dialog?.onConfirm();
    setDialog(null);
  }, [dialog]);

  const handleCancel = useCallback(() => {
    setDialog(null);
  }, []);

  return { openConfirm, handleConfirm, handleCancel, dialog };
}
