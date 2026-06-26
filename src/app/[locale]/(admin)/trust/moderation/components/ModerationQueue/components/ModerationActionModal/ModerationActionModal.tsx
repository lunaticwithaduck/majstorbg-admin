'use client';

import {
  Button,
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
import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import type { ModerationReportRow } from '@/api/admin-moderation-endpoints';
import type { ModerationActionKind } from '@/api/admin-moderation-mutations';
import { useActionReportMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { ACTION_LABELS, ACTION_OPTIONS } from './config/constants';
import styles from './ModerationActionModal.styles';

type ModerationActionModalProps = {
  report: ModerationReportRow;
};

export default function ModerationActionModal({ report }: ModerationActionModalProps) {
  const [actionReport, { isLoading }] = useActionReportMutation();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<ModerationActionKind | ''>('');
  const [reason, setReason] = useState('');
  const [days, setDays] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.moderation)) return null;

  const isSuspend = action === 'suspend';
  const canSubmit = action !== '' && reason.trim().length > 0;

  const handleConfirm = async () => {
    if (action === '') return;
    setError(null);
    const parsedDays = Number.parseInt(days, 10);
    const durationDays =
      isSuspend && Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : undefined;
    try {
      await actionReport({
        id: report.id,
        action,
        reason: reason.trim(),
        ...(durationDays ? { durationDays } : {}),
      }).unwrap();
      setOpen(false);
    } catch {
      setError(ACTION_LABELS.error);
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
        iconLeft={ShieldAlert}
        onClick={() => setOpen(true)}
      >
        {ACTION_LABELS.trigger}
      </Button>
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {ACTION_LABELS.title}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {ACTION_LABELS.body}
            </Text>
          </ModalDescription>
          <RadioGroup
            label={ACTION_LABELS.actionLabel}
            value={action}
            onValueChange={(value) => setAction(value as ModerationActionKind)}
          >
            {ACTION_OPTIONS.map((option) => (
              <RadioItem key={option.value} value={option.value} label={option.label} />
            ))}
          </RadioGroup>
          {isSuspend ? (
            <div className={styles.durationRow}>
              <Input
                label={ACTION_LABELS.durationLabel}
                type="number"
                inputMode="numeric"
                min={1}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                suffix={ACTION_LABELS.days}
              />
            </div>
          ) : null}
          <Textarea
            label={ACTION_LABELS.reasonLabel}
            placeholder={ACTION_LABELS.reasonPlaceholder}
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
              {ACTION_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isLoading}
              disabled={!canSubmit}
              onClick={handleConfirm}
            >
              {ACTION_LABELS.confirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
