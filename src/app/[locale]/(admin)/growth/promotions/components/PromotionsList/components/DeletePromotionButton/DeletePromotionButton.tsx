'use client';

import {
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  Text,
} from '@lunaticwithaduck/webui';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Promotion } from '@/api/admin-promotions-endpoints';
import { useDeletePromotionMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { DELETE_LABELS } from './config/constants';
import styles from './DeletePromotionButton.styles';

export default function DeletePromotionButton({ promotion }: { promotion: Promotion }) {
  const [deletePromotion, { isLoading }] = useDeletePromotionMutation();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.promotions)) return null;

  const handleConfirm = async () => {
    setError(null);
    try {
      await deletePromotion(promotion.id).unwrap();
      setOpen(false);
    } catch {
      setError(DELETE_LABELS.error);
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
        variant="destructive"
        size="sm"
        iconLeft={Trash2}
        onClick={() => setOpen(true)}
      >
        {DELETE_LABELS.trigger}
      </Button>
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {DELETE_LABELS.title}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {DELETE_LABELS.body}
            </Text>
          </ModalDescription>
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
              {DELETE_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              loading={isLoading}
              onClick={handleConfirm}
            >
              {DELETE_LABELS.confirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
