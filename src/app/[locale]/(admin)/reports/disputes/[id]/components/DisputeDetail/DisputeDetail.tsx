'use client';

import { Badge, Button, Link, Spinner, Text } from '@lunaticwithaduck/webui';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { useGetDisputeQuery } from '@/api/store';
import { routes } from '@/config/routes';
import { formatEur } from '@/lib/format.utils';
import DisputeActions from './components/DisputeActions/DisputeActions';
import DisputeEvidence from './components/DisputeEvidence/DisputeEvidence';
import DisputeTimeline from './components/DisputeTimeline/DisputeTimeline';
import FieldLabel from './components/FieldLabel/FieldLabel';
import FieldValue from './components/FieldValue/FieldValue';
import NotesThread from './components/NotesThread/NotesThread';
import ResolutionPanel from './components/ResolutionPanel/ResolutionPanel';
import {
  DETAIL_LABELS,
  STATUS_BADGE_VARIANT,
  STATUS_LABELS,
  TYPE_LABELS,
} from './config/constants';
import styles from './DisputeDetail.styles';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(iso: string | null | undefined): string {
  if (!iso) return DETAIL_LABELS.none;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return DETAIL_LABELS.none;
  return dateFormatter.format(d);
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function DisputeDetail({ disputeId }: { disputeId: string }) {
  const { data, isLoading, isError } = useGetDisputeQuery(disputeId);

  if (isLoading) {
    return (
      <div className={styles.state}>
        <Spinner />
        <Text as="span" size="sm" color="muted">
          {DETAIL_LABELS.loading}
        </Text>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.state}>
        <Text as="span" size="sm" color="destructive">
          {DETAIL_LABELS.error}
        </Text>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.state}>
        <Text as="span" size="sm" color="muted">
          {DETAIL_LABELS.notFound}
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href={routes.reports.disputes} variant="muted" size="sm" className={styles.backRow}>
          <ChevronLeft size={16} />
          <Text as="span" size="sm">
            {DETAIL_LABELS.back}
          </Text>
        </Link>
        <div className={styles.titleRow}>
          <div className={styles.titleLeft}>
            <Text as="h1" size="2xl" weight="bold">
              {data.jobTitle}
            </Text>
            <Badge variant={STATUS_BADGE_VARIANT[data.status]} size="sm">
              {STATUS_LABELS[data.status]}
            </Badge>
          </div>
          <div className={styles.headerActions}>
            <DisputeActions disputeId={disputeId} status={data.status} />
            <Button asChild variant="outline" size="sm">
              <Link href={routes.jobs.detail(data.jobId)} variant="inherit">
                <ExternalLink size={14} />
                {DETAIL_LABELS.viewJob}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {DETAIL_LABELS.overview}
        </Text>
        <div className={styles.grid}>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.disputeId}</FieldLabel>
            <FieldValue>{data.id}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.type}</FieldLabel>
            <span className={styles.badgeCell}>
              <Badge variant="outline" size="sm">
                {TYPE_LABELS[data.type]}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.status}</FieldLabel>
            <span className={styles.badgeCell}>
              <Badge variant={STATUS_BADGE_VARIANT[data.status]} size="sm">
                {STATUS_LABELS[data.status]}
              </Badge>
            </span>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.amount}</FieldLabel>
            <FieldValue>{formatMoney(data.escrowAmount, data.currency)}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.job}</FieldLabel>
            <FieldValue>{data.jobTitle}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.worker}</FieldLabel>
            <FieldValue>{data.workerName}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.assignedTo}</FieldLabel>
            <FieldValue>{data.assignedToName ?? DETAIL_LABELS.unassigned}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.created}</FieldLabel>
            <FieldValue>{formatDate(data.createdAt)}</FieldValue>
          </div>
          {data.payment ? (
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.heldEscrow}</FieldLabel>
              <FieldValue>{formatEur(data.payment.heldCents)}</FieldValue>
            </div>
          ) : null}
          {data.payment?.releasedCents != null ? (
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.released}</FieldLabel>
              <FieldValue>{formatEur(data.payment.releasedCents)}</FieldValue>
            </div>
          ) : null}
          {data.payment?.refundedCents != null ? (
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.refunded}</FieldLabel>
              <FieldValue>{formatEur(data.payment.refundedCents)}</FieldValue>
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {DETAIL_LABELS.resolutionSection}
        </Text>
        <ResolutionPanel dispute={data} />
      </section>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {DETAIL_LABELS.evidenceSection}
        </Text>
        <DisputeEvidence photos={data.photos} chat={data.chat} />
      </section>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {DETAIL_LABELS.notesSection}
        </Text>
        <NotesThread disputeId={disputeId} notes={data.notes ?? []} />
      </section>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {DETAIL_LABELS.timelineSection}
        </Text>
        <DisputeTimeline entries={data.timeline} />
      </section>
    </div>
  );
}
