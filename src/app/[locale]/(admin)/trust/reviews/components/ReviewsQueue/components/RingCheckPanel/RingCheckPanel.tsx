'use client';

import { Badge, Button, Input, Text } from '@lunaticwithaduck/webui';
import { Network } from 'lucide-react';
import { useState } from 'react';
import { useFlagRingMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { RING_LABELS, SIGNAL_BADGE, SIGNAL_LABELS } from './config/constants';
import styles from './RingCheckPanel.styles';

export default function RingCheckPanel() {
  const [flagRing, { data: ring, isLoading, isError }] = useFlagRingMutation();
  const [workerId, setWorkerId] = useState('');

  if (!can(PERMISSIONS.reviews)) return null;

  const handleRun = () => {
    const trimmed = workerId.trim();
    if (trimmed.length === 0) return;
    flagRing({ workerId: trimmed });
  };

  const hasClusters = Boolean(ring && ring.clusters.length > 0);
  const isEmptyResult = Boolean(ring && ring.clusters.length === 0);

  return (
    <section className={styles.root}>
      <Text as="h2" size="lg" weight="semibold" className={styles.title}>
        {RING_LABELS.heading}
      </Text>
      <Text as="p" size="sm" color="muted">
        {RING_LABELS.sub}
      </Text>

      <div className={styles.runRow}>
        <div className={styles.input}>
          <Input
            label={RING_LABELS.workerLabel}
            placeholder={RING_LABELS.workerPlaceholder}
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          iconLeft={Network}
          loading={isLoading}
          disabled={workerId.trim().length === 0}
          onClick={handleRun}
        >
          {RING_LABELS.run}
        </Button>
      </div>

      {isError ? (
        <Text as="span" size="sm" color="destructive">
          {RING_LABELS.error}
        </Text>
      ) : null}
      {isEmptyResult ? (
        <Text as="span" size="sm" color="muted">
          {RING_LABELS.empty}
        </Text>
      ) : null}
      {hasClusters && ring ? (
        <div className={styles.clusters}>
          {ring.clusters.map((cluster) => {
            const participantNames = cluster.participants
              .map((participant) => participant.name)
              .join(', ');
            return (
              <div key={cluster.id} className={styles.cluster}>
                <div className={styles.clusterHead}>
                  <Badge variant={SIGNAL_BADGE[cluster.signal]} size="sm">
                    {SIGNAL_LABELS[cluster.signal]}
                  </Badge>
                  <Text as="span" size="sm" color="muted">
                    {RING_LABELS.riskLabel}
                  </Text>
                  <Text as="span" size="sm" weight="medium">
                    {String(cluster.riskScore)}
                  </Text>
                  <Text as="span" size="sm" color="muted">
                    {RING_LABELS.reviewsLabel}
                  </Text>
                  <Text as="span" size="sm" weight="medium">
                    {String(cluster.reviewCount)}
                  </Text>
                </div>
                <Text as="span" size="sm">
                  {participantNames}
                </Text>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
