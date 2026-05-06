import { Text } from '@lunaticwithaduck/webui';

export default function FieldLabel({ children }: { children: string }) {
  return (
    <Text as="span" size="xs" weight="semibold" color="muted">
      {children}
    </Text>
  );
}
