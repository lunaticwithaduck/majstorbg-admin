'use client';

import { Link, Spinner, Text } from '@lunaticwithaduck/webui';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGetAdminJobQuery, useUpdateAdminJobMutation } from '@/api/store';
import { routes } from '@/config/routes';
import JobForm, { type JobFormValues } from '@/ui/components/composed/JobForm/JobForm';
import { EDIT_LABELS } from '../../config/constants';
import styles from './JobEditPanel.styles';

export default function JobEditPanel({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetAdminJobQuery(jobId);
  const [updateJob, { isLoading: isSaving }] = useUpdateAdminJobMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: JobFormValues) => {
    setSubmitError(null);
    try {
      await updateJob({
        id: jobId,
        title: values.title,
        category: values.category,
        description: values.description,
        status: values.status,
        budget: {
          type: values.budgetType,
          amount: values.budgetAmount,
          currency: values.budgetCurrency,
        },
        city: values.city,
        clientId: values.clientId,
        clientName: values.clientName,
      }).unwrap();
      router.push(routes.jobs.detail(jobId));
    } catch {
      setSubmitError(EDIT_LABELS.saveError);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.state}>
        <Spinner />
        <Text as="span" size="sm" color="muted">
          {EDIT_LABELS.loading}
        </Text>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.state}>
        <Text as="span" size="sm" color="destructive">
          {EDIT_LABELS.loadError}
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link
          href={routes.jobs.detail(jobId)}
          variant="muted"
          size="sm"
          className={styles.backRow}
        >
          <ChevronLeft size={16} />
          <Text as="span" size="sm">
            {EDIT_LABELS.back}
          </Text>
        </Link>
        <div className={styles.title}>
          <Text as="h1" size="2xl" weight="bold">
            {EDIT_LABELS.heading}
          </Text>
          <Text as="p" size="sm" color="muted">
            {EDIT_LABELS.sub}
          </Text>
        </div>
      </header>

      <JobForm
        defaults={{
          title: data.title,
          category: data.category,
          description: data.description,
          status: data.status,
          budgetType: data.budget.type,
          budgetAmount: data.budget.amount,
          budgetCurrency: data.budget.currency,
          city: data.city,
          clientId: data.clientId,
          clientName: data.clientName,
        }}
        submitLabel={EDIT_LABELS.submit}
        onSubmit={handleSubmit}
        onCancel={() => router.push(routes.jobs.detail(jobId))}
        isSubmitting={isSaving}
        submitError={submitError}
      />
    </div>
  );
}
