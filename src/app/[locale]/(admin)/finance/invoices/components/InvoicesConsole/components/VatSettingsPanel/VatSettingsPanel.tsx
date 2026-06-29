'use client';

import { Button, Checkbox, Input, Spinner, Text } from '@lunaticwithaduck/webui';
import { useEffect, useState } from 'react';
import { useGetVatSettingsQuery, useSetVatSettingsMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import { MAX_RATE, MIN_RATE, VAT_LABELS } from './config/constants';
import styles from './VatSettingsPanel.styles';

export default function VatSettingsPanel() {
  const { data, isLoading, isError } = useGetVatSettingsQuery();
  const [setVatSettings, { isLoading: saving }] = useSetVatSettingsMutation();
  const [rate, setRate] = useState('');
  const [registered, setRegistered] = useState(false);
  const [vatId, setVatId] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setRate(String(data.ratePct));
      setRegistered(data.registered);
      setVatId(data.vatId ?? '');
    }
  }, [data]);

  const editable = can(PERMISSIONS.invoices);

  if (isLoading) {
    return (
      <section className={styles.root}>
        <div className={styles.state}>
          <Spinner />
          <Text as="span" size="sm" color="muted">
            {VAT_LABELS.loading}
          </Text>
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className={styles.root}>
        <Text as="span" size="sm" color="destructive">
          {VAT_LABELS.loadError}
        </Text>
      </section>
    );
  }

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    const parsed = Number.parseFloat(rate.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed < MIN_RATE || parsed > MAX_RATE) {
      setError(VAT_LABELS.invalid);
      return;
    }
    try {
      await setVatSettings({
        ratePct: parsed,
        registered,
        ...(vatId.trim() ? { vatId: vatId.trim() } : {}),
      }).unwrap();
      setSaved(true);
    } catch {
      setError(VAT_LABELS.error);
    }
  };

  return (
    <section className={styles.root}>
      <Text as="h2" size="lg" weight="semibold" className={styles.title}>
        {VAT_LABELS.sectionTitle}
      </Text>
      <div className={styles.grid}>
        <Input
          label={VAT_LABELS.rateLabel}
          type="number"
          inputMode="decimal"
          min={MIN_RATE}
          max={MAX_RATE}
          step={0.1}
          value={rate}
          onChange={(e) => {
            setRate(e.target.value);
            setSaved(false);
          }}
          suffix="%"
          disabled={!editable}
        />
        <Input
          label={VAT_LABELS.vatIdLabel}
          placeholder={VAT_LABELS.vatIdPlaceholder}
          value={vatId}
          onChange={(e) => {
            setVatId(e.target.value);
            setSaved(false);
          }}
          disabled={!editable}
        />
      </div>
      <Checkbox
        label={VAT_LABELS.registeredLabel}
        checked={registered}
        onCheckedChange={(checked) => {
          setRegistered(checked === true);
          setSaved(false);
        }}
        disabled={!editable}
      />
      {editable ? (
        <div className={styles.footer}>
          <Button type="button" variant="primary" size="sm" loading={saving} onClick={handleSave}>
            {VAT_LABELS.save}
          </Button>
          {saved ? (
            <Text as="span" size="sm" color="success">
              {VAT_LABELS.saved}
            </Text>
          ) : null}
          {error ? (
            <Text as="span" size="sm" color="destructive">
              {error}
            </Text>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
