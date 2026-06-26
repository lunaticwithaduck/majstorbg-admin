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
import { EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReviewRow } from '@/api/admin-reviews-endpoints';
import { useHideReviewMutation, useRemoveReviewMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { MODAL_COPY, REVIEW_ACTION_LABELS } from './config/constants';
import styles from './ReviewActions.styles';

type Pending = 'hide' | 'remove';

export default function ReviewActions({ review }: { review: ReviewRow }) {
  const [hideReview, { isLoading: hiding }] = useHideReviewMutation();
  const [removeReview, { isLoading: removing }] = useRemoveReviewMutation();
  const [pending, setPending] = useState<Pending | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.reviews) || review.status === 'removed') return null;

  const busy = hiding || removing;
  const title = pending ? MODAL_COPY[pending].title : '';
  const body = pending ? MODAL_COPY[pending].body : '';
  const confirmLabel = pending ? MODAL_COPY[pending].confirm : '';

  const open = (next: Pending) => {
    setPending(next);
    setReason('');
    setError(null);
  };

  const close = () => {
    if (busy) return;
    setPending(null);
    setReason('');
    setError(null);
  };

  const handleConfirm = async () => {
    if (!pending) return;
    setError(null);
    try {
      if (pending === 'hide') {
        await hideReview({ id: review.id, reason: reason.trim() }).unwrap();
      } else {
        await removeReview({ id: review.id, reason: reason.trim() }).unwrap();
      }
      setPending(null);
      setReason('');
    } catch {
      setError(REVIEW_ACTION_LABELS.error);
    }
  };

  return (
    <div className={styles.root}>
      {review.status === 'visible' ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          iconLeft={EyeOff}
          onClick={() => open('hide')}
        >
          {REVIEW_ACTION_LABELS.hide}
        </Button>
      ) : null}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        iconLeft={Trash2}
        onClick={() => open('remove')}
      >
        {REVIEW_ACTION_LABELS.remove}
      </Button>

      <Modal
        open={pending !== null}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {title}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {body}
            </Text>
          </ModalDescription>
          <Textarea
            label={REVIEW_ACTION_LABELS.reasonLabel}
            placeholder={REVIEW_ACTION_LABELS.reasonPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error ? (
            <Text as="span" size="sm" color="destructive">
              {error}
            </Text>
          ) : null}
          <div className={styles.actions}>
            <Button type="button" variant="ghost" size="sm" onClick={close} disabled={busy}>
              {REVIEW_ACTION_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant={pending === 'remove' ? 'destructive' : 'primary'}
              size="sm"
              loading={busy}
              disabled={reason.trim().length === 0}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
