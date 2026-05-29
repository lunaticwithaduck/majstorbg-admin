export const JOB_FORM_LABELS = {
  title: 'Title',
  titlePlaceholder: 'Short summary of the work',
  category: 'Category',
  categoryPlaceholder: 'e.g. plumbing, electrical',
  description: 'Description',
  descriptionPlaceholder: 'What needs to be done?',
  status: 'Status',
  statusPlaceholder: 'Select a status',
  statusOpen: 'Open',
  statusAccepted: 'Accepted',
  statusInProgress: 'In progress',
  statusCompleted: 'Completed',
  statusCancelled: 'Cancelled',
  budgetType: 'Budget type',
  budgetTypePlaceholder: 'Select a budget type',
  budgetTypeFixed: 'Fixed',
  budgetTypeHourly: 'Hourly',
  budgetTypeOpen: 'Open',
  budgetAmount: 'Budget amount',
  budgetAmountPlaceholder: '0.00',
  budgetCurrency: 'Currency',
  budgetCurrencyPlaceholder: 'EUR',
  city: 'City',
  cityPlaceholder: 'Optional',
  clientId: 'Client ID',
  clientIdPlaceholder: 'Existing user id',
  clientName: 'Client name',
  clientNamePlaceholder: 'Display name for this client',
  cancel: 'Cancel',
  submitting: 'Saving…',
} as const;

export const JOB_STATUSES = [
  'open',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type JobFormStatus = (typeof JOB_STATUSES)[number];

export const JOB_BUDGET_TYPES = ['fixed', 'hourly', 'open'] as const;
export type JobFormBudgetType = (typeof JOB_BUDGET_TYPES)[number];

export const JOB_FORM_DEFAULT_CURRENCY = 'EUR';
