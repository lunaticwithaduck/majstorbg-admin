'use client';

import {
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  Text,
} from '@lunaticwithaduck/webui';
import { Send } from 'lucide-react';
import { useState } from 'react';
import type { CampaignRow } from '@/api/admin-growth-endpoints';
import { useSendCampaignMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { SEND_LABELS } from './config/constants';
import styles from './SendCampaignButton.styles';

export default function SendCampaignButton({ campaign }: { campaign: CampaignRow }) {
  const [sendCampaign, { isLoading }] = useSendCampaignMutation();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendable = campaign.status === 'draft' || campaign.status === 'scheduled';
  if (!can(PERMISSIONS.campaigns) || !sendable) return null;

  const handleSend = async () => {
    setError(null);
    try {
      await sendCampaign({ id: campaign.id }).unwrap();
      setOpen(false);
    } catch {
      setError(SEND_LABELS.error);
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
        variant="primary"
        size="sm"
        iconLeft={Send}
        onClick={() => setOpen(true)}
      >
        {SEND_LABELS.send}
      </Button>
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {SEND_LABELS.title}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {SEND_LABELS.body}
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
              {SEND_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isLoading}
              onClick={handleSend}
            >
              {SEND_LABELS.confirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
