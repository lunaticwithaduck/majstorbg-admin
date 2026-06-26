'use client';

import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  Text,
  Textarea,
} from '@lunaticwithaduck/webui';
import { Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { TransactionRow } from '@/api/admin-finance-endpoints';
import { useRefundMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { formatEur } from '@/lib/format.utils';
import { amountToCents, isAmountWithinCap } from '@/lib/money.utils';
import { REFUND_LABELS } from './config/constants';
import styles from './RefundModal.styles';

export default function RefundModal({ transaction }: { transaction: TransactionRow }) {
  const [refund, { isLoading }] = useRefundMutation();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const amountCents = useMemo(() => amountToCents(amount), [amount]);

  const refundableCents = transaction.refundableCents ?? 0;
  if (!can(PERMISSIONS.finance) || refundableCents <= 0) return null;

  const amountValid = isAmountWithinCap(amountCents, refundableCents);
  const canSubmit = amountValid && reason.trim().length > 0;

  const handleConfirm = async () => {
    setError(null);
    try {
      await refund({ id: transaction.id, amountCents, reason: reason.trim() }).unwrap();
      setOpen(false);
    } catch {
      setError(REFUND_LABELS.error);
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
        iconLeft={Undo2}
        onClick={() => setOpen(true)}
      >
        {REFUND_LABELS.trigger}
      </Button>
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {REFUND_LABELS.title}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {REFUND_LABELS.body}
            </Text>
          </ModalDescription>
          <div className={styles.amountRow}>
            <Input
              label={REFUND_LABELS.amountLabel}
              type="number"
              inputMode="decimal"
              min={0}
              max={refundableCents / 100}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              suffix="EUR"
            />
            <div className={styles.metaRow}>
              <Text as="span" size="sm" color="muted">
                {REFUND_LABELS.refundable}
              </Text>
              <Text as="span" size="sm">
                {formatEur(refundableCents)}
              </Text>
            </div>
            {amount.length > 0 && !amountValid ? (
              <Text as="span" size="sm" color="destructive">
                {REFUND_LABELS.invalid}
              </Text>
            ) : null}
          </div>
          <Textarea
            label={REFUND_LABELS.reasonLabel}
            placeholder={REFUND_LABELS.reasonPlaceholder}
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
              {REFUND_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isLoading}
              disabled={!canSubmit}
              onClick={handleConfirm}
            >
              {REFUND_LABELS.confirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
