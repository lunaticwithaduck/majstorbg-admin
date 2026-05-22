import { Text } from '@lunaticwithaduck/webui';

export default function FieldValue({ children }: { children: string }) {
  return (
    <Text as="span" size="sm">
      {children}
    </Text>
  );
}
