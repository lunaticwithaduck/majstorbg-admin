'use client';

import {
  Button,
  Link,
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  Text,
  Textarea,
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
import { ACTION_LABELS } from './config/constants';
import styles from './DataRequestActions.styles';

type Pending = 'identity' | 'erase';

export default function DataRequestActions({ request }: { request: DataRequestRow }) {
  const [verifyIdentity, { isLoading: verifying }] = useVerifyRequesterIdentityMutation();
  const [fulfilExport, { isLoading: exporting }] = useFulfilExportMutation();
  const [confirmErasure, { isLoading: erasing }] = useConfirmErasureMutation();
  const [pending, setPending] = useState<Pending | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.compliance)) return null;

  const done = request.status === 'fulfilled' || request.status === 'rejected';
  const busy = verifying || exporting || erasing;

  const close = () => {
    if (busy) return;
    setPending(null);
    setReason('');
    setError(null);
  };

  const handleVerify = async () => {
    setError(null);
    try {
      await verifyIdentity({ id: request.id, verified: true }).unwrap();
      setPending(null);
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

  const handleErase = async () => {
    setError(null);
    try {
      await confirmErasure({ id: request.id, reason: reason.trim() }).unwrap();
      setPending(null);
      setReason('');
    } catch {
      setError(ACTION_LABELS.error);
    }
  };

  return (
    <div className={styles.root}>
      {!request.identityVerified && !done ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          iconLeft={BadgeCheck}
          onClick={() => setPending('identity')}
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
        <Button
          type="button"
          variant="destructive"
          size="sm"
          iconLeft={Trash2}
          onClick={() => setPending('erase')}
        >
          {ACTION_LABELS.erase}
        </Button>
      ) : null}
      {error && pending === null ? (
        <Text as="span" size="sm" color="destructive">
          {error}
        </Text>
      ) : null}

      <Modal
        open={pending === 'identity'}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
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
            <Button type="button" variant="ghost" size="sm" onClick={close} disabled={verifying}>
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

      <Modal
        open={pending === 'erase'}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {ACTION_LABELS.eraseTitle}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {ACTION_LABELS.eraseBody}
            </Text>
          </ModalDescription>
          <div className={styles.retained}>
            <Text as="span" size="sm" weight="medium">
              {ACTION_LABELS.retainedHeading}
            </Text>
            <Text as="span" size="sm" color="muted">
              {ACTION_LABELS.retainedNote}
            </Text>
          </div>
          <Textarea
            label={ACTION_LABELS.reasonLabel}
            placeholder={ACTION_LABELS.reasonPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error ? (
            <Text as="span" size="sm" color="destructive">
              {error}
            </Text>
          ) : null}
          <div className={styles.actions}>
            <Button type="button" variant="ghost" size="sm" onClick={close} disabled={erasing}>
              {ACTION_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              loading={erasing}
              disabled={reason.trim().length === 0}
              onClick={handleErase}
            >
              {ACTION_LABELS.eraseConfirm}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
