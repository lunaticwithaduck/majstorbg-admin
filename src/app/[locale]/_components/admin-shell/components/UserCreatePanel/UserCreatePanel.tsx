'use client';

import { Link, Text } from '@lunaticwithaduck/webui';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateAdminUserMutation } from '@/api/store';
import { routes } from '@/config/routes';
import UserForm, { type UserFormValues } from '@/ui/components/composed/UserForm/UserForm';
import { CREATE_LABELS } from './config/constants';
import styles from './UserCreatePanel.styles';

export default function UserCreatePanel() {
  const router = useRouter();
  const [createUser, { isLoading }] = useCreateAdminUserMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: UserFormValues) => {
    setSubmitError(null);
    try {
      // `phone` is normalised by the schema to `string | null`. Forward the
      // exact shape the BE mutation contract expects (no empty strings).
      const result = await createUser({
        name: values.name,
        email: values.email,
        role: values.role,
        phone: values.phone,
      }).unwrap();
      router.push(routes.users.detail(result.id));
    } catch {
      setSubmitError(CREATE_LABELS.errorFallback);
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href={routes.users.report} variant="muted" size="sm" className={styles.backRow}>
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

      <UserForm
        submitLabel={CREATE_LABELS.submit}
        onSubmit={handleSubmit}
        onCancel={() => router.push(routes.users.report)}
        isSubmitting={isLoading}
        submitError={submitError}
      />
    </div>
  );
}
