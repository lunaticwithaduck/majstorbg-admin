'use client';

import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  Select,
  SelectItem,
  Text,
  Textarea,
} from '@lunaticwithaduck/webui';
import { useEffect, useState } from 'react';
import {
  ADMIN_NOTIFICATION_KINDS,
  type AdminNotificationKind,
} from '@/api/admin-notification-endpoints';
import { useSendTestNotificationMutation } from '@/api/store';
import { KIND_OPTION_LABELS, SEND_TEST_LABELS } from './config/constants';
import styles from './SendTestNotificationModal.styles';

type SendTestNotificationModalProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  defaultUserId?: string | undefined;
};

const DEFAULT_KIND: AdminNotificationKind = 'system_info';

function parsePayload(raw: string): { ok: true; value: Record<string, unknown> | null } | { ok: false } {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: true, value: null };
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return { ok: false };
    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
}

export default function SendTestNotificationModal({
  open,
  onOpenChange,
  defaultUserId,
}: SendTestNotificationModalProps) {
  const [userId, setUserId] = useState(defaultUserId ?? '');
  const [kind, setKind] = useState<AdminNotificationKind>(DEFAULT_KIND);
  const [payloadRaw, setPayloadRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sendTest, { isLoading }] = useSendTestNotificationMutation();

  // Sync the default when the parent reopens with a different filter.
  useEffect(() => {
    if (open) {
      setUserId(defaultUserId ?? '');
      setKind(DEFAULT_KIND);
      setPayloadRaw('');
      setError(null);
      setSuccess(false);
    }
  }, [open, defaultUserId]);

  const handleOpenChange = (next: boolean) => {
    if (!isLoading) onOpenChange(next);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    const trimmedUserId = userId.trim();
    if (trimmedUserId.length === 0) {
      setError(SEND_TEST_LABELS.errorRequiredUserId);
      return;
    }
    const payloadResult = parsePayload(payloadRaw);
    if (!payloadResult.ok) {
      setError(SEND_TEST_LABELS.errorInvalidPayload);
      return;
    }
    try {
      await sendTest({
        userId: trimmedUserId,
        kind,
        payload: payloadResult.value,
      }).unwrap();
      setSuccess(true);
    } catch {
      setError(SEND_TEST_LABELS.errorFallback);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className={styles.modalContent}>
        <ModalTitle>
          <Text as="span" size="lg" weight="bold">
            {SEND_TEST_LABELS.title}
          </Text>
        </ModalTitle>
        <ModalDescription>
          <Text as="span" size="sm" color="muted">
            {SEND_TEST_LABELS.description}
          </Text>
        </ModalDescription>

        {error ? (
          <div className={styles.errorBanner}>
            <Text as="span" size="sm" color="destructive">
              {error}
            </Text>
          </div>
        ) : null}
        {success ? (
          <div className={styles.successBanner}>
            <Text as="span" size="sm">
              {SEND_TEST_LABELS.success}
            </Text>
          </div>
        ) : null}

        <div className={styles.form}>
          <Input
            label={SEND_TEST_LABELS.userIdLabel}
            placeholder={SEND_TEST_LABELS.userIdPlaceholder}
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            disabled={isLoading}
          />

          <Select
            label={SEND_TEST_LABELS.kindLabel}
            placeholder={SEND_TEST_LABELS.kindPlaceholder}
            value={kind}
            onValueChange={(next) => setKind(next as AdminNotificationKind)}
            disabled={isLoading}
          >
            {ADMIN_NOTIFICATION_KINDS.map((option) => (
              <SelectItem key={option} value={option}>
                {KIND_OPTION_LABELS[option]}
              </SelectItem>
            ))}
          </Select>

          <Textarea
            label={SEND_TEST_LABELS.payloadLabel}
            placeholder={SEND_TEST_LABELS.payloadPlaceholder}
            value={payloadRaw}
            onChange={(event) => setPayloadRaw(event.target.value)}
            disabled={isLoading}
            rows={4}
          />
          <div className={styles.hint}>
            <Text as="span" size="xs" color="muted">
              {SEND_TEST_LABELS.payloadHint}
            </Text>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {SEND_TEST_LABELS.cancel}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? SEND_TEST_LABELS.submitting : SEND_TEST_LABELS.submit}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
