'use client';

import { Button, Input, Link, Text } from '@lunaticwithaduck/webui';
import { Download, FileText, Undo2 } from 'lucide-react';
import { useState } from 'react';
import type { InvoiceRow } from '@/api/admin-invoices-endpoints';
import { useCreditNoteMutation, useIssueInvoiceMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { formatEur } from '@/lib/format.utils';
import { amountToCents, isAmountWithinCap } from '@/lib/money.utils';
import ReasonModal from '@/ui/components/composed/ReasonModal/ReasonModal';
import { INVOICE_ACTION_LABELS } from './config/constants';
import styles from './InvoiceActions.styles';

export default function InvoiceActions({ invoice }: { invoice: InvoiceRow }) {
  const [issueInvoice, { isLoading: issuing }] = useIssueInvoiceMutation();
  const [creditNote] = useCreditNoteMutation();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.invoices)) return null;

  const canIssue = invoice.status === 'draft';
  const canCredit = invoice.status === 'sent' || invoice.status === 'paid';
  // A credit note can't exceed the invoice total (amount is major units → cents),
  // mirroring RefundModal's cap against the refundable amount.
  const invoiceCents = Math.round(invoice.amount * 100);
  const amountCents = amountToCents(amount);
  const amountValid = isAmountWithinCap(amountCents, invoiceCents);

  const handleIssue = async () => {
    setError(null);
    try {
      await issueInvoice({ id: invoice.id }).unwrap();
    } catch {
      setError(INVOICE_ACTION_LABELS.error);
    }
  };

  return (
    <div className={styles.root}>
      {canIssue ? (
        <Button
          type="button"
          variant="primary"
          size="sm"
          iconLeft={FileText}
          loading={issuing}
          onClick={handleIssue}
        >
          {INVOICE_ACTION_LABELS.issue}
        </Button>
      ) : null}
      {invoice.pdfUrl ? (
        <Button asChild variant="outline" size="sm">
          <Link href={invoice.pdfUrl} external variant="inherit">
            <Download size={14} />
            {INVOICE_ACTION_LABELS.download}
          </Link>
        </Button>
      ) : null}
      {canCredit ? (
        <ReasonModal
          trigger={(open) => (
            <Button type="button" variant="outline" size="sm" iconLeft={Undo2} onClick={open}>
              {INVOICE_ACTION_LABELS.creditNote}
            </Button>
          )}
          title={INVOICE_ACTION_LABELS.cnTitle}
          description={INVOICE_ACTION_LABELS.cnBody}
          reasonLabel={INVOICE_ACTION_LABELS.reasonLabel}
          reasonPlaceholder={INVOICE_ACTION_LABELS.reasonPlaceholder}
          confirmLabel={INVOICE_ACTION_LABELS.cnConfirm}
          cancelLabel={INVOICE_ACTION_LABELS.cancel}
          errorMessage={INVOICE_ACTION_LABELS.error}
          confirmDisabled={!amountValid}
          onOpenChange={(next) => {
            if (!next) setAmount('');
          }}
          onConfirm={async (reason) => {
            await creditNote({ id: invoice.id, amountCents, reason }).unwrap();
          }}
        >
          <div className={styles.amountRow}>
            <Input
              label={INVOICE_ACTION_LABELS.amountLabel}
              type="number"
              inputMode="decimal"
              min={0}
              max={invoiceCents / 100}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              suffix="EUR"
            />
            <div className={styles.metaRow}>
              <Text as="span" size="sm" color="muted">
                {INVOICE_ACTION_LABELS.maxLabel}
              </Text>
              <Text as="span" size="sm">
                {formatEur(invoiceCents)}
              </Text>
            </div>
            {amount.length > 0 && !amountValid ? (
              <Text as="span" size="sm" color="destructive">
                {INVOICE_ACTION_LABELS.invalid}
              </Text>
            ) : null}
          </div>
        </ReasonModal>
      ) : null}
      {error ? (
        <Text as="span" size="sm" color="destructive">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
