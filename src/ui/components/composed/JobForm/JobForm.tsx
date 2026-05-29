'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, SelectItem, Text, Textarea } from '@lunaticwithaduck/webui';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  JOB_BUDGET_TYPES,
  JOB_FORM_DEFAULT_CURRENCY,
  JOB_FORM_LABELS,
  JOB_STATUSES,
  type JobFormBudgetType,
  type JobFormStatus,
} from './config/constants';
import styles from './JobForm.styles';

// Schema lives alongside the component because the resolver needs the
// value, not a string constant. Currency / status / budget-type enums
// mirror the admin job endpoint shape — keep in sync when BE lands.
const jobFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160, 'Title is too long'),
  category: z.string().trim().min(1, 'Category is required').max(80, 'Category is too long'),
  description: z.string().trim().max(2000, 'Description is too long'),
  status: z.enum(JOB_STATUSES),
  budgetType: z.enum(JOB_BUDGET_TYPES),
  // Accept the raw input as string in the form; coerce + validate to a
  // non-negative number for the BE. Empty string fails as expected.
  budgetAmount: z.coerce
    .number({ error: 'Enter a valid amount' })
    .nonnegative('Amount must be zero or greater')
    .max(1_000_000_000, 'Amount is too large'),
  budgetCurrency: z
    .string()
    .trim()
    .min(1, 'Currency is required')
    .max(8, 'Currency code is too long'),
  city: z
    .string()
    .trim()
    .max(80, 'City is too long')
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  clientId: z.string().trim().min(1, 'Client id is required').max(120, 'Client id is too long'),
  clientName: z
    .string()
    .trim()
    .min(1, 'Client name is required')
    .max(120, 'Client name is too long'),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

export type JobFormDefaults = {
  title?: string;
  category?: string;
  description?: string;
  status?: JobFormStatus;
  budgetType?: JobFormBudgetType;
  budgetAmount?: number;
  budgetCurrency?: string;
  city?: string | null;
  clientId?: string;
  clientName?: string;
};

