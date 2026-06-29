'use client';

import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
  Select,
  SelectItem,
  Text,
} from '@lunaticwithaduck/webui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type {
  CampaignChannel,
  CampaignSegment,
  SegmentActivity,
  SegmentRole,
} from '@/api/admin-growth-endpoints';
import {
  useCreateCampaignMutation,
  useListAdminJobCategoriesQuery,
  useListTemplatesQuery,
} from '@/api/store';
import { can } from '@/auth/can';
import { PERMISSIONS } from '@/auth/permissions';
import styles from './CreateCampaignModal.styles';
import {
  ACTIVITY_OPTIONS,
  CHANNEL_OPTIONS,
  CREATE_LABELS,
  NONE_CATEGORY,
  ROLE_OPTIONS,
} from './config/constants';

export default function CreateCampaignModal() {
  const [createCampaign, { isLoading }] = useCreateCampaignMutation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<CampaignChannel>('email');
  const [role, setRole] = useState<SegmentRole>('all');
  const [city, setCity] = useState('');
  const [categoryValue, setCategoryValue] = useState(NONE_CATEGORY);
  const [activity, setActivity] = useState<SegmentActivity>('all');
  const [templateId, setTemplateId] = useState('');
  const [scheduleAt, setScheduleAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: templatesData } = useListTemplatesQuery(
    { page: 1, pageSize: 100, channel },
    { skip: !open },
  );
  const { data: categoriesData } = useListAdminJobCategoriesQuery(
    { page: 1, pageSize: 100 },
    { skip: !open },
  );

  if (!can(PERMISSIONS.campaigns)) return null;

  const templates = templatesData?.items ?? [];
  const categories = categoriesData?.items ?? [];
  const canSubmit = name.trim().length > 0 && templateId.length > 0;

  const reset = () => {
    setName('');
    setChannel('email');
    setRole('all');
    setCity('');
    setCategoryValue(NONE_CATEGORY);
    setActivity('all');
    setTemplateId('');
    setScheduleAt('');
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (isLoading) return;
    setOpen(next);
    if (!next) reset();
  };

  const handleChannel = (next: string) => {
    setChannel(next as CampaignChannel);
    setTemplateId('');
  };

  const handleCreate = async () => {
    setError(null);
    const segment: CampaignSegment = {
      role,
      activity,
      ...(city.trim() ? { city: city.trim() } : {}),
      ...(categoryValue !== NONE_CATEGORY ? { categoryId: categoryValue } : {}),
    };
    const scheduleIso = scheduleAt ? new Date(scheduleAt).toISOString() : undefined;
    try {
      await createCampaign({
        name: name.trim(),
        channel,
        segment,
        templateId,
        ...(scheduleIso ? { scheduleAt: scheduleIso } : {}),
      }).unwrap();
      setOpen(false);
      reset();
    } catch {
      setError(CREATE_LABELS.error);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="sm"
        iconLeft={Plus}
        onClick={() => setOpen(true)}
      >
        {CREATE_LABELS.trigger}
      </Button>
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {CREATE_LABELS.title}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {CREATE_LABELS.body}
            </Text>
          </ModalDescription>

          <Input
            label={CREATE_LABELS.nameLabel}
            placeholder={CREATE_LABELS.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select label={CREATE_LABELS.channelLabel} value={channel} onValueChange={handleChannel}>
            {CHANNEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>

          <div className={styles.segment}>
            <Text as="span" size="sm" weight="semibold" color="muted">
              {CREATE_LABELS.segmentHeading}
            </Text>
            <div className={styles.grid}>
              <Select
                label={CREATE_LABELS.roleLabel}
                value={role}
                onValueChange={(next) => setRole(next as SegmentRole)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label={CREATE_LABELS.activityLabel}
                value={activity}
                onValueChange={(next) => setActivity(next as SegmentActivity)}
              >
                {ACTIVITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label={CREATE_LABELS.cityLabel}
                placeholder={CREATE_LABELS.cityPlaceholder}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Select
                label={CREATE_LABELS.categoryLabel}
                value={categoryValue}
                onValueChange={setCategoryValue}
              >
                <SelectItem value={NONE_CATEGORY}>{CREATE_LABELS.anyCategory}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nameBg}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <Select
            label={CREATE_LABELS.templateLabel}
            placeholder={CREATE_LABELS.templatePlaceholder}
            value={templateId}
            onValueChange={setTemplateId}
          >
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </Select>

          <Input
            label={CREATE_LABELS.scheduleLabel}
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
          />

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
              disabled={isLoading}
            >
              {CREATE_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isLoading}
              disabled={!canSubmit}
              onClick={handleCreate}
            >
              {CREATE_LABELS.create}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
