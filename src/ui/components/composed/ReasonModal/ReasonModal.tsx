'use client';

import {
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  Text,
  Textarea,
} from '@lunaticwithaduck/webui';
import { type ComponentProps, type ReactNode, useState } from 'react';
import styles from './ReasonModal.styles';

type ButtonVariant = ComponentProps<typeof Button>['variant'];

type ReasonModalProps = {
  /** Renders the trigger; call the supplied `open` to show the modal. */
  trigger: (open: () => void) => ReactNode;
  title: string;
  description?: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Confirm-button variant — defaults to `primary`; pass `destructive` for bans/removals. */
  confirmVariant?: ButtonVariant;
  /** Shown when `onConfirm` rejects. */
  errorMessage: string;
  /** Extra gating on top of the (by default required) non-empty reason. */
  confirmDisabled?: boolean;
  /** Whether a non-empty reason is required to confirm (default true). */
  reasonRequired?: boolean;
  /** Extra fields rendered above the reason textarea (amount, radios, …). */
  children?: ReactNode;
  /** Fired on every open/close — lets callers reset their own extra-field state. */
  onOpenChange?: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
};

/**
 * The reason-capture confirm modal shared across the admin action surfaces: a
 * trigger, a modal with an optional extra-field slot + a required reason, and a
 * cancel/confirm pair that guards against dismissal mid-request. `submitting`
 * spans the `onConfirm` await, so it stands in for the caller's mutation
 * `isLoading`. Extra fields (amount, radios) live in `children`; the caller owns
 * their state and reads them inside `onConfirm`.
 */
export default function ReasonModal({
  trigger,
  title,
  description,
  reasonLabel,
  reasonPlaceholder,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  errorMessage,
  confirmDisabled = false,
  reasonRequired = true,
  children,
  onOpenChange,
  onConfirm,
}: ReasonModalProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setOpenState = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    if (!next) {
      setReason('');
      setError(null);
    }
    setOpenState(next);
  };

  const handleConfirm = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
      setOpenState(false);
    } catch {
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const reasonOk = !reasonRequired || reason.trim().length > 0;
  const canConfirm = reasonOk && !confirmDisabled;

  return (
    <>
      {trigger(() => {
        setReason('');
        setError(null);
        setOpenState(true);
      })}
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {title}
            </Text>
          </ModalTitle>
          {description ? (
            <ModalDescription>
              <Text as="span" size="sm" color="muted">
                {description}
              </Text>
            </ModalDescription>
          ) : null}
          {children}
          <Textarea
            label={reasonLabel}
            placeholder={reasonPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error ? (
            <Text as="span" size="sm" color="destructive">
              {error}
            </Text>
          ) : null}
          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              size="sm"
              loading={submitting}
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
