'use client';

import { Button, Modal, ModalContent, ModalTitle, Text } from '@lunaticwithaduck/webui';
import { ListChecks } from 'lucide-react';
import { useState } from 'react';
import type { Promotion } from '@/api/admin-promotions-endpoints';
import { useGetPromotionRedemptionsQuery } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { formatDateTime } from '@/lib/format.utils';
import { REDEMPTIONS_LABELS } from './config/constants';
import styles from './RedemptionsModal.styles';

export default function RedemptionsModal({ promotion }: { promotion: Promotion }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useGetPromotionRedemptionsQuery(promotion.id, {
    skip: !open,
  });

  if (!can(PERMISSIONS.promotions)) return null;

  const items = data?.items ?? [];
  const showEmpty = !isLoading && !isError && items.length === 0;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        iconLeft={ListChecks}
        onClick={() => setOpen(true)}
      >
        {REDEMPTIONS_LABELS.trigger}
      </Button>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {REDEMPTIONS_LABELS.title}
            </Text>
          </ModalTitle>
          {isLoading ? (
            <Text as="span" size="sm" color="muted">
              {REDEMPTIONS_LABELS.loading}
            </Text>
          ) : null}
          {isError ? (
            <Text as="span" size="sm" color="destructive">
              {REDEMPTIONS_LABELS.error}
            </Text>
          ) : null}
          {showEmpty ? (
            <Text as="span" size="sm" color="muted">
              {REDEMPTIONS_LABELS.empty}
            </Text>
          ) : null}
          {items.length > 0 ? (
            <div className={styles.list}>
              {items.map((redemption) => (
                <div key={redemption.id} className={styles.item}>
                  <Text as="span" size="sm" weight="medium">
                    {redemption.userName}
                  </Text>
                  <Text as="span" size="sm" color="muted">
                    {formatDateTime(redemption.redeemedAt)}
                  </Text>
                </div>
              ))}
            </div>
          ) : null}
          <div className={styles.actions}>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              {REDEMPTIONS_LABELS.close}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
