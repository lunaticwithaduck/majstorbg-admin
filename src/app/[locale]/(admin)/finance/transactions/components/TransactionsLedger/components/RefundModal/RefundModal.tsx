'use client';

import { Button, Input, Text } from '@lunaticwithaduck/webui';
import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import type { TransactionRow } from '@/api/admin-finance-endpoints';
import { useRefundMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { formatEur } from '@/lib/format.utils';
import { amountToCents, isAmountWithinCap } from '@/lib/money.utils';
import ReasonModal from '@/ui/components/composed/ReasonModal/ReasonModal';
import { REFUND_LABELS } from './config/constants';
import styles from './RefundModal.styles';

export default function RefundModal({ transaction }: { transaction: TransactionRow }) {
  const [refund] = useRefundMutation();
  const [amount, setAmount] = useState('');

  const refundableCents = transaction.refundableCents ?? 0;
  if (!can(PERMISSIONS.finance) || refundableCents <= 0) return null;

  const amountCents = amountToCents(amount);
  const amountValid = isAmountWithinCap(amountCents, refundableCents);

  return (
    <ReasonModal
      trigger={(open) => (
        <Button type="button" variant="outline" size="sm" iconLeft={Undo2} onClick={open}>
          {REFUND_LABELS.trigger}
        </Button>
      )}
      title={REFUND_LABELS.title}
      description={REFUND_LABELS.body}
      reasonLabel={REFUND_LABELS.reasonLabel}
      reasonPlaceholder={REFUND_LABELS.reasonPlaceholder}
      confirmLabel={REFUND_LABELS.confirm}
      cancelLabel={REFUND_LABELS.cancel}
      errorMessage={REFUND_LABELS.error}
      confirmDisabled={!amountValid}
      onOpenChange={(next) => {
        if (!next) setAmount('');
      }}
      onConfirm={async (reason) => {
        await refund({ id: transaction.id, amountCents, reason }).unwrap();
      }}
    >
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
    </ReasonModal>
  );
}
