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
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import type { PayoutRow } from '@/api/admin-finance-endpoints';
import { useApprovePayoutMutation, useRejectPayoutMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { PAYOUT_ACTION_LABELS } from './config/constants';
import styles from './PayoutActions.styles';

export default function PayoutActions({ payout }: { payout: PayoutRow }) {
  const [approvePayout, { isLoading: approving }] = useApprovePayoutMutation();
  const [rejectPayout, { isLoading: rejecting }] = useRejectPayoutMutation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.finance) || payout.status !== 'pending') return null;

  const handleApprove = async () => {
    setError(null);
    try {
      await approvePayout(payout.id).unwrap();
    } catch {
      setError(PAYOUT_ACTION_LABELS.error);
    }
  };

  const handleReject = async () => {
    setError(null);
    try {
      await rejectPayout({ id: payout.id, reason: reason.trim() }).unwrap();
      setOpen(false);
      setReason('');
    } catch {
      setError(PAYOUT_ACTION_LABELS.error);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setError(null);
    if (!rejecting) setOpen(next);
  };

  return (
    <div className={styles.root}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        iconLeft={Check}
        loading={approving}
        onClick={handleApprove}
      >
        {PAYOUT_ACTION_LABELS.approve}
      </Button>
      <Button type="button" variant="ghost" size="sm" iconLeft={X} onClick={() => setOpen(true)}>
        {PAYOUT_ACTION_LABELS.reject}
      </Button>
      {error ? (
        <Text as="span" size="sm" color="destructive">
          {error}
        </Text>
      ) : null}

      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {PAYOUT_ACTION_LABELS.rejectTitle}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {PAYOUT_ACTION_LABELS.rejectBody}
            </Text>
          </ModalDescription>
          <Textarea
            label={PAYOUT_ACTION_LABELS.reasonLabel}
            placeholder={PAYOUT_ACTION_LABELS.reasonPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={rejecting}
            >
              {PAYOUT_ACTION_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              loading={rejecting}
              disabled={reason.trim().length === 0}
              onClick={handleReject}
            >
              {PAYOUT_ACTION_LABELS.rejectConfirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
