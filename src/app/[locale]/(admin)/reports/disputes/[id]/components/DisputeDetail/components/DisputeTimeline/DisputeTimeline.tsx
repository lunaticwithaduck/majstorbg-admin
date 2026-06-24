import { Badge, Text } from '@lunaticwithaduck/webui';
import type { DisputeTimelineEntry } from '@/api/admin-disputes-endpoints';
import { ACTOR_LABELS, DETAIL_LABELS } from '../../config/constants';
import styles from './DisputeTimeline.styles';

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return timestampFormatter.format(d);
}

type DisputeTimelineProps = { entries: DisputeTimelineEntry[] };

export default function DisputeTimeline({ entries }: DisputeTimelineProps) {
  if (entries.length === 0) {
    return (
      <Text as="p" size="sm" color="muted">
        {DETAIL_LABELS.timelineEmpty}
      </Text>
    );
  }

  return (
    <ol className={styles.list}>
      {entries.map((entry, index) => (
        <li key={`${entry.at}-${index}`} className={styles.row}>
          <span className={styles.dot} aria-hidden />
          <div className={styles.body}>
            <div className={styles.head}>
              <Badge variant="outline" size="sm">
                {ACTOR_LABELS[entry.actor]}
              </Badge>
              <Text as="span" size="xs" color="muted">
                {formatTimestamp(entry.at)}
              </Text>
            </div>
            <Text as="p" size="sm">
              {entry.summary}
            </Text>
          </div>
        </li>
      ))}
    </ol>
  );
}
