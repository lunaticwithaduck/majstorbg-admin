'use client';

import { Link, Spinner, Text } from '@lunaticwithaduck/webui';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGetAdminUserQuery, useUpdateAdminUserMutation } from '@/api/store';
import { routes } from '@/config/routes';
import UserForm, { type UserFormValues } from '@/ui/components/composed/UserForm/UserForm';
import { EDIT_LABELS } from './config/constants';
import styles from './UserEditPanel.styles';

export default function UserEditPanel({ userId }: { userId: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetAdminUserQuery(userId);
  const [updateUser, { isLoading: isSaving }] = useUpdateAdminUserMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: UserFormValues) => {
    setSubmitError(null);
    try {
      await updateUser({
        id: userId,
        name: values.name,
        email: values.email,
        role: values.role,
        phone: values.phone,
      }).unwrap();
      router.push(routes.users.detail(userId));
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
          href={routes.users.detail(userId)}
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

      <UserForm
        defaults={{
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
        }}
        submitLabel={EDIT_LABELS.submit}
        onSubmit={handleSubmit}
        onCancel={() => router.push(routes.users.detail(userId))}
        isSubmitting={isSaving}
        submitError={submitError}
      />
    </div>
  );
}
