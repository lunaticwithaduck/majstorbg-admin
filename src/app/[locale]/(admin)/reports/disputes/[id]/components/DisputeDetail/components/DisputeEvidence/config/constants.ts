export const EVIDENCE_LABELS = {
  empty: 'No chat or photo evidence attached yet.',
  photos: 'Photos',
  photoFallback: 'View photo',
  chat: 'Chat excerpt',
} as const;

export const CHAT_AUTHOR_LABELS: Record<string, string> = {
  client: 'Client',
  worker: 'Worker',
};
