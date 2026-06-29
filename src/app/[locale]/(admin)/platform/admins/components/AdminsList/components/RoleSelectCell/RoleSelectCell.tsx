'use client';

import {
  Badge,
  Button,
  Modal,
  ModalContent,
  ModalTitle,
  Select,
  SelectItem,
  Text,
} from '@lunaticwithaduck/webui';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import type { AdminRow } from '@/api/admin-platform-endpoints';
import { useSetAdminRoleMutation } from '@/api/store';
import { can } from '@/auth/can';
import { type AdminRole, PERMISSIONS } from '@/auth/permissions';
import { ROLE_BADGE, ROLE_CELL_LABELS, ROLE_LABELS, ROLE_OPTIONS } from '../../config/constants';
import styles from './RoleSelectCell.styles';

export default function RoleSelectCell({ admin }: { admin: AdminRow }) {
  const [setAdminRole, { isLoading }] = useSetAdminRoleMutation();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<AdminRole>(admin.role);
  const [error, setError] = useState<string | null>(null);

  const allowed = can(PERMISSIONS.admins);

  const openModal = () => {
    setRole(admin.role);
    setError(null);
    setOpen(true);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setError(null);
    if (!isLoading) setOpen(next);
  };

  const handleSave = async () => {
    setError(null);
    try {
      await setAdminRole({ id: admin.id, role }).unwrap();
      setOpen(false);
    } catch {
      setError(ROLE_CELL_LABELS.error);
    }
  };

  return (
    <div className={styles.root}>
      <Badge variant={ROLE_BADGE[admin.role]} size="sm">
        {ROLE_LABELS[admin.role]}
      </Badge>
      {allowed ? (
        <Button type="button" variant="ghost" size="sm" iconLeft={Pencil} onClick={openModal}>
          {ROLE_CELL_LABELS.change}
        </Button>
      ) : null}

      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent className={styles.modalContent}>
          <ModalTitle>
            <Text as="span" size="lg" weight="bold">
              {ROLE_CELL_LABELS.title}
            </Text>
          </ModalTitle>
          <Text as="span" size="sm" color="muted">
            {admin.name}
          </Text>
          <Select
            label={ROLE_CELL_LABELS.roleLabel}
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
              {ROLE_CELL_LABELS.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isLoading}
              disabled={role === admin.role}
              onClick={handleSave}
            >
              {ROLE_CELL_LABELS.save}
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
