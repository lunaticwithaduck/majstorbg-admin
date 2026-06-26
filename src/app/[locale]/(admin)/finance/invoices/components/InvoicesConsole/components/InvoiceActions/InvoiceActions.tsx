'use client';

import {
  Button,
  Input,
  Link,
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  Text,
  Textarea,
} from '@lunaticwithaduck/webui';
import { Download, FileText, Undo2 } from 'lucide-react';
import { useState } from 'react';
import type { InvoiceRow } from '@/api/admin-invoices-endpoints';
import { useCreditNoteMutation, useIssueInvoiceMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { INVOICE_ACTION_LABELS } from './config/constants';
import styles from './InvoiceActions.styles';

export default function InvoiceActions({ invoice }: { invoice: InvoiceRow }) {
  const [issueInvoice, { isLoading: issuing }] = useIssueInvoiceMutation();
  const [creditNote, { isLoading: crediting }] = useCreditNoteMutation();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.invoices)) return null;

  const canIssue = invoice.status === 'draft';
  const canCredit = invoice.status === 'sent' || invoice.status === 'paid';
  const amountCents = Math.round(Number.parseFloat(amount.replace(',', '.')) * 100);
  const canSubmit = Number.isFinite(amountCents) && amountCents > 0 && reason.trim().length > 0;

  const handleIssue = async () => {
    setError(null);
    try {
      await issueInvoice({ id: invoice.id }).unwrap();
    } catch {
      setError(INVOICE_ACTION_LABELS.error);
    }
  };

  const handleCredit = async () => {
    setError(null);
    try {
      await creditNote({ id: invoice.id, amountCents, reason: reason.trim() }).unwrap();
      setOpen(false);
      setAmount('');
      setReason('');
    } catch {
      setError(INVOICE_ACTION_LABELS.error);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setError(null);
    if (!crediting) setOpen(next);
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          iconLeft={Undo2}
          onClick={() => setOpen(true)}
        >
          {INVOICE_ACTION_LABELS.creditNote}
        </Button>
      ) : null}
      {error && !open ? (
        <Text as="span" size="sm" color="destructive">
          {error}
        </Text>
      ) : null}

      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {INVOICE_ACTION_LABELS.cnTitle}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {INVOICE_ACTION_LABELS.cnBody}
            </Text>
          </ModalDescription>
          <div className={styles.amountRow}>
            <Input
              label={INVOICE_ACTION_LABELS.amountLabel}
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              suffix="EUR"
            />
          </div>
          <Textarea
            label={INVOICE_ACTION_LABELS.reasonLabel}
            placeholder={INVOICE_ACTION_LABELS.reasonPlaceholder}
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
              disabled={crediting}
            >
              {INVOICE_ACTION_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={crediting}
              disabled={!canSubmit}
              onClick={handleCredit}
            >
              {INVOICE_ACTION_LABELS.cnConfirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
