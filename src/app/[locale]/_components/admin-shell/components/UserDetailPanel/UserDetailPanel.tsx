'use client';

import { Button, Link, Spinner, Text } from '@lunaticwithaduck/webui';
import { ChevronLeft, Pencil } from 'lucide-react';
import { useGetAdminUserQuery, useGetUserActivityQuery } from '@/api/store';
import { routes } from '@/config/routes';
import ActivityTimeline from '@/ui/components/composed/ActivityTimeline/ActivityTimeline';
import DeleteUserButton from './components/DeleteUserButton/DeleteUserButton';
import FieldLabel from './components/FieldLabel/FieldLabel';
import FieldValue from './components/FieldValue/FieldValue';
import { DETAIL_LABELS } from './config/constants';
import styles from './UserDetailPanel.styles';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

function formatDate(iso: string | null): string {
  if (!iso) return DETAIL_LABELS.none;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return DETAIL_LABELS.none;
  return dateFormatter.format(d);
}

export default function UserDetailPanel({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useGetAdminUserQuery(userId);
  const {
    data: activity,
    isLoading: activityLoading,
    isError: activityError,
  } = useGetUserActivityQuery({ userId });

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

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href={routes.users.report} variant="muted" size="sm" className={styles.backRow}>
          <ChevronLeft size={16} />
          <Text as="span" size="sm">
            {DETAIL_LABELS.back}
          </Text>
        </Link>
        <div className={styles.titleRow}>
          <div className={styles.titleLeft}>
            <Text as="h1" size="2xl" weight="bold">
              {data.name}
            </Text>
            <span className={styles.badge}>
              <Text as="span" size="xs" weight="medium">
                {data.role}
              </Text>
            </span>
          </div>
          <div className={styles.titleActions}>
            <Button asChild variant="outline" size="sm">
              <Link href={routes.users.edit(data.id)} variant="inherit">
                <Pencil size={14} />
                {DETAIL_LABELS.edit}
              </Link>
            </Button>
            <DeleteUserButton userId={data.id} />
          </div>
        </div>
      </header>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {DETAIL_LABELS.identity}
        </Text>
        <div className={styles.grid}>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.joined}</FieldLabel>
            <FieldValue>{formatDate(data.createdAt)}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.emailVerified}</FieldLabel>
            <FieldValue>{data.emailVerified ? DETAIL_LABELS.yes : DETAIL_LABELS.no}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.phoneVerified}</FieldLabel>
            <FieldValue>
              {data.phoneVerifiedAt ? formatDate(data.phoneVerifiedAt) : DETAIL_LABELS.no}
            </FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.onboarding}</FieldLabel>
            <FieldValue>
              {data.onboardingCompletedAt
                ? formatDate(data.onboardingCompletedAt)
                : DETAIL_LABELS.no}
            </FieldValue>
          </div>
        </div>
      </section>

      {data.workerProfile ? (
        <section className={styles.section}>
          <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
            {DETAIL_LABELS.workerSection}
          </Text>
          <div className={styles.grid}>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.initials}</FieldLabel>
              <FieldValue>{data.workerProfile.initials}</FieldValue>
            </div>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.verified}</FieldLabel>
              <FieldValue>
                {data.workerProfile.verified ? DETAIL_LABELS.yes : DETAIL_LABELS.no}
              </FieldValue>
            </div>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.rating}</FieldLabel>
              <FieldValue>{data.workerProfile.rating.toFixed(2)}</FieldValue>
            </div>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.reviewCount}</FieldLabel>
              <FieldValue>{String(data.workerProfile.reviewCount)}</FieldValue>
            </div>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.completedJobs}</FieldLabel>
              <FieldValue>{String(data.workerProfile.completedJobs)}</FieldValue>
            </div>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.serviceArea}</FieldLabel>
              <FieldValue>{data.workerProfile.serviceArea || DETAIL_LABELS.none}</FieldValue>
            </div>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.specializations}</FieldLabel>
              <FieldValue>
                {data.workerProfile.specializations.length > 0
                  ? data.workerProfile.specializations.join(', ')
                  : DETAIL_LABELS.none}
              </FieldValue>
            </div>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.acceptingWork}</FieldLabel>
              <FieldValue>
                {data.workerProfile.acceptingWork ? DETAIL_LABELS.yes : DETAIL_LABELS.no}
              </FieldValue>
            </div>
          </div>
        </section>
      ) : null}

      {data.clientProfile ? (
        <section className={styles.section}>
          <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
            {DETAIL_LABELS.clientSection}
          </Text>
          <div className={styles.grid}>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.addressLine}</FieldLabel>
              <FieldValue>{data.clientProfile.addressLine ?? DETAIL_LABELS.none}</FieldValue>
            </div>
            <div className={styles.field}>
              <FieldLabel>{DETAIL_LABELS.joined}</FieldLabel>
              <FieldValue>{formatDate(data.clientProfile.createdAt)}</FieldValue>
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {DETAIL_LABELS.countsSection}
        </Text>
        <div className={styles.grid}>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.jobsAsClient}</FieldLabel>
            <FieldValue>{String(data.counts.jobsAsClient)}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.bidsAsWorker}</FieldLabel>
            <FieldValue>{String(data.counts.bidsAsWorker)}</FieldValue>
          </div>
          <div className={styles.field}>
            <FieldLabel>{DETAIL_LABELS.addresses}</FieldLabel>
            <FieldValue>{String(data.counts.addresses)}</FieldValue>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {DETAIL_LABELS.activitySection}
        </Text>
        <ActivityTimeline
          events={activity?.events ?? []}
          isLoading={activityLoading}
          isError={activityError}
        />
      </section>
    </div>
  );
}
