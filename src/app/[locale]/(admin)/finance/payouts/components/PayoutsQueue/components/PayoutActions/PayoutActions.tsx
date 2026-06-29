'use client';

import { Button, Text } from '@lunaticwithaduck/webui';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import type { PayoutRow } from '@/api/admin-finance-endpoints';
import { useApprovePayoutMutation, useRejectPayoutMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import ReasonModal from '@/ui/components/composed/ReasonModal/ReasonModal';
import { PAYOUT_ACTION_LABELS } from './config/constants';
import styles from './PayoutActions.styles';

export default function PayoutActions({ payout }: { payout: PayoutRow }) {
  const [approvePayout, { isLoading: approving }] = useApprovePayoutMutation();
  const [rejectPayout] = useRejectPayoutMutation();
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
      <ReasonModal
        trigger={(open) => (
          <Button type="button" variant="ghost" size="sm" iconLeft={X} onClick={open}>
            {PAYOUT_ACTION_LABELS.reject}
          </Button>
        )}
        title={PAYOUT_ACTION_LABELS.rejectTitle}
        description={PAYOUT_ACTION_LABELS.rejectBody}
        reasonLabel={PAYOUT_ACTION_LABELS.reasonLabel}
        reasonPlaceholder={PAYOUT_ACTION_LABELS.reasonPlaceholder}
        confirmLabel={PAYOUT_ACTION_LABELS.rejectConfirm}
        cancelLabel={PAYOUT_ACTION_LABELS.cancel}
        confirmVariant="destructive"
        errorMessage={PAYOUT_ACTION_LABELS.error}
        onConfirm={async (reason) => {
          await rejectPayout({ id: payout.id, reason }).unwrap();
        }}
      />
      {error ? (
        <Text as="span" size="sm" color="destructive">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
