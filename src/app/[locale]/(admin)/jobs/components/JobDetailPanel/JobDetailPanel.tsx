'use client';

import { Link, Spinner, Text } from '@lunaticwithaduck/webui';
import { ChevronLeft } from 'lucide-react';
import { useGetAdminJobQuery } from '@/api/store';
import { routes } from '@/config/routes';
import { formatBudget, formatDate, shortId } from '../JobsExplorer/utils/format.utils';
import FieldLabel from './components/FieldLabel/FieldLabel';
import FieldValue from './components/FieldValue/FieldValue';
import { DETAIL_LABELS } from './config/constants';
import styles from './JobDetailPanel.styles';

function formatAmount(amount: number, currency: string | null): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function JobDetailPanel({ jobId }: { jobId: string }) {
  const { data, isLoading, isError } = useGetAdminJobQuery(jobId);

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

  if (isError || !data) {
    return (
      <div className={styles.state}>
        <Text as="span" size="sm" color="destructive">
          {DETAIL_LABELS.error}
        </Text>
      </div>
    );
  }

  const escrow = data.escrow;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href={routes.jobs.explorer} variant="muted" size="sm" className={styles.backRow}>
          <ChevronLeft size={16} />
          <Text as="span" size="sm">
            {DETAIL_LABELS.back}
          </Text>
        </Link>
        <div className={styles.title}>
          <Text as="h1" size="2xl" weight="bold">
            {data.title}
          </Text>
          <span className={styles.badge}>
            <Text as="span" size="xs" weight="medium">
              {data.status}
            </Text>
          </span>
        </div>
      </header>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {DETAIL_LABELS.overview}
        </Text>
        <div className={styles.grid}>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.jobId}</FieldLabel>
            <FieldValue>{shortId(data.id)}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.category}</FieldLabel>
            <FieldValue>{data.category}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.client}</FieldLabel>
            <FieldValue>{data.clientName}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.budget}</FieldLabel>
            <FieldValue>{formatBudget(data.budget)}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.city}</FieldLabel>
            <FieldValue>{data.city ?? DETAIL_LABELS.none}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.createdAt}</FieldLabel>
            <FieldValue>{formatDate(data.createdAt)}</FieldValue>
          </div>
        </div>
        <div className={styles.field}>
          <FieldLabel>{DETAIL_LABELS.description}</FieldLabel>
          <Text as="p" size="sm" className={styles.description}>
            {data.description || DETAIL_LABELS.none}
          </Text>
        </div>
      </section>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {DETAIL_LABELS.bidsSection}
        </Text>
        {data.bids.length === 0 ? (
          <Text as="p" size="sm" color="muted">
            {DETAIL_LABELS.bidsEmpty}
          </Text>
        ) : (
          <div className={styles.bidsList}>
            <div className={styles.bidHeader}>
              <Text as="span" size="xs" weight="semibold" color="muted">
                {DETAIL_LABELS.bidColWorker}
              </Text>
              <Text as="span" size="xs" weight="semibold" color="muted">
                {DETAIL_LABELS.bidColAmount}
              </Text>
              <Text as="span" size="xs" weight="semibold" color="muted">
                {DETAIL_LABELS.bidColStatus}
              </Text>
              <Text as="span" size="xs" weight="semibold" color="muted">
                {DETAIL_LABELS.bidColCreatedAt}
              </Text>
            </div>
            {data.bids.map((bid) => (
              <div key={bid.id} className={styles.bidRow}>
                <Text as="span" size="sm">
                  {bid.workerName}
                </Text>
                <Text as="span" size="sm">
                  {formatAmount(bid.amount, bid.currency)}
                </Text>
                <Text as="span" size="sm" color="muted">
                  {bid.status}
                </Text>
                <Text as="span" size="sm" color="muted">
                  {formatDate(bid.createdAt)}
                </Text>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {DETAIL_LABELS.escrowSection}
        </Text>
        {!escrow || escrow.status === 'none' ? (
          <Text as="p" size="sm" color="muted">
            {DETAIL_LABELS.escrowNone}
          </Text>
        ) : (
          <div className={styles.grid}>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.escrowStatus}</FieldLabel>
              <FieldValue>{escrow.status}</FieldValue>
            </div>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.escrowAmount}</FieldLabel>
              <FieldValue>
                {escrow.amount !== null
                  ? formatAmount(escrow.amount, escrow.currency)
                  : DETAIL_LABELS.none}
              </FieldValue>
            </div>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.escrowFundedAt}</FieldLabel>
              <FieldValue>{formatDate(escrow.fundedAt)}</FieldValue>
            </div>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.escrowReleasedAt}</FieldLabel>
              <FieldValue>{formatDate(escrow.releasedAt)}</FieldValue>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
