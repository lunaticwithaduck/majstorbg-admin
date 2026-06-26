'use client';

import {
  Button,
  Link,
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  Text,
} from '@lunaticwithaduck/webui';
import { BadgeCheck, Download, FileDown, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { DataRequestRow } from '@/api/admin-compliance-endpoints';
import {
  useConfirmErasureMutation,
  useFulfilExportMutation,
  useVerifyRequesterIdentityMutation,
} from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import ReasonModal from '@/ui/components/composed/ReasonModal/ReasonModal';
import { ACTION_LABELS } from './config/constants';
import styles from './DataRequestActions.styles';

export default function DataRequestActions({ request }: { request: DataRequestRow }) {
  const [verifyIdentity, { isLoading: verifying }] = useVerifyRequesterIdentityMutation();
  const [fulfilExport, { isLoading: exporting }] = useFulfilExportMutation();
  const [confirmErasure] = useConfirmErasureMutation();
  const [identityOpen, setIdentityOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.compliance)) return null;

  const done = request.status === 'fulfilled' || request.status === 'rejected';

  const handleVerify = async () => {
    setError(null);
    try {
      await verifyIdentity({ id: request.id, verified: true }).unwrap();
      setIdentityOpen(false);
    } catch {
      setError(ACTION_LABELS.error);
    }
  };

  const handleExport = async () => {
    setError(null);
    try {
      await fulfilExport({ id: request.id }).unwrap();
    } catch {
      setError(ACTION_LABELS.error);
    }
  };

  const handleIdentityOpenChange = (next: boolean) => {
    if (verifying) return;
    if (!next) setError(null);
    setIdentityOpen(next);
  };

  return (
    <div className={styles.root}>
      {!request.identityVerified && !done ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          iconLeft={BadgeCheck}
          onClick={() => setIdentityOpen(true)}
        >
          {ACTION_LABELS.verify}
        </Button>
      ) : null}
      {request.type === 'export' && request.identityVerified && !done ? (
        <Button
          type="button"
          variant="primary"
          size="sm"
          iconLeft={FileDown}
          loading={exporting}
          onClick={handleExport}
        >
          {ACTION_LABELS.fulfilExport}
        </Button>
      ) : null}
      {request.type === 'export' && request.bundleUrl ? (
        <Button asChild variant="outline" size="sm">
          <Link href={request.bundleUrl} external variant="inherit">
            <Download size={14} />
            {ACTION_LABELS.download}
          </Link>
        </Button>
      ) : null}
      {request.type === 'erase' && request.identityVerified && !done ? (
        <ReasonModal
          trigger={(open) => (
            <Button type="button" variant="destructive" size="sm" iconLeft={Trash2} onClick={open}>
              {ACTION_LABELS.erase}
            </Button>
          )}
          title={ACTION_LABELS.eraseTitle}
          description={ACTION_LABELS.eraseBody}
          reasonLabel={ACTION_LABELS.reasonLabel}
          reasonPlaceholder={ACTION_LABELS.reasonPlaceholder}
          confirmLabel={ACTION_LABELS.eraseConfirm}
          cancelLabel={ACTION_LABELS.cancel}
          confirmVariant="destructive"
          errorMessage={ACTION_LABELS.error}
          onConfirm={async (reason) => {
            await confirmErasure({ id: request.id, reason }).unwrap();
          }}
        >
          <div className={styles.retained}>
            <Text as="span" size="sm" weight="medium">
              {ACTION_LABELS.retainedHeading}
            </Text>
            <Text as="span" size="sm" color="muted">
              {ACTION_LABELS.retainedNote}
            </Text>
          </div>
        </ReasonModal>
      ) : null}
      {error && !identityOpen ? (
        <Text as="span" size="sm" color="destructive">
          {error}
        </Text>
      ) : null}

      <Modal open={identityOpen} onOpenChange={handleIdentityOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {ACTION_LABELS.verifyTitle}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {ACTION_LABELS.verifyBody}
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
              onClick={() => handleIdentityOpenChange(false)}
              disabled={verifying}
            >
              {ACTION_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={verifying}
              onClick={handleVerify}
            >
              {ACTION_LABELS.verifyConfirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
