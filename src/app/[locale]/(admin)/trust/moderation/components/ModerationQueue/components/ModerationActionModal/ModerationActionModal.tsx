'use client';

import { Button, Input, RadioGroup, RadioItem } from '@lunaticwithaduck/webui';
import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import type { ModerationReportRow } from '@/api/admin-moderation-endpoints';
import type { ModerationActionKind } from '@/api/admin-moderation-mutations';
import { useActionReportMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import ReasonModal from '@/ui/components/composed/ReasonModal/ReasonModal';
import { ACTION_LABELS, ACTION_OPTIONS } from './config/constants';
import styles from './ModerationActionModal.styles';

type ModerationActionModalProps = {
  report: ModerationReportRow;
};

export default function ModerationActionModal({ report }: ModerationActionModalProps) {
  const [actionReport] = useActionReportMutation();
  const [action, setAction] = useState<ModerationActionKind | ''>('');
  const [days, setDays] = useState('');

  if (!can(PERMISSIONS.moderation)) return null;

  const isSuspend = action === 'suspend';

  const handleConfirm = async (reason: string) => {
    if (action === '') return;
    const parsedDays = Number.parseInt(days, 10);
    const durationDays =
      isSuspend && Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : undefined;
    await actionReport({
      id: report.id,
      action,
      reason,
      ...(report.entityType === 'user' ? { targetUserId: report.entityId } : {}),
      ...(durationDays ? { durationDays } : {}),
    }).unwrap();
  };

  return (
    <ReasonModal
      trigger={(open) => (
        <Button type="button" variant="outline" size="sm" iconLeft={ShieldAlert} onClick={open}>
          {ACTION_LABELS.trigger}
        </Button>
      )}
      title={ACTION_LABELS.title}
      description={ACTION_LABELS.body}
      reasonLabel={ACTION_LABELS.reasonLabel}
      reasonPlaceholder={ACTION_LABELS.reasonPlaceholder}
      confirmLabel={ACTION_LABELS.confirm}
      cancelLabel={ACTION_LABELS.cancel}
      errorMessage={ACTION_LABELS.error}
      confirmDisabled={action === ''}
      onOpenChange={(next) => {
        if (!next) {
          setAction('');
          setDays('');
        }
      }}
      onConfirm={handleConfirm}
    >
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
    </ReasonModal>
  );
}
