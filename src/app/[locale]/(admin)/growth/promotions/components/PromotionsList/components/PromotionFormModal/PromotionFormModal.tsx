'use client';

import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalTitle,
  Select,
  SelectItem,
  Text,
} from '@lunaticwithaduck/webui';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import type {
  DiscountType,
  Promotion,
  PromotionStatus,
  PromotionType,
} from '@/api/admin-promotions-endpoints';
import { useCreatePromotionMutation, useUpdatePromotionMutation } from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import {
  DISCOUNT_TYPE_OPTIONS,
  FORM_LABELS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
} from './config/constants';
import styles from './PromotionFormModal.styles';

export default function PromotionFormModal({ promotion }: { promotion?: Promotion }) {
  const [createPromotion, { isLoading: creating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: updating }] = useUpdatePromotionMutation();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<PromotionType>('voucher');
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [value, setValue] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [perUserLimit, setPerUserLimit] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [status, setStatus] = useState<PromotionStatus>('active');
  const [error, setError] = useState<string | null>(null);

  if (!can(PERMISSIONS.promotions)) return null;

  const isEdit = Boolean(promotion);
  const busy = creating || updating;
  const canSubmit = code.trim().length > 0 && value.trim().length > 0;

  const openForm = () => {
    if (promotion) {
      setCode(promotion.code);
      setType(promotion.type);
      setDiscountType(promotion.discountType);
      setValue(
        promotion.discountType === 'fixed'
          ? String(promotion.value / 100)
          : String(promotion.value),
      );
      setMaxRedemptions(promotion.maxRedemptions != null ? String(promotion.maxRedemptions) : '');
      setPerUserLimit(promotion.perUserLimit != null ? String(promotion.perUserLimit) : '');
      setValidFrom((promotion.validFrom ?? '').slice(0, 16));
      setValidTo((promotion.validTo ?? '').slice(0, 16));
      setStatus(promotion.status);
    } else {
      setCode('');
      setType('voucher');
      setDiscountType('percent');
      setValue('');
      setMaxRedemptions('');
      setPerUserLimit('');
      setValidFrom('');
      setValidTo('');
      setStatus('active');
    }
    setError(null);
    setOpen(true);
  };

  const handleOpenChange = (next: boolean) => {
    if (busy) return;
    setOpen(next);
  };

  const handleSave = async () => {
    setError(null);
    const parsedValue = Number.parseFloat(value.replace(',', '.'));
    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      setError(FORM_LABELS.error);
      return;
    }
    const valueNum = discountType === 'fixed' ? Math.round(parsedValue * 100) : parsedValue;
    const max = maxRedemptions.trim() ? Number.parseInt(maxRedemptions, 10) : undefined;
    const perUser = perUserLimit.trim() ? Number.parseInt(perUserLimit, 10) : undefined;
    const input = {
      code: code.trim(),
      type,
      discountType,
      value: valueNum,
      ...(max != null && Number.isFinite(max) ? { maxRedemptions: max } : {}),
      ...(perUser != null && Number.isFinite(perUser) ? { perUserLimit: perUser } : {}),
      ...(validFrom ? { validFrom: new Date(validFrom).toISOString() } : {}),
      ...(validTo ? { validTo: new Date(validTo).toISOString() } : {}),
    };
    try {
      if (promotion) {
        await updatePromotion({ id: promotion.id, ...input, status }).unwrap();
      } else {
        await createPromotion(input).unwrap();
      }
      setOpen(false);
    } catch {
      setError(FORM_LABELS.error);
    }
  };

  return (
    <>
      {isEdit ? (
        <Button type="button" variant="outline" size="sm" iconLeft={Pencil} onClick={openForm}>
          {FORM_LABELS.edit}
        </Button>
      ) : (
        <Button type="button" variant="primary" size="sm" iconLeft={Plus} onClick={openForm}>
          {FORM_LABELS.create}
        </Button>
      )}
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {isEdit ? FORM_LABELS.editTitle : FORM_LABELS.createTitle}
            </Text>
          </ModalTitle>

          <Input
            label={FORM_LABELS.codeLabel}
            placeholder={FORM_LABELS.codePlaceholder}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className={styles.grid}>
            <Select
              label={FORM_LABELS.typeLabel}
              value={type}
              onValueChange={(next) => setType(next as PromotionType)}
            >
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label={FORM_LABELS.discountTypeLabel}
              value={discountType}
              onValueChange={(next) => setDiscountType(next as DiscountType)}
            >
              {DISCOUNT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <Input
            label={FORM_LABELS.valueLabel}
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            suffix={discountType === 'fixed' ? 'EUR' : '%'}
          />
          <div className={styles.grid}>
            <Input
              label={FORM_LABELS.maxRedemptionsLabel}
              type="number"
              inputMode="numeric"
              min={0}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
            />
            <Input
              label={FORM_LABELS.perUserLabel}
              type="number"
              inputMode="numeric"
              min={0}
              value={perUserLimit}
              onChange={(e) => setPerUserLimit(e.target.value)}
            />
          </div>
          <div className={styles.grid}>
            <Input
              label={FORM_LABELS.validFromLabel}
              type="datetime-local"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
            <Input
              label={FORM_LABELS.validToLabel}
              type="datetime-local"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
            />
          </div>
          {isEdit ? (
            <Select
              label={FORM_LABELS.statusLabel}
              value={status}
              onValueChange={(next) => setStatus(next as PromotionStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          ) : null}

          {error ? (
            <Text as="span" size="sm" color="destructive">
              {error}
            </Text>
          ) : null}
          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={busy}
            >
              {FORM_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={busy}
              disabled={!canSubmit}
              onClick={handleSave}
            >
              {FORM_LABELS.save}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
