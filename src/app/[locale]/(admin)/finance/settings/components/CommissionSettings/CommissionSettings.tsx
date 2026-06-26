'use client';

import { Button, Input, Spinner, Text } from '@lunaticwithaduck/webui';
import { useEffect, useState } from 'react';
import { useGetCommissionQuery, useSetCommissionMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import styles from './CommissionSettings.styles';
import { COMMISSION_LABELS, MAX_RATE, MIN_RATE } from './config/constants';

function parseRate(value: string): number {
  return Number.parseFloat(value.replace(',', '.'));
}

export default function CommissionSettings() {
  const { data, isLoading, isError } = useGetCommissionQuery();
  const [setCommission, { isLoading: saving }] = useSetCommissionMutation();
  const [takeRate, setTakeRate] = useState('');
  const [rates, setRates] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setTakeRate(String(data.takeRatePct));
      setRates(
        Object.fromEntries(data.perCategory.map((c) => [c.categoryId, String(c.takeRatePct)])),
      );
    }
  }, [data]);

  const editable = can(PERMISSIONS.finance);

  if (isLoading) {
    return (
      <div className={styles.state}>
        <Spinner />
        <Text as="span" size="sm" color="muted">
          {COMMISSION_LABELS.loading}
        </Text>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.state}>
        <Text as="span" size="sm" color="destructive">
          {COMMISSION_LABELS.error}
        </Text>
      </div>
    );
  }

  const onGlobalChange = (value: string) => {
    setTakeRate(value);
    setSaved(false);
  };

  const onCategoryChange = (categoryId: string, value: string) => {
    setRates((prev) => ({ ...prev, [categoryId]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    const rate = parseRate(takeRate);
    if (!Number.isFinite(rate) || rate < MIN_RATE || rate > MAX_RATE) {
      setError(COMMISSION_LABELS.invalid);
      return;
    }
    // Per-category rates get the same range check as the global rate. A blank
    // field leaves that category's rate untouched — clearing it must never
    // silently write 0% (which would zero the platform's take on that category).
    const perCategory: typeof data.perCategory = [];
    for (const c of data.perCategory) {
      const raw = (rates[c.categoryId] ?? '').trim();
      if (raw === '') {
        perCategory.push({ ...c });
        continue;
      }
      const parsed = parseRate(raw);
      if (!Number.isFinite(parsed) || parsed < MIN_RATE || parsed > MAX_RATE) {
        setError(COMMISSION_LABELS.invalid);
        return;
      }
      perCategory.push({ ...c, takeRatePct: parsed });
    }
    try {
      await setCommission({ takeRatePct: rate, perCategory }).unwrap();
      setSaved(true);
    } catch {
      setError(COMMISSION_LABELS.saveError);
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {COMMISSION_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {COMMISSION_LABELS.pageSub}
        </Text>
      </header>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {COMMISSION_LABELS.globalSection}
        </Text>
        <div className={styles.field}>
          <Input
            label={COMMISSION_LABELS.globalLabel}
            type="number"
            inputMode="decimal"
            min={MIN_RATE}
            max={MAX_RATE}
            step={0.1}
            value={takeRate}
            onChange={(e) => onGlobalChange(e.target.value)}
            suffix="%"
            disabled={!editable}
          />
        </div>
      </section>

      <section className={styles.section}>
        <Text as="h2" size="lg" weight="semibold" className={styles.sectionTitle}>
          {COMMISSION_LABELS.perCategorySection}
        </Text>
        {data.perCategory.length === 0 ? (
          <Text as="span" size="sm" color="muted">
            {COMMISSION_LABELS.perCategoryEmpty}
          </Text>
        ) : (
          data.perCategory.map((category) => (
            <div key={category.categoryId} className={styles.categoryRow}>
              <Text as="span" size="sm" className={styles.categoryName}>
                {category.categoryName}
              </Text>
              <div className={styles.categoryInput}>
                <Input
                  label={COMMISSION_LABELS.rateLabel}
                  hiddenLabel
                  type="number"
                  inputMode="decimal"
                  min={MIN_RATE}
                  max={MAX_RATE}
                  step={0.1}
                  value={rates[category.categoryId] ?? ''}
                  onChange={(e) => onCategoryChange(category.categoryId, e.target.value)}
                  suffix="%"
                  disabled={!editable}
                />
              </div>
            </div>
          ))
        )}
      </section>

      {editable ? (
        <div className={styles.footer}>
          <Button type="button" variant="primary" size="sm" loading={saving} onClick={handleSave}>
            {COMMISSION_LABELS.save}
          </Button>
          {saved ? (
            <Text as="span" size="sm" color="success">
              {COMMISSION_LABELS.saved}
            </Text>
          ) : null}
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
