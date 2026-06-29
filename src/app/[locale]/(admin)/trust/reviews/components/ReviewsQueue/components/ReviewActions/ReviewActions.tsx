'use client';

import { Button } from '@lunaticwithaduck/webui';
import { EyeOff, Trash2 } from 'lucide-react';
import type { ReviewRow } from '@/api/admin-reviews-endpoints';
import { useHideReviewMutation, useRemoveReviewMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import ReasonModal from '@/ui/components/composed/ReasonModal/ReasonModal';
import { MODAL_COPY, REVIEW_ACTION_LABELS } from './config/constants';
import styles from './ReviewActions.styles';

export default function ReviewActions({ review }: { review: ReviewRow }) {
  const [hideReview] = useHideReviewMutation();
  const [removeReview] = useRemoveReviewMutation();

  if (!can(PERMISSIONS.reviews) || review.status === 'removed') return null;

  return (
    <div className={styles.root}>
      {review.status === 'visible' ? (
        <ReasonModal
          trigger={(open) => (
            <Button type="button" variant="ghost" size="sm" iconLeft={EyeOff} onClick={open}>
              {REVIEW_ACTION_LABELS.hide}
            </Button>
          )}
          title={MODAL_COPY.hide.title}
          description={MODAL_COPY.hide.body}
          reasonLabel={REVIEW_ACTION_LABELS.reasonLabel}
          reasonPlaceholder={REVIEW_ACTION_LABELS.reasonPlaceholder}
          confirmLabel={MODAL_COPY.hide.confirm}
          cancelLabel={REVIEW_ACTION_LABELS.cancel}
          errorMessage={REVIEW_ACTION_LABELS.error}
          onConfirm={async (reason) => {
            await hideReview({ id: review.id, reason }).unwrap();
          }}
        />
      ) : null}
      <ReasonModal
        trigger={(open) => (
          <Button type="button" variant="destructive" size="sm" iconLeft={Trash2} onClick={open}>
            {REVIEW_ACTION_LABELS.remove}
          </Button>
        )}
        title={MODAL_COPY.remove.title}
        description={MODAL_COPY.remove.body}
        reasonLabel={REVIEW_ACTION_LABELS.reasonLabel}
        reasonPlaceholder={REVIEW_ACTION_LABELS.reasonPlaceholder}
        confirmLabel={MODAL_COPY.remove.confirm}
        cancelLabel={REVIEW_ACTION_LABELS.cancel}
        confirmVariant="destructive"
        errorMessage={REVIEW_ACTION_LABELS.error}
        onConfirm={async (reason) => {
          await removeReview({ id: review.id, reason }).unwrap();
        }}
      />
    </div>
  );
}
