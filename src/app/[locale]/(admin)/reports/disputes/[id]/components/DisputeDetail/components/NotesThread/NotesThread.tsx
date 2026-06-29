'use client';

import { Badge, Button, Checkbox, Text, Textarea } from '@lunaticwithaduck/webui';
import { useState } from 'react';
import type { DisputeNote } from '@/api/admin-disputes-endpoints';
import { useAddDisputeNoteMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { formatDateTime } from '@/lib/format.utils';
import { NOTES_LABELS } from './config/constants';
import styles from './NotesThread.styles';

type NotesThreadProps = {
  disputeId: string;
  notes: DisputeNote[];
};

export default function NotesThread({ disputeId, notes }: NotesThreadProps) {
  const [addNote, { isLoading }] = useAddDisputeNoteMutation();
  const [body, setBody] = useState('');
  const [internal, setInternal] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allowed = can(PERMISSIONS.disputes);

  const handleAdd = async () => {
    setError(null);
    try {
      await addNote({ id: disputeId, body: body.trim(), internal }).unwrap();
      setBody('');
    } catch {
      setError(NOTES_LABELS.error);
    }
  };

  return (
    <div className={styles.root}>
      {notes.length === 0 ? (
        <Text as="span" size="sm" color="muted">
          {NOTES_LABELS.empty}
        </Text>
      ) : (
        <div className={styles.list}>
          {notes.map((note) => (
            <div key={note.id} className={styles.item}>
              <div className={styles.itemHead}>
                <Text as="span" size="sm" weight="semibold">
                  {note.authorName}
                </Text>
                <Badge variant={note.internal ? 'secondary' : 'outline'} size="sm">
                  {note.internal ? NOTES_LABELS.internal : NOTES_LABELS.public}
                </Badge>
                <Text as="span" size="sm" color="muted">
                  {formatDateTime(note.createdAt)}
                </Text>
              </div>
              <Text as="p" size="sm">
                {note.body}
              </Text>
            </div>
          ))}
        </div>
      )}

      {allowed ? (
        <div className={styles.composer}>
          <Textarea
            label={NOTES_LABELS.addLabel}
            placeholder={NOTES_LABELS.addPlaceholder}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className={styles.composerFooter}>
            <Checkbox
              label={NOTES_LABELS.internalToggle}
              checked={internal}
              onCheckedChange={(checked) => setInternal(checked === true)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={isLoading}
              disabled={body.trim().length === 0}
              onClick={handleAdd}
            >
              {NOTES_LABELS.add}
            </Button>
          </div>
          {error ? (
            <Text as="span" size="sm" color="destructive">
              {error}
            </Text>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
