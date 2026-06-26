'use client';

import { Button, Text } from '@lunaticwithaduck/webui';
import { RotateCcw, UserCheck } from 'lucide-react';
import { useState } from 'react';
import type { DisputeStatus } from '@/api/admin-disputes-endpoints';
import { useAssignDisputeMutation, useReopenDisputeMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import ReasonModal from '@/ui/components/composed/ReasonModal/ReasonModal';
import { ACTIONS_LABELS } from './config/constants';
import styles from './DisputeActions.styles';

type DisputeActionsProps = {
  disputeId: string;
  status: DisputeStatus;
};

export default function DisputeActions({ disputeId, status }: DisputeActionsProps) {
  const [assignDispute, { isLoading: isAssigning }] = useAssignDisputeMutation();
  const [reopenDispute] = useReopenDisputeMutation();
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.disputes)) return null;

  const isResolved = status === 'resolved';

  const handleAssign = async () => {
    setError(null);
    try {
      // Omit adminId → self-assign (BE resolves the actor from the session).
      await assignDispute({ id: disputeId }).unwrap();
    } catch {
      setError(ACTIONS_LABELS.assignError);
    }
  };

  return (
    <div className={styles.root}>
      {isResolved ? (
        <ReasonModal
          trigger={(open) => (
            <Button type="button" variant="outline" size="sm" iconLeft={RotateCcw} onClick={open}>
              {ACTIONS_LABELS.reopen}
            </Button>
          )}
          title={ACTIONS_LABELS.reopenTitle}
          description={ACTIONS_LABELS.reopenBody}
          reasonLabel={ACTIONS_LABELS.reasonLabel}
          reasonPlaceholder={ACTIONS_LABELS.reasonPlaceholder}
          confirmLabel={ACTIONS_LABELS.reopenConfirm}
          cancelLabel={ACTIONS_LABELS.cancel}
          errorMessage={ACTIONS_LABELS.reopenError}
          onConfirm={async (reason) => {
            await reopenDispute({ id: disputeId, reason }).unwrap();
          }}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          iconLeft={UserCheck}
          loading={isAssigning}
          onClick={handleAssign}
        >
          {ACTIONS_LABELS.assignToMe}
        </Button>
      )}
      {error ? (
        <Text as="span" size="sm" color="destructive">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
