'use client';

import { Link, Spinner, Text } from '@lunaticwithaduck/webui';
import type { ActivityEvent } from '@/api/admin-activity-endpoints';
import styles from './ActivityTimeline.styles';
import {
  ACTIVITY_ICON_SIZE,
  ACTIVITY_KIND_META,
  ACTIVITY_TIMELINE_LABELS,
} from './config/constants';

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

type ActivityTimelineProps = {
  events: ActivityEvent[];
  isLoading?: boolean;
  isError?: boolean;
};

export default function ActivityTimeline({ events, isLoading, isError }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className={styles.state}>
        <Spinner />
        <Text as="span" size="sm" color="muted">
          {ACTIVITY_TIMELINE_LABELS.loading}
        </Text>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.state}>
        <Text as="span" size="sm" color="destructive">
          {ACTIVITY_TIMELINE_LABELS.error}
        </Text>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={styles.state}>
        <Text as="span" size="sm" color="muted">
          {ACTIVITY_TIMELINE_LABELS.empty}
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <ul className={styles.list}>
        {events.map((event) => {
          const meta = ACTIVITY_KIND_META[event.kind];
          const IconComponent = meta.icon;
          return (
            <li key={event.id} className={styles.row}>
              <span className={styles.iconWrap}>
                <IconComponent size={ACTIVITY_ICON_SIZE} className={meta.iconClassName} />
              </span>
              <div className={styles.rowBody}>
                <div className={styles.rowHeader}>
                  <Text as="span" size="sm" weight="medium" className={styles.rowTitle}>
                    {event.title}
                  </Text>
                  <div className={styles.rowMeta}>
                    <Text as="span" size="xs" color="muted">
                      {formatTimestamp(event.at)}
                    </Text>
                    {event.href ? (
                      <Link href={event.href} variant="muted" size="sm">
                        <Text as="span" size="xs">
                          {ACTIVITY_TIMELINE_LABELS.view}
                        </Text>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
