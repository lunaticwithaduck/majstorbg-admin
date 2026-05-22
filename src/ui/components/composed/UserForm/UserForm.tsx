'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { USER_FORM_LABELS, USER_ROLES, type UserFormRole } from './config/constants';
import styles from './UserForm.styles';

// Zod schema lives here (and not in `./config/constants.ts`) because the
// resolver needs the schema *value*, not just a string constant. Mirrors
// the BE `userRoleEnum` / contact fields exposed by the admin endpoints.
const userFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  role: z.enum(USER_ROLES),
  // Optional in the form, but normalize empty strings to `null` so the BE
  // doesn't see "" and re-interpret it as a set-but-blank value.
  phone: z
    .string()
    .trim()
    .max(40, 'Phone is too long')
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export type UserFormDefaults = {
  name?: string;
  email?: string;
  role?: UserFormRole;
  phone?: string | null;
};

type UserFormProps = {
  defaults?: UserFormDefaults;
  submitLabel: string;
  onSubmit: (values: UserFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
};

export default function UserForm({
  defaults,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: defaults?.name ?? '',
      email: defaults?.email ?? '',
      role: defaults?.role ?? 'client',
      phone: defaults?.phone ?? '',
    },
  });

  return (
    <form className={styles.root} onSubmit={handleSubmit(onSubmit)} noValidate>
      {submitError ? (
        <div className={styles.errorBanner}>
          <Text as="span" size="sm" color="destructive">
            {submitError}
          </Text>
        </div>
      ) : null}

      <div className={styles.grid}>
        <div className={styles.fieldFull}>
          <Input
            label={USER_FORM_LABELS.name}
            placeholder={USER_FORM_LABELS.namePlaceholder}
            variant={errors.name ? 'error' : 'default'}
            disabled={isSubmitting}
            {...register('name')}
          />
          {errors.name ? (
            <Text as="span" size="xs" color="destructive">
              {errors.name.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.field}>
          <Input
            label={USER_FORM_LABELS.email}
            type="email"
            placeholder={USER_FORM_LABELS.emailPlaceholder}
            variant={errors.email ? 'error' : 'default'}
            disabled={isSubmitting}
            {...register('email')}
          />
          {errors.email ? (
            <Text as="span" size="xs" color="destructive">
              {errors.email.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.field}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                label={USER_FORM_LABELS.role}
                placeholder={USER_FORM_LABELS.rolePlaceholder}
                value={field.value}
                onValueChange={(next) => field.onChange(next as UserFormRole)}
                variant={errors.role ? 'error' : 'default'}
                disabled={isSubmitting}
              >
                <SelectItem value="worker">{USER_FORM_LABELS.roleWorker}</SelectItem>
                <SelectItem value="client">{USER_FORM_LABELS.roleClient}</SelectItem>
              </Select>
            )}
          />
          {errors.role ? (
            <Text as="span" size="xs" color="destructive">
              {errors.role.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.fieldFull}>
          <Input
            label={USER_FORM_LABELS.phone}
            type="tel"
            placeholder={USER_FORM_LABELS.phonePlaceholder}
            variant={errors.phone ? 'error' : 'default'}
            disabled={isSubmitting}
            {...register('phone')}
          />
          {errors.phone ? (
            <Text as="span" size="xs" color="destructive">
              {errors.phone.message ?? ''}
            </Text>
          ) : null}
        </div>
      </div>

      <div className={styles.actions}>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
            {USER_FORM_LABELS.cancel}
          </Button>
        ) : null}
        <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
          {isSubmitting ? USER_FORM_LABELS.submitting : submitLabel}
        </Button>
      </div>
    </form>
  );
}
