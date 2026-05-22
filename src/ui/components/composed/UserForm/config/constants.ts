export const USER_FORM_LABELS = {
  name: 'Name',
  email: 'Email',
  role: 'Role',
  phone: 'Phone',
  rolePlaceholder: 'Select a role',
  phonePlaceholder: 'Optional',
  emailPlaceholder: 'name@example.com',
  namePlaceholder: 'Full name',
  roleWorker: 'Worker',
  roleClient: 'Client',
  submitCreate: 'Create user',
  submitSave: 'Save changes',
  cancel: 'Cancel',
  submitting: 'Saving…',
  errorBanner: 'Something went wrong. Please try again.',
} as const;

export const USER_ROLES = ['worker', 'client'] as const;
export type UserFormRole = (typeof USER_ROLES)[number];
