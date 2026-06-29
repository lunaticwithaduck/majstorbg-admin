'use client';

import { Button } from '@lunaticwithaduck/webui';
import { Unlock } from 'lucide-react';
import type { TransactionRow } from '@/api/admin-finance-endpoints';
import { useReleaseEscrowMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import ReasonModal from '@/ui/components/composed/ReasonModal/ReasonModal';
import { RELEASE_LABELS } from './config/constants';

export default function ReleaseEscrowModal({ transaction }: { transaction: TransactionRow }) {
  const [releaseEscrow] = useReleaseEscrowMutation();

  const eligible =
    transaction.type === 'escrow_hold' &&
    Boolean(transaction.jobCompleted) &&
    Boolean(transaction.jobId);
  if (!can(PERMISSIONS.finance) || !eligible || !transaction.jobId) return null;

  const jobId = transaction.jobId;

  return (
    <ReasonModal
      trigger={(open) => (
        <Button type="button" variant="outline" size="sm" iconLeft={Unlock} onClick={open}>
          {RELEASE_LABELS.trigger}
        </Button>
      )}
      title={RELEASE_LABELS.title}
      description={RELEASE_LABELS.body}
      reasonLabel={RELEASE_LABELS.reasonLabel}
      reasonPlaceholder={RELEASE_LABELS.reasonPlaceholder}
      confirmLabel={RELEASE_LABELS.confirm}
      cancelLabel={RELEASE_LABELS.cancel}
      errorMessage={RELEASE_LABELS.error}
      onConfirm={async (reason) => {
        await releaseEscrow({ jobId, reason, txnId: transaction.id }).unwrap();
      }}
    />
  );
}
