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
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useListAdminUsersQuery, useSetAdminRoleMutation } from '@/api/store';
import { can } from '@/auth/can';
import { type AdminRole, PERMISSIONS } from '@/auth/permissions';
import { PROMOTE_LABELS, ROLE_OPTIONS } from '../../config/constants';
import styles from './PromoteUserModal.styles';

export default function PromoteUserModal() {
  const [setAdminRole, { isLoading }] = useSetAdminRoleMutation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<AdminRole>('moderator');
  const [error, setError] = useState<string | null>(null);

  const { data: usersData } = useListAdminUsersQuery(
    { page: 1, pageSize: 10, ...(search.trim() ? { search: search.trim() } : {}) },
    { skip: !open },
  );

  if (!can(PERMISSIONS.admins)) return null;

  const users = usersData?.items ?? [];
  const canSubmit = userId.length > 0;

  const reset = () => {
    setSearch('');
    setUserId('');
    setRole('moderator');
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (isLoading) return;
    setOpen(next);
    if (!next) reset();
  };

  const handlePromote = async () => {
    setError(null);
    try {
      await setAdminRole({ id: userId, role }).unwrap();
      setOpen(false);
      reset();
    } catch {
      setError(PROMOTE_LABELS.error);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="sm"
        iconLeft={UserPlus}
        onClick={() => setOpen(true)}
      >
        {PROMOTE_LABELS.trigger}
      </Button>
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {PROMOTE_LABELS.title}
            </Text>
          </ModalTitle>
          <ModalDescription>
            <Text as="span" size="sm" color="muted">
              {PROMOTE_LABELS.body}
            </Text>
          </ModalDescription>
          <Input
            label={PROMOTE_LABELS.searchLabel}
            placeholder={PROMOTE_LABELS.searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setUserId('');
            }}
          />
          <Select
            label={PROMOTE_LABELS.userLabel}
            placeholder={PROMOTE_LABELS.userPlaceholder}
            value={userId}
            onValueChange={setUserId}
          >
            {users.map((user) => {
              const userOption = `${user.name} · ${user.email}`;
              return (
                <SelectItem key={user.id} value={user.id}>
                  {userOption}
                </SelectItem>
              );
            })}
          </Select>
          <Select
            label={PROMOTE_LABELS.roleLabel}
            value={role}
            onValueChange={(next) => setRole(next as AdminRole)}
          >
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
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
              {PROMOTE_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isLoading}
              disabled={!canSubmit}
              onClick={handlePromote}
            >
              {PROMOTE_LABELS.promote}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
