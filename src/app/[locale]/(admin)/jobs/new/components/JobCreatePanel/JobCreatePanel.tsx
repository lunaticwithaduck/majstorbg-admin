'use client';

import { Link, Text } from '@lunaticwithaduck/webui';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateAdminJobMutation } from '@/api/store';
import { routes } from '@/config/routes';
import JobForm, { type JobFormValues } from '@/ui/components/composed/JobForm/JobForm';
import { CREATE_LABELS } from '../../config/constants';
import styles from './JobCreatePanel.styles';

export default function JobCreatePanel() {
  const router = useRouter();
  const [createJob, { isLoading }] = useCreateAdminJobMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: JobFormValues) => {
    setSubmitError(null);
    try {
      const result = await createJob({
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
      router.push(routes.jobs.detail(result.id));
    } catch {
      setSubmitError(CREATE_LABELS.errorFallback);
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href={routes.jobs.explorer} variant="muted" size="sm" className={styles.backRow}>
          <ChevronLeft size={16} />
          <Text as="span" size="sm">
            {CREATE_LABELS.back}
          </Text>
        </Link>
        <div className={styles.title}>
          <Text as="h1" size="2xl" weight="bold">
            {CREATE_LABELS.heading}
          </Text>
          <Text as="p" size="sm" color="muted">
            {CREATE_LABELS.sub}
          </Text>
        </div>
      </header>

      <JobForm
        submitLabel={CREATE_LABELS.submit}
        onSubmit={handleSubmit}
        onCancel={() => router.push(routes.jobs.explorer)}
        isSubmitting={isLoading}
        submitError={submitError}
      />
    </div>
  );
}
