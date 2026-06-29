'use client';

import { Link, Text } from '@lunaticwithaduck/webui';
import { Paperclip } from 'lucide-react';
import type { DisputeChatMessage, DisputePhoto } from '@/api/admin-disputes-endpoints';
import { formatDateTime } from '@/lib/format.utils';
import { CHAT_AUTHOR_LABELS, EVIDENCE_LABELS } from './config/constants';
import styles from './DisputeEvidence.styles';

type DisputeEvidenceProps = {
  photos?: DisputePhoto[] | undefined;
  chat?: DisputeChatMessage[] | undefined;
};

export default function DisputeEvidence({ photos, chat }: DisputeEvidenceProps) {
  const hasPhotos = (photos?.length ?? 0) > 0;
  const hasChat = (chat?.length ?? 0) > 0;

  if (!hasPhotos && !hasChat) {
    return (
      <Text as="span" size="sm" color="muted">
        {EVIDENCE_LABELS.empty}
      </Text>
    );
  }

  return (
    <div className={styles.root}>
      {hasPhotos ? (
        <div className={styles.block}>
          <Text as="h3" size="sm" weight="semibold" color="muted">
            {EVIDENCE_LABELS.photos}
          </Text>
          <div className={styles.photoList}>
            {photos?.map((photo) => (
              <Link key={photo.id} href={photo.url} external variant="muted" size="sm">
                <Paperclip size={14} />
                {photo.caption ?? EVIDENCE_LABELS.photoFallback}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {hasChat ? (
        <div className={styles.block}>
          <Text as="h3" size="sm" weight="semibold" color="muted">
            {EVIDENCE_LABELS.chat}
          </Text>
          <div className={styles.chat}>
            {chat?.map((message) => (
              <div key={message.id} className={styles.message}>
                <div className={styles.messageHead}>
                  <Text as="span" size="sm" weight="medium">
                    {CHAT_AUTHOR_LABELS[message.author]}
                  </Text>
                  <Text as="span" size="sm" color="muted">
                    {formatDateTime(message.at)}
                  </Text>
                </div>
                <Text as="p" size="sm">
                  {message.body}
                </Text>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
