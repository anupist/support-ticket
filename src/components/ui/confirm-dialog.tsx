'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  /** Hide cancel button (alert mode) */
  alert?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'OK', cancelLabel = 'Cancel', variant = 'default', loading, alert, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={alert ? undefined : onCancel}>
      <div className="bg-card rounded-xl border shadow-lg w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          {!alert && (
            <Button variant="outline" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          )}
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
