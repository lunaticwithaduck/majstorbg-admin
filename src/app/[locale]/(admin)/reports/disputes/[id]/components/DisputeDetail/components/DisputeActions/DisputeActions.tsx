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
import { RotateCcw, UserCheck } from 'lucide-react';
import { useState } from 'react';
import type { DisputeStatus } from '@/api/admin-disputes-endpoints';
import { useAssignDisputeMutation, useReopenDisputeMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { ACTIONS_LABELS } from './config/constants';
import styles from './DisputeActions.styles';

type DisputeActionsProps = {
  disputeId: string;
  status: DisputeStatus;
};

export default function DisputeActions({ disputeId, status }: DisputeActionsProps) {
  const [assignDispute, { isLoading: isAssigning }] = useAssignDisputeMutation();
  const [reopenDispute, { isLoading: isReopening }] = useReopenDisputeMutation();
  const [error, setError] = useState<string | null>(null);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

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

  const handleReopen = async () => {
    setError(null);
    try {
      await reopenDispute({ id: disputeId, reason: reopenReason.trim() }).unwrap();
      setReopenOpen(false);
      setReopenReason('');
    } catch {
      setError(ACTIONS_LABELS.reopenError);
    }
  };

  const handleReopenOpenChange = (next: boolean) => {
    if (!next) setError(null);
    if (!isReopening) setReopenOpen(next);
  };

  return (
    <div className={styles.root}>
      {isResolved ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          iconLeft={RotateCcw}
          onClick={() => setReopenOpen(true)}
        >
          {ACTIONS_LABELS.reopen}
        </Button>
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

      <Modal open={reopenOpen} onOpenChange={handleReopenOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {ACTIONS_LABELS.reopenTitle}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {ACTIONS_LABELS.reopenBody}
            </Text>
          </ModalDescription>
          <Textarea
            label={ACTIONS_LABELS.reasonLabel}
            placeholder={ACTIONS_LABELS.reasonPlaceholder}
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
          />
          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleReopenOpenChange(false)}
              disabled={isReopening}
            >
              {ACTIONS_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isReopening}
              disabled={reopenReason.trim().length === 0}
              onClick={handleReopen}
            >
              {ACTIONS_LABELS.reopenConfirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
