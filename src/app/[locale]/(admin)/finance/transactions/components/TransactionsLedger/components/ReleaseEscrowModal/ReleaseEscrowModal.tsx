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
import { Unlock } from 'lucide-react';
import { useState } from 'react';
import type { TransactionRow } from '@/api/admin-finance-endpoints';
import { useReleaseEscrowMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { RELEASE_LABELS } from './config/constants';
import styles from './ReleaseEscrowModal.styles';

export default function ReleaseEscrowModal({ transaction }: { transaction: TransactionRow }) {
  const [releaseEscrow, { isLoading }] = useReleaseEscrowMutation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const eligible =
    transaction.type === 'escrow_hold' &&
    Boolean(transaction.jobCompleted) &&
    Boolean(transaction.jobId);
  if (!can(PERMISSIONS.finance) || !eligible || !transaction.jobId) return null;

  const jobId = transaction.jobId;

  const handleConfirm = async () => {
    setError(null);
    try {
      await releaseEscrow({ jobId, reason: reason.trim(), txnId: transaction.id }).unwrap();
      setOpen(false);
    } catch {
      setError(RELEASE_LABELS.error);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setError(null);
    if (!isLoading) setOpen(next);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        iconLeft={Unlock}
        onClick={() => setOpen(true)}
      >
        {RELEASE_LABELS.trigger}
      </Button>
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {RELEASE_LABELS.title}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {RELEASE_LABELS.body}
            </Text>
          </ModalDescription>
          <Textarea
            label={RELEASE_LABELS.reasonLabel}
            placeholder={RELEASE_LABELS.reasonPlaceholder}
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
              disabled={isLoading}
            >
              {RELEASE_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isLoading}
              disabled={reason.trim().length === 0}
              onClick={handleConfirm}
            >
              {RELEASE_LABELS.confirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
