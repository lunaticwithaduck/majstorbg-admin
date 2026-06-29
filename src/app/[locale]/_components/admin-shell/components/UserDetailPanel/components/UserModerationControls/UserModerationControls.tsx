'use client';

import {
  Badge,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  Spinner,
  Text,
  Textarea,
} from '@lunaticwithaduck/webui';
import { Ban, ShieldCheck, ShieldX } from 'lucide-react';
import { useState } from 'react';
import {
  useBanUserMutation,
  useGetUserModerationStatusQuery,
  useReinstateUserMutation,
  useSuspendUserMutation,
} from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { formatDateTime } from '@/lib/format.utils';
import { MOD_CONTROLS_LABELS, MODAL_TITLES, STATUS_BADGE, STATUS_LABELS } from './config/constants';
import styles from './UserModerationControls.styles';

type PendingAction = 'suspend' | 'ban' | 'reinstate';

const MS_PER_DAY = 86_400_000;

export default function UserModerationControls({ userId }: { userId: string }) {
  const { data, isLoading } = useGetUserModerationStatusQuery(userId);
  const [suspendUser, { isLoading: suspending }] = useSuspendUserMutation();
  const [banUser, { isLoading: banning }] = useBanUserMutation();
  const [reinstateUser, { isLoading: reinstating }] = useReinstateUserMutation();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [reason, setReason] = useState('');
  const [days, setDays] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.moderation)) return null;

  const busy = suspending || banning || reinstating;
  const status = data?.status ?? 'active';
  const modalTitle = pending ? MODAL_TITLES[pending] : '';

  const open = (action: PendingAction) => {
    setPending(action);
    setReason('');
    setDays('');
    setError(null);
  };

  const close = () => {
    if (busy) return;
    setPending(null);
    setReason('');
    setDays('');
    setError(null);
  };

  const handleConfirm = async () => {
    if (!pending) return;
    setError(null);
    try {
      if (pending === 'suspend') {
        const parsed = Number.parseInt(days, 10);
        const until =
          Number.isFinite(parsed) && parsed > 0
            ? new Date(Date.now() + parsed * MS_PER_DAY).toISOString()
            : undefined;
        await suspendUser({
          id: userId,
          reason: reason.trim(),
          ...(until ? { until } : {}),
        }).unwrap();
      } else if (pending === 'ban') {
        await banUser({ id: userId, reason: reason.trim() }).unwrap();
      } else {
        await reinstateUser({ id: userId, reason: reason.trim() }).unwrap();
      }
      setPending(null);
      setReason('');
      setDays('');
    } catch {
      setError(MOD_CONTROLS_LABELS.error);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.statusRow}>
        <Text as="span" size="sm" color="muted">
          {MOD_CONTROLS_LABELS.statusLabel}
        </Text>
        {isLoading ? (
          <Spinner />
        ) : (
          <Badge variant={STATUS_BADGE[status]} size="sm">
            {STATUS_LABELS[status]}
          </Badge>
        )}
      </div>

      {data?.until ? (
        <div className={styles.metaRow}>
          <Text as="span" size="sm" color="muted">
            {MOD_CONTROLS_LABELS.until}
          </Text>
          <Text as="span" size="sm">
            {formatDateTime(data.until)}
          </Text>
        </div>
      ) : null}
      {data?.reason ? (
        <Text as="span" size="sm" color="muted">
          {data.reason}
        </Text>
      ) : null}

      <div className={styles.actions}>
        {status === 'active' ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              iconLeft={ShieldX}
              onClick={() => open('suspend')}
            >
              {MOD_CONTROLS_LABELS.suspend}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              iconLeft={Ban}
              onClick={() => open('ban')}
            >
              {MOD_CONTROLS_LABELS.ban}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            iconLeft={ShieldCheck}
            onClick={() => open('reinstate')}
          >
            {MOD_CONTROLS_LABELS.reinstate}
          </Button>
        )}
      </div>

      <Modal
        open={pending !== null}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {modalTitle}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {MOD_CONTROLS_LABELS.reasonPlaceholder}
            </Text>
          </ModalDescription>
          {pending === 'suspend' ? (
            <div className={styles.durationRow}>
              <Input
                label={MOD_CONTROLS_LABELS.durationLabel}
                type="number"
                inputMode="numeric"
                min={1}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                suffix={MOD_CONTROLS_LABELS.days}
              />
            </div>
          ) : null}
          <Textarea
            label={MOD_CONTROLS_LABELS.reasonLabel}
            placeholder={MOD_CONTROLS_LABELS.reasonPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error ? (
            <Text as="span" size="sm" color="destructive">
              {error}
            </Text>
          ) : null}
          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" size="sm" onClick={close} disabled={busy}>
              {MOD_CONTROLS_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={busy}
              disabled={reason.trim().length === 0}
              onClick={handleConfirm}
            >
              {MOD_CONTROLS_LABELS.confirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
