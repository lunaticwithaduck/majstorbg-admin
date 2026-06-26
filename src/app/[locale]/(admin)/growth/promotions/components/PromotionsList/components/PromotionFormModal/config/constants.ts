import type {
  DiscountType,
  PromotionStatus,
  PromotionType,
} from '@/api/admin-promotions-endpoints';

export const FORM_LABELS = {
  create: 'New promotion',
  edit: 'Edit',
  createTitle: 'New promotion',
  editTitle: 'Edit promotion',
  codeLabel: 'Code',
  codePlaceholder: 'SUMMER25…',
  typeLabel: 'Type',
  discountTypeLabel: 'Discount type',
  valueLabel: 'Value',
  maxRedemptionsLabel: 'Max redemptions',
  perUserLabel: 'Per-user limit',
  validFromLabel: 'Valid from',
  validToLabel: 'Valid to',
  statusLabel: 'Status',
  save: 'Save',
  cancel: 'Cancel',
  error: 'Could not save the promotion. Check the values and try again.',
} as const;

export const TYPE_OPTIONS: readonly { value: PromotionType; label: string }[] = [
  { value: 'voucher', label: 'Voucher' },
  { value: 'referral', label: 'Referral' },
];

export const DISCOUNT_TYPE_OPTIONS: readonly { value: DiscountType; label: string }[] = [
  { value: 'percent', label: 'Percent (%)' },
  { value: 'fixed', label: 'Fixed (€)' },
];

export const STATUS_OPTIONS: readonly { value: PromotionStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'expired', label: 'Expired' },
  { value: 'disabled', label: 'Disabled' },
];
