'use client';

import {
  Badge,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalTitle,
  Text,
  Textarea,
} from '@lunaticwithaduck/webui';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import type { TemplateRow } from '@/api/admin-growth-endpoints';
import { useUpsertTemplateMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { EDITOR_LABELS } from './config/constants';
import styles from './TemplateEditorModal.styles';

export default function TemplateEditorModal({ template }: { template: TemplateRow }) {
  const [upsertTemplate, { isLoading }] = useUpsertTemplateMutation();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [varsText, setVarsText] = useState(template.vars.join(', '));
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.campaigns)) return null;

  const varsList = varsText
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const canSubmit = subject.trim().length > 0 && body.trim().length > 0;

  const openEditor = () => {
    setSubject(template.subject);
    setBody(template.body);
    setVarsText(template.vars.join(', '));
    setError(null);
    setOpen(true);
  };

  const handleOpenChange = (next: boolean) => {
    if (isLoading) return;
    setOpen(next);
  };

  const handleSave = async () => {
    setError(null);
    try {
      await upsertTemplate({
        id: template.id,
        name: template.name,
        channel: template.channel,
        subject: subject.trim(),
        body,
        vars: varsList,
      }).unwrap();
      setOpen(false);
    } catch {
      setError(EDITOR_LABELS.error);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" iconLeft={Pencil} onClick={openEditor}>
        {EDITOR_LABELS.edit}
      </Button>
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {EDITOR_LABELS.title}
            </Text>
          </ModalTitle>

          <Input
            label={EDITOR_LABELS.subjectLabel}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            label={EDITOR_LABELS.bodyLabel}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Input
            label={EDITOR_LABELS.varsLabel}
            placeholder={EDITOR_LABELS.varsPlaceholder}
            value={varsText}
            onChange={(e) => setVarsText(e.target.value)}
          />

          <div className={styles.preview}>
            <Text as="span" size="sm" weight="semibold" color="muted">
              {EDITOR_LABELS.previewHeading}
            </Text>
            <Text as="span" size="sm" weight="bold">
              {subject}
            </Text>
            <Text as="p" size="sm" className={styles.previewBody}>
              {body}
            </Text>
            {varsList.length > 0 ? (
              <div className={styles.vars}>
                {varsList.map((variable) => (
                  <Badge key={variable} variant="outline" size="sm">
                    {variable}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

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
              {EDITOR_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isLoading}
              disabled={!canSubmit}
              onClick={handleSave}
            >
              {EDITOR_LABELS.save}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
