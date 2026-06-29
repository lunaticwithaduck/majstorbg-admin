'use client';

import {
  Badge,
  Button,
  Checkbox,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  RadioGroup,
  RadioItem,
  Text,
  Textarea,
} from '@lunaticwithaduck/webui';
import { Gavel } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DisputeDetail } from '@/api/admin-disputes-endpoints';
import type { DisputeOutcome } from '@/api/admin-disputes-mutations';
import { useResolveDisputeMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { formatEur } from '@/lib/format.utils';
import { amountToCents, isAmountWithinCap } from '@/lib/money.utils';
import {
  OUTCOME_LABELS,
  OUTCOME_OPTIONS,
  OUTCOMES_NEEDING_AMOUNT,
  RESOLUTION_LABELS,
} from './config/constants';
import styles from './ResolutionPanel.styles';

type ResolutionPanelProps = {
  dispute: DisputeDetail;
};

/** Held escrow in cents — from the payment relation, else the major-unit field. */
function heldCentsOf(dispute: DisputeDetail): number {
  if (dispute.payment?.heldCents != null) return dispute.payment.heldCents;
  return Math.round((dispute.escrowAmount ?? 0) * 100);
}

export default function ResolutionPanel({ dispute }: ResolutionPanelProps) {
  const [resolveDispute, { isLoading }] = useResolveDisputeMutation();
  const [outcome, setOutcome] = useState<DisputeOutcome | ''>('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heldCents = heldCentsOf(dispute);
  const amountCents = useMemo(() => amountToCents(amount), [amount]);

  if (!can(PERMISSIONS.disputes)) return null;

  if (dispute.status === 'resolved') {
    return (
      <div className={styles.resolvedState}>
        <Text as="span" size="sm" color="muted">
          {RESOLUTION_LABELS.alreadyResolved}
        </Text>
      </div>
    );
  }

  const needsAmount = outcome !== '' && OUTCOMES_NEEDING_AMOUNT.includes(outcome);
  const amountValid = !needsAmount || isAmountWithinCap(amountCents, heldCents);
  const reasonValid = reason.trim().length > 0;
  const canSubmit = outcome !== '' && amountValid && reasonValid;

  const handleConfirm = async () => {
    if (outcome === '') return;
    setError(null);
    try {
      await resolveDispute({
        id: dispute.id,
        outcome,
        ...(needsAmount ? { amountCents } : {}),
        reason: reason.trim(),
        notifyParties: notify,
      }).unwrap();
      setConfirmOpen(false);
    } catch {
      setError(RESOLUTION_LABELS.error);
    }
  };

  const handleConfirmOpenChange = (next: boolean) => {
    if (!next) setError(null);
    if (!isLoading) setConfirmOpen(next);
  };

  return (
    <div className={styles.root}>
      <RadioGroup
        label={RESOLUTION_LABELS.outcomeLabel}
        value={outcome}
        onValueChange={(value) => setOutcome(value as DisputeOutcome)}
      >
        {OUTCOME_OPTIONS.map((option) => (
          <RadioItem key={option.value} value={option.value} label={option.label} />
        ))}
      </RadioGroup>

      {needsAmount ? (
        <div className={styles.amountRow}>
          <Input
            label={RESOLUTION_LABELS.amountLabel}
            type="number"
            inputMode="decimal"
            min={0}
            max={heldCents / 100}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            suffix="EUR"
          />
          <Text as="span" size="sm" color="muted">
            {`${RESOLUTION_LABELS.heldPrefix} ${formatEur(heldCents)}`}
          </Text>
          {amount.length > 0 && !amountValid ? (
            <Text as="span" size="sm" color="destructive">
              {RESOLUTION_LABELS.amountInvalid}
            </Text>
          ) : null}
        </div>
      ) : null}

      <Textarea
        label={RESOLUTION_LABELS.reasonLabel}
        placeholder={RESOLUTION_LABELS.reasonPlaceholder}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <Checkbox
        label={RESOLUTION_LABELS.notify}
        checked={notify}
        onCheckedChange={(checked) => setNotify(checked === true)}
      />

      <div className={styles.footer}>
        <Button
          type="button"
          variant="primary"
          size="sm"
          iconLeft={Gavel}
          disabled={!canSubmit}
          onClick={() => setConfirmOpen(true)}
        >
          {RESOLUTION_LABELS.resolve}
        </Button>
      </div>

      <Modal open={confirmOpen} onOpenChange={handleConfirmOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {RESOLUTION_LABELS.confirmTitle}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {RESOLUTION_LABELS.confirmBody}
            </Text>
          </ModalDescription>
          <div className={styles.summary}>
            {outcome === '' ? null : (
              <Badge variant="outline" size="sm">
                {OUTCOME_LABELS[outcome]}
              </Badge>
            )}
            {needsAmount ? (
              <Text as="span" size="sm" weight="medium">
                {formatEur(amountCents)}
              </Text>
            ) : null}
          </div>
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
              onClick={() => handleConfirmOpenChange(false)}
              disabled={isLoading}
            >
              {RESOLUTION_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isLoading}
              onClick={handleConfirm}
            >
              {RESOLUTION_LABELS.confirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