type JobFormProps = {
  defaults?: JobFormDefaults;
  submitLabel: string;
  onSubmit: (values: JobFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
};

export default function JobForm({
  defaults,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}: JobFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: defaults?.title ?? '',
      category: defaults?.category ?? '',
      description: defaults?.description ?? '',
      status: defaults?.status ?? 'open',
      budgetType: defaults?.budgetType ?? 'fixed',
      budgetAmount: defaults?.budgetAmount ?? 0,
      budgetCurrency: defaults?.budgetCurrency ?? JOB_FORM_DEFAULT_CURRENCY,
      city: defaults?.city ?? '',
      clientId: defaults?.clientId ?? '',
      clientName: defaults?.clientName ?? '',
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
            label={JOB_FORM_LABELS.title}
            placeholder={JOB_FORM_LABELS.titlePlaceholder}
            variant={errors.title ? 'error' : 'default'}
            disabled={isSubmitting}
            {...register('title')}
          />
          {errors.title ? (
            <Text as="span" size="xs" color="destructive">
              {errors.title.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.field}>
          <Input
            label={JOB_FORM_LABELS.category}
            placeholder={JOB_FORM_LABELS.categoryPlaceholder}
            variant={errors.category ? 'error' : 'default'}
            disabled={isSubmitting}
            {...register('category')}
          />
          {errors.category ? (
            <Text as="span" size="xs" color="destructive">
              {errors.category.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.field}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label={JOB_FORM_LABELS.status}
                placeholder={JOB_FORM_LABELS.statusPlaceholder}
                value={field.value}
                onValueChange={(next) => field.onChange(next as JobFormStatus)}
                variant={errors.status ? 'error' : 'default'}
                disabled={isSubmitting}
              >
                <SelectItem value="open">{JOB_FORM_LABELS.statusOpen}</SelectItem>
                <SelectItem value="accepted">{JOB_FORM_LABELS.statusAccepted}</SelectItem>
                <SelectItem value="in_progress">{JOB_FORM_LABELS.statusInProgress}</SelectItem>
                <SelectItem value="completed">{JOB_FORM_LABELS.statusCompleted}</SelectItem>
                <SelectItem value="cancelled">{JOB_FORM_LABELS.statusCancelled}</SelectItem>
              </Select>
            )}
          />
          {errors.status ? (
            <Text as="span" size="xs" color="destructive">
              {errors.status.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.fieldFull}>
          <Textarea
            label={JOB_FORM_LABELS.description}
            placeholder={JOB_FORM_LABELS.descriptionPlaceholder}
            variant={errors.description ? 'error' : 'default'}
            disabled={isSubmitting}
            rows={4}
            {...register('description')}
          />
          {errors.description ? (
            <Text as="span" size="xs" color="destructive">
              {errors.description.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.field}>
          <Controller
            name="budgetType"
            control={control}
            render={({ field }) => (
              <Select
                label={JOB_FORM_LABELS.budgetType}
                placeholder={JOB_FORM_LABELS.budgetTypePlaceholder}
                value={field.value}
                onValueChange={(next) => field.onChange(next as JobFormBudgetType)}
                variant={errors.budgetType ? 'error' : 'default'}
                disabled={isSubmitting}
              >
                <SelectItem value="fixed">{JOB_FORM_LABELS.budgetTypeFixed}</SelectItem>
                <SelectItem value="hourly">{JOB_FORM_LABELS.budgetTypeHourly}</SelectItem>
                <SelectItem value="open">{JOB_FORM_LABELS.budgetTypeOpen}</SelectItem>
              </Select>
            )}
          />
          {errors.budgetType ? (
            <Text as="span" size="xs" color="destructive">
              {errors.budgetType.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.field}>
          <Input
            label={JOB_FORM_LABELS.budgetAmount}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder={JOB_FORM_LABELS.budgetAmountPlaceholder}
            variant={errors.budgetAmount ? 'error' : 'default'}
            disabled={isSubmitting}
            {...register('budgetAmount')}
          />
          {errors.budgetAmount ? (
            <Text as="span" size="xs" color="destructive">
              {errors.budgetAmount.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.field}>
          <Input
            label={JOB_FORM_LABELS.budgetCurrency}
            placeholder={JOB_FORM_LABELS.budgetCurrencyPlaceholder}
            variant={errors.budgetCurrency ? 'error' : 'default'}
            disabled={isSubmitting}
            {...register('budgetCurrency')}
          />
          {errors.budgetCurrency ? (
            <Text as="span" size="xs" color="destructive">
              {errors.budgetCurrency.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.field}>
          <Input
            label={JOB_FORM_LABELS.city}
            placeholder={JOB_FORM_LABELS.cityPlaceholder}
            variant={errors.city ? 'error' : 'default'}
            disabled={isSubmitting}
            {...register('city')}
          />
          {errors.city ? (
            <Text as="span" size="xs" color="destructive">
              {errors.city.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.field}>
          <Input
            label={JOB_FORM_LABELS.clientId}
            placeholder={JOB_FORM_LABELS.clientIdPlaceholder}
            variant={errors.clientId ? 'error' : 'default'}
            disabled={isSubmitting}
            {...register('clientId')}
          />
          {errors.clientId ? (
            <Text as="span" size="xs" color="destructive">
              {errors.clientId.message ?? ''}
            </Text>
          ) : null}
        </div>

        <div className={styles.field}>
          <Input
            label={JOB_FORM_LABELS.clientName}
            placeholder={JOB_FORM_LABELS.clientNamePlaceholder}
            variant={errors.clientName ? 'error' : 'default'}
            disabled={isSubmitting}
            {...register('clientName')}
          />
          {errors.clientName ? (
            <Text as="span" size="xs" color="destructive">
              {errors.clientName.message ?? ''}
            </Text>
          ) : null}
        </div>
      </div>

      <div className={styles.actions}>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
            {JOB_FORM_LABELS.cancel}
          </Button>
        ) : null}
        <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
          {isSubmitting ? JOB_FORM_LABELS.submitting : submitLabel}
        </Button>
      </div>
    </form>
  );
}
