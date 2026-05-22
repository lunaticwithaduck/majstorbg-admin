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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDeleteAdminUserMutation } from '@/api/store';
import { routes } from '@/config/routes';
import { DELETE_LABELS } from './config/constants';
import styles from './DeleteUserButton.styles';

export default function DeleteUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteUser, { isLoading }] = useDeleteAdminUserMutation();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    try {
      await deleteUser(userId).unwrap();
      setOpen(false);
      router.push(routes.users.report);
    } catch {
      setError(DELETE_LABELS.errorFallback);
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
              {DELETE_LABELS.dialogTitle}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {DELETE_LABELS.dialogBody}
            </Text>
          </ModalDescription>
          {error ? (
            <div className={styles.errorText}>
              <Text as="span" size="sm" color="destructive">
                {error}
              </Text>
            </div>
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
              {isLoading ? DELETE_LABELS.deleting : DELETE_LABELS.confirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
